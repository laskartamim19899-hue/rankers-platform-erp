"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.createCategory = exports.getCategories = exports.deleteExpense = exports.getExpense = exports.getExpenses = exports.createExpense = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const createExpense = async (req, res) => {
    try {
        const { title, category, amount, description, date, payeeName, purpose, fundSource } = req.body;
        const expense = await prisma_1.default.expense.create({
            data: {
                title,
                category,
                amount: parseFloat(amount),
                description,
                payeeName,
                purpose,
                fundSource: fundSource || "GENERAL",
                date: new Date(date || new Date())
            }
        });
        res.status(201).json(expense);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.createExpense = createExpense;
const getExpenses = async (req, res) => {
    try {
        const expenses = await prisma_1.default.expense.findMany({
            orderBy: { date: 'desc' }
        });
        res.status(200).json(expenses);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getExpenses = getExpenses;
const getExpense = async (req, res) => {
    try {
        const { id } = req.params;
        const expense = await prisma_1.default.expense.findUnique({ where: { id: id } });
        if (!expense) {
            res.status(404).json({ message: 'Expense not found' });
            return;
        }
        res.status(200).json(expense);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getExpense = getExpense;
const deleteExpense = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma_1.default.expense.delete({ where: { id: id } });
        res.status(200).json({ message: 'Expense deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.deleteExpense = deleteExpense;
// Category Controllers
const getCategories = async (req, res) => {
    try {
        const categories = await prisma_1.default.expenseCategory.findMany({
            orderBy: { name: 'asc' }
        });
        res.status(200).json(categories);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getCategories = getCategories;
const createCategory = async (req, res) => {
    try {
        const { name } = req.body;
        const category = await prisma_1.default.expenseCategory.create({
            data: { name: name.toUpperCase() }
        });
        res.status(201).json(category);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.createCategory = createCategory;
const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma_1.default.expenseCategory.delete({ where: { id: id } });
        res.status(200).json({ message: 'Category deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.deleteCategory = deleteCategory;
//# sourceMappingURL=expense.controller.js.map