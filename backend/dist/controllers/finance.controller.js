"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStudentLedger = exports.deletePayment = exports.getPayment = exports.getAllPendingFees = exports.getAllDues = exports.allocateFee = exports.recordPayment = exports.getStudentFees = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const getStudentFees = async (req, res) => {
    try {
        const { studentId } = req.params;
        const rawFees = await prisma_1.default.fee.findMany({
            where: { studentId: studentId },
            include: {
                course: { select: { name: true } },
                payments: true
            },
            orderBy: { dueDate: 'asc' }
        });
        // Load institution settings for late fee config
        const settings = await prisma_1.default.institutionSettings.findUnique({ where: { id: 'singleton' } });
        const lateFeePerDay = settings?.lateFeePerDay ?? 10;
        const gracePeriodDays = settings?.gracePeriodDays ?? 0;
        const lateFeeEnabled = settings?.lateFeeEnabled ?? true;
        const student = await prisma_1.default.student.findUnique({ where: { id: studentId } });
        const isInactive = student?.status === 'INACTIVE';
        // Auto-apply late fees based on institution settings
        const processedFees = await Promise.all(rawFees.map(async (fee) => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const due = new Date(fee.dueDate);
            due.setHours(0, 0, 0, 0);
            let calculatedLateFee = 0;
            if (lateFeeEnabled && today > due && fee.status !== 'PAID') {
                const diffTime = today.getTime() - due.getTime();
                const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                const effectiveDays = Math.max(0, diffDays - gracePeriodDays);
                calculatedLateFee = effectiveDays * lateFeePerDay;
            }
            if (fee.lateFee !== calculatedLateFee) {
                return await prisma_1.default.fee.update({
                    where: { id: fee.id },
                    data: { lateFee: calculatedLateFee },
                    include: {
                        course: { select: { name: true } },
                        payments: true
                    }
                });
            }
            return fee;
        }));
        const finalFees = isInactive ? processedFees.filter(f => f.status === 'PAID') : processedFees;
        res.status(200).json(finalFees);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getStudentFees = getStudentFees;
