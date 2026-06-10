import { Request, Response } from 'express';
import prisma from '../prisma';

export const getAllItems = async (req: Request, res: Response): Promise<void> => {
  try {
    const items = await prisma.inventoryItem.findMany({
      orderBy: { createdAt: 'desc' },
      include: { issues: { where: { returnedOn: null }, include: { student: { include: { user: true } } } } }
    });
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const createItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, category, totalQty, description } = req.body;
    const item = await prisma.inventoryItem.create({
      data: { name, category, totalQty, availableQty: totalQty, description }
    });
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const issueItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { itemId, studentId, dueDate } = req.body;
    const item = await prisma.inventoryItem.findUnique({ where: { id: itemId } });
    if (!item || item.availableQty <= 0) {
      res.status(400).json({ message: 'Item not available in stock' });
      return;
    }
    const [issue] = await prisma.$transaction([
      prisma.inventoryIssue.create({ data: { itemId, studentId, dueDate: new Date(dueDate) } }),
      prisma.inventoryItem.update({ where: { id: itemId }, data: { availableQty: { decrement: 1 } } })
    ]);
    res.status(201).json(issue);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const returnItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { condition } = req.body;
    const issue = await prisma.inventoryIssue.findUnique({ where: { id: id as string } });
    if (!issue) { res.status(404).json({ message: 'Issue not found' }); return; }
    await prisma.$transaction([
      prisma.inventoryIssue.update({ where: { id: id as string }, data: { returnedOn: new Date(), condition } }),
      prisma.inventoryItem.update({ where: { id: issue.itemId }, data: { availableQty: { increment: 1 } } })
    ]);
    res.status(200).json({ message: 'Item returned' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const deleteItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.inventoryIssue.deleteMany({ where: { itemId: id as string } });
    await prisma.inventoryItem.delete({ where: { id: id as string } });
    res.status(200).json({ message: 'Item deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getAllIssues = async (req: Request, res: Response): Promise<void> => {
  try {
    const issues = await prisma.inventoryIssue.findMany({
      orderBy: { issuedOn: 'desc' },
      include: {
        item: true,
        student: { include: { user: true } }
      }
    });
    res.status(200).json(issues);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
