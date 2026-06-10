"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSalaryRecord = exports.getStaffSalaryHistory = exports.getSalaryRecord = exports.disburseSalary = exports.upsertStaffProfile = exports.getAllStaffSalaries = void 0;
const prisma_1 = __importDefault(require("../prisma"));
// GET all staff with their salary profiles
const getAllStaffSalaries = async (req, res) => {
    try {
        const staff = await prisma_1.default.user.findMany({
            where: { role: { in: ['TEACHER', 'ADMIN', 'ACCOUNTANT'] } },
            include: {
                staffProfile: {
                    include: {
                        salaryRecords: { orderBy: { paidAt: 'desc' }, take: 5 }
                    }
                }
            }
        });
        res.json(staff);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getAllStaffSalaries = getAllStaffSalaries;
// CREATE or UPDATE staff salary profile
const upsertStaffProfile = async (req, res) => {
    try {
        const { userId, designation, department, baseSalary, bankAccount, ifscCode } = req.body;
        const profile = await prisma_1.default.staffProfile.upsert({
            where: { userId },
            update: { designation, department, baseSalary: parseFloat(baseSalary), bankAccount, ifscCode },
            create: { userId, designation, department, baseSalary: parseFloat(baseSalary), bankAccount, ifscCode }
        });
        res.json(profile);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.upsertStaffProfile = upsertStaffProfile;
// DISBURSE salary (create salary record)
const disburseSalary = async (req, res) => {
    try {
        const { staffProfileId, month, basicSalary, allowances, deductions, paymentMode, transactionId, remarks } = req.body;
        const basic = parseFloat(basicSalary);
        const allow = parseFloat(allowances || '0');
        const deduct = parseFloat(deductions || '0');
        const net = basic + allow - deduct;
        // 1. Get staff profile to know the name
        const profile = await prisma_1.default.staffProfile.findUnique({
            where: { id: staffProfileId },
            include: { user: true }
        });
        if (!profile) {
            res.status(404).json({ message: 'Staff profile not found' });
            return;
        }
        // 2. Create the salary record and the expense record in a transaction
        const [record] = await prisma_1.default.$transaction([
            prisma_1.default.salaryRecord.create({
                data: {
                    staffProfileId,
                    month,
                    basicSalary: basic,
                    allowances: allow,
                    deductions: deduct,
                    netSalary: net,
                    paymentMode,
                    transactionId,
                    remarks,
                    status: 'PAID'
                },
                include: { staffProfile: { include: { user: true } } }
            }),
            prisma_1.default.expense.create({
                data: {
                    title: `Salary - ${profile.user.name} - ${month}`,
                    category: 'SALARY',
                    amount: net,
                    date: new Date(),
                    description: `Base: ₹${basic}, Allowances: ₹${allow}, Deductions: ₹${deduct}`,
                    payeeName: profile.user.name,
                    purpose: 'STAFF_PAYROLL'
                }
            })
        ]);
        res.json(record);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.disburseSalary = disburseSalary;
// GET salary record by ID (for slip)
const getSalaryRecord = async (req, res) => {
    try {
        const record = await prisma_1.default.salaryRecord.findUnique({
            where: { id: req.params.id },
            include: { staffProfile: { include: { user: true } } }
        });
        if (!record) {
            res.status(404).json({ message: 'Record not found' });
            return;
        }
        res.json(record);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getSalaryRecord = getSalaryRecord;
// GET all salary records for a staff
const getStaffSalaryHistory = async (req, res) => {
    try {
        const { profileId } = req.params;
        const records = await prisma_1.default.salaryRecord.findMany({
            where: { staffProfileId: profileId },
            orderBy: { paidAt: 'desc' },
            include: { staffProfile: { include: { user: true } } }
        });
        res.json(records);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getStaffSalaryHistory = getStaffSalaryHistory;
// DELETE salary record
const deleteSalaryRecord = async (req, res) => {
    try {
        const { id } = req.params;
        // 1. Get record details to find associated expense
        const record = await prisma_1.default.salaryRecord.findUnique({
            where: { id: id },
            include: { staffProfile: { include: { user: true } } }
        });
        if (!record) {
            res.status(404).json({ message: 'Salary record not found' });
            return;
        }
        // 2. Transaction to delete both
        await prisma_1.default.$transaction(async (tx) => {
            await tx.salaryRecord.delete({ where: { id: id } });
            const relatedExpense = await tx.expense.findFirst({
                where: {
                    amount: record.netSalary,
                    payeeName: record.staffProfile.user.name,
                    purpose: 'STAFF_PAYROLL'
                }
            });
            if (relatedExpense) {
                await tx.expense.delete({ where: { id: relatedExpense.id } });
            }
        });
        res.json({ message: 'Salary record and ledger entry deleted' });
    }
    catch (error) {
        console.error('Delete Salary Record Error:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.deleteSalaryRecord = deleteSalaryRecord;
//# sourceMappingURL=salary.controller.js.map