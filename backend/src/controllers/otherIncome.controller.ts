import { Request, Response } from 'express';
import prisma from '../prisma';

export const createOtherIncome = async (req: Request, res: Response) => {
  try {
    const { title, category, amount, description, receivedFrom, paymentMode, transactionId, date } = req.body;
    
    const income = await prisma.otherIncome.create({
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
  } catch (error) {
    console.error('Error creating other income:', error);
    res.status(500).json({ error: 'Failed to create other income record' });
  }
};

export const getAllOtherIncome = async (req: Request, res: Response) => {
  try {
    const incomeRecords = await prisma.otherIncome.findMany({
      orderBy: { date: 'desc' }
    });
    res.status(200).json(incomeRecords);
  } catch (error) {
    console.error('Error fetching other income records:', error);
    res.status(500).json({ error: 'Failed to fetch other income records' });
  }
};

export const getOtherIncomeById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const income = await prisma.otherIncome.findUnique({
      where: { id: id as string }
    });
    if (!income) {
      return res.status(404).json({ error: 'Record not found' });
    }
    res.status(200).json(income);
  } catch (error) {
    console.error('Error fetching other income record:', error);
    res.status(500).json({ error: 'Failed to fetch other income record' });
  }
};

export const deleteOtherIncome = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.otherIncome.delete({
      where: { id: id as string }
    });
    res.status(200).json({ message: 'Record deleted successfully' });
  } catch (error) {
    console.error('Error deleting other income record:', error);
    res.status(500).json({ error: 'Failed to delete other income record' });
  }
};
