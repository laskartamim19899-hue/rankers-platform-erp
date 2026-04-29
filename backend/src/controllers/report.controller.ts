import { Request, Response } from 'express';
import prisma from '../prisma';

export const getFinancialSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    // Fetch all overdue PENDING/PARTIAL fees with their payments
    const dueFees = await prisma.fee.findMany({
      where: {
        status: { in: ['PENDING', 'PARTIAL'] },
        dueDate: { lte: new Date() }
      },
      include: { payments: { select: { amount: true } } }
    });

    // True remaining balance = (amount + lateFee) - sum(payments)
    const pendingTotal = dueFees.reduce((sum, fee) => {
      const gross = fee.amount + (fee.lateFee || 0);
      const paid = fee.payments.reduce((s, p) => s + p.amount, 0);
      return sum + Math.max(0, gross - paid);
    }, 0);

    const totalCollected = await prisma.payment.aggregate({
      _sum: { amount: true }
    });

    const recentPayments = await prisma.payment.findMany({
      take: 5,
      orderBy: { date: 'desc' },
      include: { student: { include: { user: { select: { name: true } } } } }
    });

    const recentStudents = await prisma.student.findMany({
      take: 5,
      orderBy: { user: { createdAt: 'desc' } },
      include: { 
        user: { select: { name: true, createdAt: true } },
        courses: { include: { course: true } }
      }
    });

    const stream = [
      ...recentPayments.map(p => ({ type: 'PAYMENT', date: p.date, data: p })),
      ...recentStudents.map(s => ({ type: 'ENROLLMENT', date: s.user.createdAt, data: s }))
    ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5);

    const totalStudents = await prisma.student.count();
    
    const topPerformers = await prisma.student.count({
      where: { hsMarksPhysics: { gte: 90 } }
    });

    const courses = await prisma.course.findMany({
      include: {
        _count: { select: { students: true } }
      }
    });
    const batchDistribution = courses.map(c => ({
      name: c.name,
      count: c._count.students
    }));

    const allPayments = await prisma.payment.findMany({
      select: { amount: true, date: true }
    });
    const revMap: Record<string, number> = {};
    allPayments.forEach(p => {
      const month = p.date.toLocaleString('default', { month: 'short' });
      revMap[month] = (revMap[month] || 0) + p.amount;
    });
    const revenueOverTime = Object.entries(revMap).map(([month, amount]) => ({ month, amount }));

    res.status(200).json({
      pending: pendingTotal,
      collected: totalCollected._sum.amount || 0,
      recentStream: stream,
      totalStudents,
      topPerformers,
      batchDistribution,
      revenueOverTime
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getAcademicAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const totalStudents = await prisma.student.count();
    const attendanceStats = await prisma.attendance.groupBy({
      by: ['status'],
      _count: { _all: true }
    });

    const testPerformance = await prisma.result.aggregate({
      _avg: { marksObtained: true }
    });

    res.status(200).json({
      totalStudents,
      attendanceStats,
      averageScore: testPerformance._avg.marksObtained || 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getPayrollReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const salaries = await prisma.expense.findMany({
      where: { category: 'SALARY' },
      orderBy: { date: 'desc' }
    });
    
    // Group by Date for a Day Payroll view
    const payrollMap: Record<string, any[]> = {};
    salaries.forEach(s => {
      const dateStr = s.date.toISOString().split('T')[0];
      if (!payrollMap[dateStr]) payrollMap[dateStr] = [];
      payrollMap[dateStr].push(s);
    });

    const dayPayroll = Object.keys(payrollMap).map(date => ({
      date,
      totalAmount: payrollMap[date].reduce((acc, curr) => acc + curr.amount, 0),
      records: payrollMap[date]
    })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    res.status(200).json(dayPayroll);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
