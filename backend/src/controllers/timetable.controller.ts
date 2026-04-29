import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getTimetable = async (req: Request, res: Response): Promise<void> => {
  try {
    const { batchId } = req.params;
    const timetable = await prisma.timetable.findUnique({
      where: { batchId },
      include: { slots: { orderBy: [{ day: 'asc' }, { startTime: 'asc' }] }, batch: true }
    });
    res.status(200).json(timetable);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getAllTimetables = async (req: Request, res: Response): Promise<void> => {
  try {
    const timetables = await prisma.timetable.findMany({
      include: { batch: true, slots: { orderBy: [{ day: 'asc' }, { startTime: 'asc' }] } }
    });
    res.status(200).json(timetables);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const upsertTimetable = async (req: Request, res: Response): Promise<void> => {
  try {
    const { batchId, slots } = req.body;

    // Ensure timetable exists
    const timetable = await prisma.timetable.upsert({
      where: { batchId },
      create: { batchId },
      update: {},
    });

    // Delete existing slots and recreate
    await prisma.timetableSlot.deleteMany({ where: { timetableId: timetable.id } });
    
    if (slots && slots.length > 0) {
      await prisma.timetableSlot.createMany({
        data: slots.map((s: any) => ({ ...s, timetableId: timetable.id }))
      });
    }

    const updated = await prisma.timetable.findUnique({
      where: { batchId },
      include: { slots: { orderBy: [{ day: 'asc' }, { startTime: 'asc' }] }, batch: true }
    });

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const deleteSlot = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.timetableSlot.delete({ where: { id } });
    res.status(200).json({ message: 'Slot deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
