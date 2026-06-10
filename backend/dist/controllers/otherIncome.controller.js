"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteOtherIncome = exports.getOtherIncomeById = exports.getAllOtherIncome = exports.createOtherIncome = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const createOtherIncome = async (req, res) => {
    try {
        const { title, category, amount, description, receivedFrom, paymentMode, transactionId, date } = req.body;
        const income = await prisma_1.default.otherIncome.create({
            data: {
                title,
                category,
                amount: parseFloat(amount),
                description,
                receivedFrom,
                paymentMode: paymentMode || 'CASH',
                transactionId,
                date: date ? new Date(date) : new Date(),
            }
        });
        res.status(201).json(income);
    }
    catch (error) {
        console.error('Error creating other income:', error);
        res.status(500).json({ error: 'Failed to create other income record' });
    }
};
exports.createOtherIncome = createOtherIncome;
const getAllOtherIncome = async (req, res) => {
    try {
        const incomeRecords = await prisma_1.default.otherIncome.findMany({
            orderBy: { date: 'desc' }
        });
        res.status(200).json(incomeRecords);
    }
    catch (error) {
        console.error('Error fetching other income records:', error);
        res.status(500).json({ error: 'Failed to fetch other income records' });
    }
};
exports.getAllOtherIncome = getAllOtherIncome;
const getOtherIncomeById = async (req, res) => {
    try {
        const { id } = req.params;
        const income = await prisma_1.default.otherIncome.findUnique({
            where: { id: id }
        });
        if (!income) {
            return res.status(404).json({ error: 'Record not found' });
        }
        res.status(200).json(income);
    }
    catch (error) {
        console.error('Error fetching other income record:', error);
        res.status(500).json({ error: 'Failed to fetch other income record' });
    }
};
exports.getOtherIncomeById = getOtherIncomeById;
const deleteOtherIncome = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma_1.default.otherIncome.delete({
            where: { id: id }
        });
        res.status(200).json({ message: 'Record deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting other income record:', error);
        res.status(500).json({ error: 'Failed to delete other income record' });
    }
};
exports.deleteOtherIncome = deleteOtherIncome;
//# sourceMappingURL=otherIncome.controller.js.map