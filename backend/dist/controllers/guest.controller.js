"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteGuestPayment = exports.getGuestPaymentHistory = exports.getGuestPayment = exports.disburseGuestPayment = exports.deleteGuestTeacher = exports.updateGuestTeacher = exports.createGuestTeacher = exports.getAllGuestTeachers = void 0;
const prisma_1 = __importDefault(require("../prisma"));
// GET all guest teachers with recent payments
const getAllGuestTeachers = async (req, res) => {
    try {
        const teachers = await prisma_1.default.guestTeacher.findMany({
            include: {
                payments: { orderBy: { paidAt: 'desc' }, take: 6 }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(teachers);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getAllGuestTeachers = getAllGuestTeachers;
// CREATE guest teacher
const createGuestTeacher = async (req, res) => {
    try {
        const { name, phone, email, subject, qualification, ratePerClass } = req.body;
        const teacher = await prisma_1.default.guestTeacher.create({
            data: { name, phone, email, subject, qualification, ratePerClass: parseFloat(ratePerClass) }
        });
        res.status(201).json(teacher);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.createGuestTeacher = createGuestTeacher;
// UPDATE guest teacher
const updateGuestTeacher = async (req, res) => {
    try {
        const { name, phone, email, subject, qualification, ratePerClass } = req.body;
        const teacher = await prisma_1.default.guestTeacher.update({
            where: { id: req.params.id },
            data: { name, phone, email, subject, qualification, ratePerClass: parseFloat(ratePerClass) }
        });
        res.json(teacher);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.updateGuestTeacher = updateGuestTeacher;
// DELETE guest teacher (Deep wipe: Teacher + Payments + Associated Ledger/Expenses)
const deleteGuestTeacher = async (req, res) => {
    try {
        const { id } = req.params;
        // 1. Fetch teacher and their payments to know what expenses to delete
        const teacher = await prisma_1.default.guestTeacher.findUnique({
            where: { id: id },
            include: { payments: true }
        });
        if (!teacher) {
            res.status(404).json({ message: 'Guest teacher not found' });
            return;
        }
        // 2. Perform deep delete in a transaction
        await prisma_1.default.$transaction(async (tx) => {
            // Find all expenses linked to this teacher's payments
            // We search by payeeName and purpose
            const relatedExpenses = await tx.expense.findMany({
                where: {
                    payeeName: teacher.name,
                    purpose: 'GUEST_FACULTY_PAYROLL'
                }
            });
            // Delete the expenses
            if (relatedExpenses.length > 0) {
                await tx.expense.deleteMany({
                    where: { id: { in: relatedExpenses.map(e => e.id) } }
                });
            }
            // Delete all payments
            await tx.guestPayment.deleteMany({
                where: { guestTeacherId: id }
            });
            // Finally delete the teacher profile
            await tx.guestTeacher.delete({
                where: { id: id }
            });
        });
        res.json({ message: 'Teacher, payment history, and ledger records completely wiped.' });
    }
    catch (error) {
        console.error('Deep Delete Guest Teacher Error:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.deleteGuestTeacher = deleteGuestTeacher;
// DISBURSE payment to guest teacher
const disburseGuestPayment = async (req, res) => {
    try {
        const { guestTeacherId, month, classesHeld, ratePerClass, allowances, paymentMode, transactionId, remarks } = req.body;
        const classes = parseInt(classesHeld);
        const rate = parseFloat(ratePerClass);
        const allow = parseFloat(allowances || '0');
        const classAmount = classes * rate;
        const totalAmount = classAmount + allow;
        // 1. Get guest teacher name
        const guest = await prisma_1.default.guestTeacher.findUnique({
            where: { id: guestTeacherId }
        });
        if (!guest) {
            res.status(404).json({ message: 'Guest teacher not found' });
            return;
        }
        // 2. Create payment and expense in a transaction
        const [payment] = await prisma_1.default.$transaction([
            prisma_1.default.guestPayment.create({
                data: {
                    guestTeacherId,
                    month,
                    classesHeld: classes,
                    ratePerClass: rate,
                    classAmount,
                    allowances: allow,
                    totalAmount,
                    paymentMode,
                    transactionId,
                    remarks,
                    status: 'PAID'
                },
                include: { guestTeacher: true }
            }),
            prisma_1.default.expense.create({
                data: {
                    title: `Guest Teacher Payment - ${guest.name} - ${month}`,
                    category: 'SALARY',
                    amount: totalAmount,
                    date: new Date(),
                    description: `${classes} classes @ ₹${rate}/class. Allowances: ₹${allow}`,
                    payeeName: guest.name,
                    purpose: 'GUEST_FACULTY_PAYROLL'
                }
            })
        ]);
        res.status(201).json(payment);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.disburseGuestPayment = disburseGuestPayment;
// GET payment by ID (for slip)
const getGuestPayment = async (req, res) => {
    try {
        const payment = await prisma_1.default.guestPayment.findUnique({
            where: { id: req.params.id },
            include: { guestTeacher: true }
        });
        if (!payment) {
            res.status(404).json({ message: 'Not found' });
            return;
        }
        res.json(payment);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getGuestPayment = getGuestPayment;
// GET all payments for a guest teacher
const getGuestPaymentHistory = async (req, res) => {
    try {
        const payments = await prisma_1.default.guestPayment.findMany({
            where: { guestTeacherId: req.params.id },
            orderBy: { paidAt: 'desc' },
            include: { guestTeacher: true }
        });
        res.json(payments);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getGuestPaymentHistory = getGuestPaymentHistory;
// DELETE payment record
const deleteGuestPayment = async (req, res) => {
    try {
        const { id } = req.params;
        // 1. Get the payment details before deleting to find the associated expense
        const payment = await prisma_1.default.guestPayment.findUnique({
            where: { id: id },
            include: { guestTeacher: true }
        });
        if (!payment) {
            res.status(404).json({ message: 'Payment record not found' });
            return;
        }
        // 2. Use a transaction to delete both the payment and the potential expense
        await prisma_1.default.$transaction(async (tx) => {
            // Delete the payment
            await tx.guestPayment.delete({ where: { id: id } });
            // Try to find and delete the associated expense
            // We search by amount, payee name, and purpose
            const relatedExpense = await tx.expense.findFirst({
                where: {
                    amount: payment.totalAmount,
                    payeeName: payment.guestTeacher.name,
                    purpose: 'GUEST_FACULTY_PAYROLL',
                    // Optionally check for same day if we want to be very strict
                }
            });
            if (relatedExpense) {
                await tx.expense.delete({ where: { id: relatedExpense.id } });
            }
        });
        res.json({ message: 'Payment and associated ledger entry deleted' });
    }
    catch (error) {
        console.error('Delete Guest Payment Error:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.deleteGuestPayment = deleteGuestPayment;
//# sourceMappingURL=guest.controller.js.map