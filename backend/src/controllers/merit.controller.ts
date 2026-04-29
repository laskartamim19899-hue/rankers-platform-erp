import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getMeritBoard = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get all students with their test results
    const students = await prisma.student.findMany({
      where: { status: 'APPROVED' },
      include: {
        user: true,
        results: { include: { test: true } },
        courses: { include: { course: true } },
      }
    });

    const ranked = students.map(s => {
      const totalMarks = s.results.reduce((sum, r) => sum + r.marksObtained, 0);
      const maxPossible = s.results.reduce((sum, r) => sum + r.test.maxMarks, 0);
      const percentage = maxPossible > 0 ? (totalMarks / maxPossible) * 100 : 0;
      return { ...s, totalMarks, maxPossible, percentage: parseFloat(percentage.toFixed(2)) };
    }).sort((a, b) => b.percentage - a.percentage);

    // Assign ranks
    const withRanks = ranked.map((s, i) => ({ ...s, rank: i + 1 }));
    res.status(200).json(withRanks);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const updateScholarshipTier = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { scholarshipTier } = req.body;
    const student = await prisma.student.update({
      where: { id },
      data: { scholarshipTier }
    });
    res.status(200).json(student);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const autoAssignTiers = async (req: Request, res: Response): Promise<void> => {
  try {
    const students = await prisma.student.findMany({
      where: { status: 'APPROVED' },
      include: { results: { include: { test: true } } }
    });

    const ranked = students.map(s => {
      const totalMarks = s.results.reduce((sum, r) => sum + r.marksObtained, 0);
      const maxPossible = s.results.reduce((sum, r) => sum + r.test.maxMarks, 0);
      const percentage = maxPossible > 0 ? (totalMarks / maxPossible) * 100 : 0;
      return { id: s.id, percentage };
    }).sort((a, b) => b.percentage - a.percentage);

    // Top 10% = MERIT_A, 10-25% = MERIT_B, 25-50% = MERIT_C, rest = NONE
    const total = ranked.length;
    const updates = ranked.map((s, i) => {
      const pos = (i / total) * 100;
      let tier = 'NONE';
      if (pos < 10) tier = 'MERIT_A';
      else if (pos < 25) tier = 'MERIT_B';
      else if (pos < 50) tier = 'MERIT_C';
      return prisma.student.update({ where: { id: s.id }, data: { scholarshipTier: tier } });
    });

    await prisma.$transaction(updates);
    res.status(200).json({ message: 'Scholarship tiers auto-assigned successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
