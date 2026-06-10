"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTransactionByTxnId = exports.getTransactionHistory = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const getTransactionHistory = async (req, res) => {
    try {
        const payments = await prisma_1.default.payment.findMany({
            include: {
                student: { include: { user: { select: { name: true } } } },
                fee: { include: { course: { select: { name: true } } } }
            }
        });
        const expenses = await prisma_1.default.expense.findMany();
        const income = payments.map(p => ({
            id: p.id,
            date: p.date,
            type: 'INCOME',
            category: 'FEES',
            title: `Fee Collection: ${p.student.user.name}`,
            subtitle: p.fee.course.name,
            amount: p.amount,
            reference: p.transactionId,
            mode: p.paymentMode
        }));
        const outflow = expenses.map(e => ({
            id: e.id,
            date: e.date,
            type: 'EXPENSE',
            category: e.category,
            title: e.title,
            subtitle: e.description,
            amount: e.amount,
            reference: 'VOUCHER',
            mode: 'CASH'
        }));
        const transactions = [...income, ...outflow].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const totalIncome = income.reduce((sum, i) => sum + i.amount, 0);
        const totalExpense = outflow.reduce((sum, e) => sum + e.amount, 0);
        const balance = totalIncome - totalExpense;
        res.status(200).json({ transactions, summary: { totalIncome, totalExpense, balance } });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getTransactionHistory = getTransactionHistory;
// ─── TRANSACTION VERIFY BY TXN ID ────────────────────────────────────────────
const getTransactionByTxnId = async (req, res) => {
    try {
        const { txnId } = req.params;
        const payments = await prisma_1.default.payment.findMany({
            where: { transactionId: txnId },
            include: {
                student: {
                    include: {
                        user: { select: { name: true, email: true } },
                        courses: { include: { course: true, batch: true } }
                    }
                },
                fee: {
                    include: { course: { select: { name: true } } }
                }
            },
            orderBy: { date: 'asc' }
        });
        if (payments.length === 0) {
            res.status(404).json({ message: 'No transaction found with this ID' });
            return;
        }
        const totalAmount = payments.reduce((s, p) => s + p.amount, 0);
        const student = payments[0].student;
        const date = payments[0].date;
        const paymentMode = payments[0].paymentMode;
        // Build line items
        const lineItems = payments.map((p) => ({
            paymentId: p.id,
            feeType: p.fee.type,
            feeMonth: p.fee.month,
            courseName: p.fee.course.name,
            amount: p.amount,
            dueDate: p.fee.dueDate
        }));
        res.status(200).json({
            transactionId: txnId,
            date,
            paymentMode,
            totalAmount,
            paymentCount: payments.length,
            student: {
                id: student.id,
                regNo: student.regNo,
                name: student.user.name,
                email: student.user.email,
                phone: student.phone,
                guardianName: student.guardianName,
                course: student.courses[0]?.course?.name,
                batch: student.courses[0]?.batch?.name
            },
            lineItems,
            status: 'VERIFIED'
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getTransactionByTxnId = getTransactionByTxnId;
//# sourceMappingURL=transaction.controller.js.map