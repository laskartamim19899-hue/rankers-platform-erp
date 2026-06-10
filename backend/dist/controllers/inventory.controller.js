"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllIssues = exports.deleteItem = exports.returnItem = exports.issueItem = exports.createItem = exports.getAllItems = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const getAllItems = async (req, res) => {
    try {
        const items = await prisma_1.default.inventoryItem.findMany({
            orderBy: { createdAt: 'desc' },
            include: { issues: { where: { returnedOn: null }, include: { student: { include: { user: true } } } } }
        });
        res.status(200).json(items);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getAllItems = getAllItems;
const createItem = async (req, res) => {
    try {
        const { name, category, totalQty, description } = req.body;
        const item = await prisma_1.default.inventoryItem.create({
            data: { name, category, totalQty, availableQty: totalQty, description }
        });
        res.status(201).json(item);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.createItem = createItem;
const issueItem = async (req, res) => {
    try {
        const { itemId, studentId, dueDate } = req.body;
        const item = await prisma_1.default.inventoryItem.findUnique({ where: { id: itemId } });
        if (!item || item.availableQty <= 0) {
            res.status(400).json({ message: 'Item not available in stock' });
            return;
        }
        const [issue] = await prisma_1.default.$transaction([
            prisma_1.default.inventoryIssue.create({ data: { itemId, studentId, dueDate: new Date(dueDate) } }),
            prisma_1.default.inventoryItem.update({ where: { id: itemId }, data: { availableQty: { decrement: 1 } } })
        ]);
        res.status(201).json(issue);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.issueItem = issueItem;
const returnItem = async (req, res) => {
    try {
        const { id } = req.params;
        const { condition } = req.body;
        const issue = await prisma_1.default.inventoryIssue.findUnique({ where: { id: id } });
        if (!issue) {
            res.status(404).json({ message: 'Issue not found' });
            return;
        }
        await prisma_1.default.$transaction([
            prisma_1.default.inventoryIssue.update({ where: { id: id }, data: { returnedOn: new Date(), condition } }),
            prisma_1.default.inventoryItem.update({ where: { id: issue.itemId }, data: { availableQty: { increment: 1 } } })
        ]);
        res.status(200).json({ message: 'Item returned' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.returnItem = returnItem;
const deleteItem = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma_1.default.inventoryIssue.deleteMany({ where: { itemId: id } });
        await prisma_1.default.inventoryItem.delete({ where: { id: id } });
        res.status(200).json({ message: 'Item deleted' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.deleteItem = deleteItem;
const getAllIssues = async (req, res) => {
    try {
        const issues = await prisma_1.default.inventoryIssue.findMany({
            orderBy: { issuedOn: 'desc' },
            include: {
                item: true,
                student: { include: { user: true } }
            }
        });
        res.status(200).json(issues);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getAllIssues = getAllIssues;
//# sourceMappingURL=inventory.controller.js.map