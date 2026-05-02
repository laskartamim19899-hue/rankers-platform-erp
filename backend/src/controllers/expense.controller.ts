import { Request, Response } from 'express';
import prisma from '../prisma';

export const createExpense = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, category, amount, description, date, payeeName, purpose } = req.body;
    const expense = await prisma.expense.create({
      data: {
        title,
        category,
        amount: parseFloat(amount),
        description,
        payeeName,
        purpose,
        date: new Date(date || new Date())
      }
    });
    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getExpenses = async (req: Request, res: Response): Promise<void> => {
  try {
    const expenses = await prisma.expense.findMany({
      orderBy: { date: 'desc' }
    });
    res.status(200).json(expenses);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getExpense = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const expense = await prisma.expense.findUnique({ where: { id: id as string } });
    if (!expense) {
      res.status(404).json({ message: 'Expense not found' });
      return;
    }
    res.status(200).json(expense);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const deleteExpense = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.expense.delete({ where: { id: id as string } });
    res.status(200).json({ message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