const recordPayment = async (req, res) => {
    try {
        const { feeIds, studentId, amount, paymentMode, transactionId } = req.body;
        console.log('Recording Payment:', { feeIds, studentId, amount, paymentMode, transactionId });
        if (!feeIds || !Array.isArray(feeIds) || feeIds.length === 0) {
            res.status(400).json({ message: 'At least one Fee ID is required' });
            return;
        }
        if (!studentId) {
            res.status(400).json({ message: 'Student ID is required' });
            return;
        }
        const txnId = transactionId || `TXN-${Date.now()}`;
        const payments = [];
        // Pre-fetch all fees and calculate remaining balances
        const feeDetails = [];
        let totalRemaining = 0;
        for (const feeId of feeIds) {
            const fee = await prisma_1.default.fee.findUnique({ where: { id: feeId } });
            if (!fee) {
                console.warn(`Fee ${feeId} not found`);
                continue;
            }
            const previousPayments = await prisma_1.default.payment.findMany({ where: { feeId } });
            const previousPaid = previousPayments.reduce((sum, p) => sum + p.amount, 0);
            const totalDue = fee.amount + (fee.lateFee || 0);
            const remaining = Math.max(0, totalDue - previousPaid);
            feeDetails.push({ id: feeId, remaining });
            totalRemaining += remaining;
        }
        // Determine the total payment amount to distribute
        let totalPayAmount = totalRemaining; // default: pay everything
        if (amount && !isNaN(parseFloat(amount))) {
            totalPayAmount = Math.min(parseFloat(amount), totalRemaining);
        }
        if (isNaN(totalPayAmount) || totalPayAmount <= 0) {
            res.status(400).json({ message: 'Invalid payment amount' });
            return;
        }
        // Distribute payment: fill fees in order (oldest first), last fee gets remainder
        let amountLeft = totalPayAmount;
        for (const { id: feeId, remaining } of feeDetails) {
            if (amountLeft <= 0)
                break;
            const payAmount = Math.min(amountLeft, remaining);
            amountLeft -= payAmount;
            const payment = await prisma_1.default.payment.create({
                data: {
                    feeId,
                    studentId,
                    amount: payAmount,
                    paymentMode,
                    transactionId: txnId,
                    date: new Date()
                }
            });
            // Recalculate fee status
            const fee = await prisma_1.default.fee.findUnique({ where: { id: feeId } });
            const allPayments = await prisma_1.default.payment.findMany({ where: { feeId } });
            const totalPaid = allPayments.reduce((sum, p) => sum + p.amount, 0);
            const totalDue = (fee?.amount || 0) + (fee?.lateFee || 0);
            let newStatus = 'PAID';
            if (totalPaid < totalDue) {
                newStatus = totalPaid > 0 ? 'PARTIAL' : 'PENDING';
            }
            await prisma_1.default.fee.update({ where: { id: feeId }, data: { status: newStatus } });
            payments.push(payment);
        }
        res.status(201).json({
            message: `${payments.length} payments recorded successfully`,
            payments,
            transactionId: txnId
        });
    }
    catch (error) {
        console.error('CRITICAL: Payment record failure:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.recordPayment = recordPayment;
const allocateFee = async (req, res) => {
    try {
        const { studentIds, courseId, amount, type, month, dueDate } = req.body;
        const fees = await Promise.all(studentIds.map((studentId) => prisma_1.default.fee.create({
            data: {
                studentId,
                courseId,
                amount: parseFloat(amount),
                type: type || 'ACADEMIC',
                month: month || null,
                dueDate: new Date(dueDate),
                status: 'PENDING'
            }
        })));
        res.status(201).json({ message: `${fees.length} fees allocated`, fees });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.allocateFee = allocateFee;
const getAllDues = async (req, res) => {
    try {
        const rawDues = await prisma_1.default.fee.findMany({
            where: {
                status: { in: ['PENDING', 'PARTIAL'] },
                dueDate: { lte: new Date() },
                student: { status: { not: 'INACTIVE' } }
            },
            include: {
                student: { include: { user: { select: { name: true } } } },
                course: { select: { name: true } },
                payments: true
            }
        });
        // Load institution settings for late fee config
        const settings = await prisma_1.default.institutionSettings.findUnique({ where: { id: 'singleton' } });
        const lateFeePerDay = settings?.lateFeePerDay ?? 10;
        const gracePeriodDays = settings?.gracePeriodDays ?? 0;
        const lateFeeEnabled = settings?.lateFeeEnabled ?? true;
        // Auto-apply late fees based on institution settings
        const processedDues = await Promise.all(rawDues.map(async (fee) => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const due = new Date(fee.dueDate);
            due.setHours(0, 0, 0, 0);
            let calculatedLateFee = 0;
            if (lateFeeEnabled && today > due) {
                const diffTime = today.getTime() - due.getTime();
                const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                const effectiveDays = Math.max(0, diffDays - gracePeriodDays);
                calculatedLateFee = effectiveDays * lateFeePerDay;
            }
            if (fee.lateFee !== calculatedLateFee) {
                return await prisma_1.default.fee.update({
                    where: { id: fee.id },
                    data: { lateFee: calculatedLateFee },
                    include: {
                        student: { include: { user: { select: { name: true } } } },
                        course: { select: { name: true } },
                        payments: true
                    }
                });
            }
            return fee;
        }));
        res.status(200).json(processedDues);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getAllDues = getAllDues;
const getAllPendingFees = async (req, res) => {
    try {
        const rawFees = await prisma_1.default.fee.findMany({
            where: {
                status: { in: ['PENDING', 'PARTIAL'] },
                student: { status: { not: 'INACTIVE' } }
            },
            include: {
                student: { include: { user: { select: { name: true } } } },
                course: { select: { name: true } },
                payments: true
            }
        });
        const settings = await prisma_1.default.institutionSettings.findUnique({ where: { id: 'singleton' } });
        const lateFeePerDay = settings?.lateFeePerDay ?? 10;
        const gracePeriodDays = settings?.gracePeriodDays ?? 0;
        const lateFeeEnabled = settings?.lateFeeEnabled ?? true;
        const processedFees = await Promise.all(rawFees.map(async (fee) => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const due = new Date(fee.dueDate);
            due.setHours(0, 0, 0, 0);
            let calculatedLateFee = 0;
            if (lateFeeEnabled && today > due) {
                const diffTime = today.getTime() - due.getTime();
                const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                const effectiveDays = Math.max(0, diffDays - gracePeriodDays);
                calculatedLateFee = effectiveDays * lateFeePerDay;
            }
            if (fee.lateFee !== calculatedLateFee) {
                return await prisma_1.default.fee.update({
                    where: { id: fee.id },
                    data: { lateFee: calculatedLateFee },
                    include: {
                        student: { include: { user: { select: { name: true } } } },
                        course: { select: { name: true } },
                        payments: true
                    }
                });
            }
            return fee;
        }));
        res.status(200).json(processedFees);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getAllPendingFees = getAllPendingFees;
const getPayment = async (req, res) => {
    try {
        const { id } = req.params;
        const payment = await prisma_1.default.payment.findUnique({
            where: { id: id },
            include: {
                student: { include: { user: { select: { name: true } } } },
                fee: { include: { course: { select: { name: true } } } }
            }
        });
        if (!payment) {
            res.status(404).json({ message: 'Payment not found' });
            return;
        }
        // Find all payments in the same transaction
        const siblings = await prisma_1.default.payment.findMany({
            where: { transactionId: payment.transactionId },
            include: {
                fee: { include: { course: { select: { name: true } } } }
            }
        });
        res.status(200).json({ ...payment, siblings });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getPayment = getPayment;
const deletePayment = async (req, res) => {
    try {
        const { id } = req.params;
        const payment = await prisma_1.default.payment.findUnique({ where: { id: id } });
        if (!payment) {
            res.status(404).json({ message: 'Payment not found' });
            return;
        }
        await prisma_1.default.payment.delete({ where: { id: id } });
        // Recalculate fee status based on remaining payments
        const fee = await prisma_1.default.fee.findUnique({ where: { id: payment.feeId } });
        const remainingPayments = await prisma_1.default.payment.findMany({ where: { feeId: payment.feeId } });
        const totalPaid = remainingPayments.reduce((sum, p) => sum + p.amount, 0);
        const totalDue = (fee?.amount || 0) + (fee?.lateFee || 0);
        let newStatus = 'PENDING';
        if (totalPaid >= totalDue && totalDue > 0) {
            newStatus = 'PAID';
        }
        else if (totalPaid > 0) {
            newStatus = 'PARTIAL';
        }
        await prisma_1.default.fee.update({ where: { id: payment.feeId }, data: { status: newStatus } });
        res.status(200).json({ message: 'Payment deleted and fee status updated' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.deletePayment = deletePayment;
// ─── STUDENT LEDGER ───────────────────────────────────────────────────────────
const getStudentLedger = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q || typeof q !== 'string' || q.trim().length < 1) {
            res.status(400).json({ message: 'Search query is required' });
            return;
        }
        const query = q.trim();
        // Search by regNo (exact) or name (partial, case-insensitive)
        const students = await prisma_1.default.student.findMany({
            where: {
                OR: [
                    { regNo: { contains: query } },
                    { user: { name: { contains: query } } }
                ]
            },
            include: {
                user: { select: { name: true, email: true, createdAt: true } },
                courses: { include: { course: true, batch: true } },
                fees: {
                    orderBy: { dueDate: 'asc' },
                    include: {
                        course: { select: { name: true } },
                        payments: { orderBy: { date: 'asc' } }
                    }
                }
            },
            take: 10
        });
        const results = students.map(student => {
            const isInactive = student.status === 'INACTIVE';
            const fees = isInactive ? student.fees.filter(f => f.status === 'PAID') : student.fees;
            // Summary
            const totalAllocated = fees.reduce((s, f) => {
                const paidAmount = f.payments.reduce((ps, p) => ps + p.amount, 0);
                return s + (isInactive ? paidAmount : (f.amount + (f.lateFee || 0)));
            }, 0);
            const totalPaid = fees.reduce((s, f) => s + f.payments.reduce((ps, p) => ps + p.amount, 0), 0);
            const totalRemaining = Math.max(0, totalAllocated - totalPaid);
            // Academic fees (yearly)
            const academicFees = fees.filter(f => f.type === 'ACADEMIC').map(f => {
                const paid = f.payments.reduce((s, p) => s + p.amount, 0);
                const gross = isInactive ? paid : (f.amount + (f.lateFee || 0));
                return {
                    ...f,
                    amount: isInactive ? paid : f.amount,
                    lateFee: isInactive ? 0 : f.lateFee,
                    totalPaid: paid,
                    remaining: Math.max(0, gross - paid)
                };
            });
            // Hostel fees (monthly)
            const hostelFees = fees.filter(f => f.type === 'HOSTEL').map(f => {
                const paid = f.payments.reduce((s, p) => s + p.amount, 0);
                const gross = isInactive ? paid : (f.amount + (f.lateFee || 0));
                return {
                    ...f,
                    amount: isInactive ? paid : f.amount,
                    lateFee: isInactive ? 0 : f.lateFee,
                    totalPaid: paid,
                    remaining: Math.max(0, gross - paid)
                };
            });
            // Flat chronological transaction list
            const transactions = fees.flatMap(f => f.payments.map(p => ({
                ...p,
                feeType: f.type,
                feeMonth: f.month,
                courseName: f.course.name
            }))).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            return {
                student: {
                    id: student.id,
                    regNo: student.regNo,
                    status: student.status,
                    guardianName: student.guardianName,
                    phone: student.phone,
                    dob: student.dob,
                    gender: student.gender,
                    address: student.address,
                    isResidential: student.isResidential,
                    user: student.user,
                    courses: student.courses
                },
                summary: { totalAllocated, totalPaid, totalRemaining },
                academicFees,
                hostelFees,
                transactions
            };
        });
        res.status(200).json(results);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getStudentLedger = getStudentLedger;
//# sourceMappingURL=finance.controller.js.map