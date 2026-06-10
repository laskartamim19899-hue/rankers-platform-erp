import { Request, Response } from 'express';
import prisma from '../prisma';

// In-memory cache for the dashboard summary
let dashboardCache: { data: any; ts: number } | null = null;
const CACHE_TTL_MS = 0; // Disabled cache to ensure LIVE data

export const getFinancialSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    // Return cached data immediately if fresh enough
    if (dashboardCache && (Date.now() - dashboardCache.ts) < CACHE_TTL_MS) {
      res.setHeader('X-Cache', 'HIT');
      res.status(200).json(dashboardCache.data);
      return;
    }

    // Fire ALL queries in parallel — no more sequential waterfall
    const [
      dueFees,
      totalCollected,
      settings,
      academicPayments,
      reserveExpenses,
      generalExpenses,
      recentPayments,
      recentStudents,
      totalStudents,
      liveActiveStudents,
      hostelStudents,
      topPerformers,
      courses,
      allPayments
    ] = await Promise.all([
      prisma.fee.findMany({
        where: { status: { in: ['PENDING', 'PARTIAL'] }, student: { status: { not: 'INACTIVE' } } },
        include: { payments: { select: { amount: true } } }
      }),
      prisma.payment.aggregate({ _sum: { amount: true }, where: { NOT: { paymentMode: 'MERCY' } } }),
      prisma.institutionSettings.findUnique({ where: { id: 'singleton' } }),
      prisma.payment.aggregate({ _sum: { amount: true }, where: { fee: { type: 'ACADEMIC' }, NOT: { paymentMode: 'MERCY' } } }),
      prisma.expense.aggregate({ _sum: { amount: true }, where: { fundSource: 'RESERVE' } }),
      prisma.expense.aggregate({ _sum: { amount: true }, where: { fundSource: 'GENERAL' } }),
      prisma.payment.findMany({
        take: 5,
        orderBy: { date: 'desc' },
        include: { student: { include: { user: { select: { name: true } } } } }
      }),
      prisma.student.findMany({
        take: 5,
        orderBy: { user: { createdAt: 'desc' } },
        include: { user: { select: { name: true, createdAt: true } }, courses: { include: { course: true } } }
      }),
      prisma.student.count({ where: { status: 'APPROVED' } }),
      prisma.student.count({ where: { status: 'APPROVED' } }), // active (non-inactive)
      prisma.student.count({ where: { status: 'APPROVED', isResidential: true } }), // hostel residents
      prisma.student.count({ where: { hsMarksPhysics: { gte: 90 } } }),
      prisma.course.findMany({ include: { _count: { select: { students: true } } } }),
      prisma.payment.findMany({ select: { amount: true, date: true }, where: { NOT: { paymentMode: 'MERCY' } } })
    ]);

    // Compute derived values
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let pendingOverdue = 0;
    let pendingFuture = 0;
    let totalOutstanding = 0;

    dueFees.forEach(fee => {
      const gross = fee.amount + (fee.lateFee || 0);
      const paid = fee.payments.reduce((s, p) => s + p.amount, 0);
      const remaining = Math.max(0, gross - paid);

      const due = new Date(fee.dueDate);
      due.setHours(0, 0, 0, 0);

      if (today >= due) {
        pendingOverdue += remaining;
      } else {
        pendingFuture += remaining;
      }
      totalOutstanding += remaining;
    });

    const reserveFundPercentage = settings?.reserveFundPercentage || 60;
    const totalAcademicCollected = academicPayments._sum.amount || 0;
    const totalReserveGenerated = totalAcademicCollected * (reserveFundPercentage / 100);
    const totalReserveSpent = reserveExpenses._sum.amount || 0;
    const availableReserveFund = Math.max(0, totalReserveGenerated - totalReserveSpent);

    const totalCollectedAmount = totalCollected._sum.amount || 0;
    const totalGeneralGenerated = totalCollectedAmount - totalReserveGenerated;
    const totalGeneralSpent = generalExpenses._sum.amount || 0;
    const availableGeneralFund = totalGeneralGenerated - totalGeneralSpent;

    const stream = [
      ...recentPayments.map(p => ({ type: 'PAYMENT', date: p.date, data: p })),
      ...recentStudents.map(s => ({ type: 'ENROLLMENT', date: s.user.createdAt, data: s }))
    ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5);

    const batchDistribution = courses.map(c => ({ name: c.name, count: c._count.students }));

    const revMap: Record<string, number> = {};
    allPayments.forEach(p => {
      const month = p.date.toLocaleString('default', { month: 'short' });
      revMap[month] = (revMap[month] || 0) + p.amount;
    });
    const revenueOverTime = Object.entries(revMap).map(([month, amount]) => ({ month, amount }));

    const result = {
      pending: pendingOverdue,
      pendingOverdue,
      pendingFuture,
      totalOutstanding,
      collected: totalCollectedAmount,
      recentStream: stream,
      totalStudents,
      liveActiveStudents,
      hostelStudents,
      topPerformers,
      batchDistribution,
      revenueOverTime,
      reserveFund: {
        percentage: reserveFundPercentage,
        generated: totalReserveGenerated,
        spent: totalReserveSpent,
        available: availableReserveFund
      },
      generalFund: {
        generated: totalGeneralGenerated,
        spent: totalGeneralSpent,
        available: availableGeneralFund
      }
    };

    // Cache the result
    dashboardCache = { data: result, ts: Date.now() };

    res.setHeader('X-Cache', 'MISS');
    res.setHeader('Cache-Control', 'public, max-age=30, stale-while-revalidate=60');
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getAcademicAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const totalStudents = await prisma.student.count({ where: { status: 'APPROVED' } });
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
      where: { category: { in: ['SALARY', 'STAFF_SALARY', 'TEACHER_SALARY'] } },
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

export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const [
      totalStudents,
      pendingStudents,
      hostelStudents,
      totalCollected,
      totalExpenses,
      dueFees,
      payments
    ] = await Promise.all([
      prisma.student.count({ where: { status: 'APPROVED' } }),
      prisma.student.count({ where: { status: 'PENDING' } }),
      prisma.student.count({ where: { isResidential: true, status: 'APPROVED' } }),
      prisma.payment.aggregate({ _sum: { amount: true }, where: { NOT: { paymentMode: 'MERCY' } } }),
      prisma.expense.aggregate({ _sum: { amount: true } }),
      prisma.fee.findMany({
        where: { status: { in: ['PENDING', 'PARTIAL'] }, student: { status: { not: 'INACTIVE' } } },
        include: { payments: { select: { amount: true } } }
      }),
      prisma.payment.findMany({
        select: { amount: true, date: true },
        where: { NOT: { paymentMode: 'MERCY' } }
      })
    ]);

    // Calculate dues breakdown
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let pendingOverdue = 0;
    let pendingFuture = 0;
    let totalOutstanding = 0;

    dueFees.forEach(fee => {
      const gross = fee.amount + (fee.lateFee || 0);
      const paid = fee.payments.reduce((s, p) => s + p.amount, 0);
      const remaining = Math.max(0, gross - paid);

      const due = new Date(fee.dueDate);
      due.setHours(0, 0, 0, 0);

      if (today >= due) {
        pendingOverdue += remaining;
      } else {
        pendingFuture += remaining;
      }
      totalOutstanding += remaining;
    });

    // Calculate monthly collection trend
    const revMap: Record<string, number> = {};
    payments.forEach(p => {
      const month = p.date.toLocaleString('default', { month: 'short' });
      revMap[month] = (revMap[month] || 0) + p.amount;
    });
    const monthlyCollection = Object.entries(revMap).map(([month, total]) => ({ month, total }));

    res.status(200).json({
      totalStudents,
      pendingStudents,
      hostelStudents,
      totalCollected: totalCollected._sum.amount || 0,
      totalDues: pendingOverdue,
      pendingOverdue,
      pendingFuture,
      totalOutstanding,
      totalExpenses: totalExpenses._sum.amount || 0,
      monthlyCollection
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getExpenseAnalysis = async (req: Request, res: Response): Promise<void> => {
  try {
    const expenses = await prisma.expense.findMany({
      orderBy: { date: 'desc' }
    });

    const categoryMap: Record<string, number> = {};
    expenses.forEach(ex => {
      categoryMap[ex.category] = (categoryMap[ex.category] || 0) + ex.amount;
    });

    const categoryBreakdown = Object.entries(categoryMap).map(([category, amount]) => ({
      category,
      amount,
      percentage: 0
    })).sort((a, b) => b.amount - a.amount);

    const totalAmount = categoryBreakdown.reduce((sum, item) => sum + item.amount, 0);
    categoryBreakdown.forEach(item => {
      item.percentage = totalAmount > 0 ? (item.amount / totalAmount) * 100 : 0;
    });

    const trendMap: Record<string, number> = {};
    expenses.forEach(ex => {
      const month = ex.date.toLocaleString('default', { month: 'short' });
      trendMap[month] = (trendMap[month] || 0) + ex.amount;
    });
    const monthlyTrend = Object.entries(trendMap).map(([month, amount]) => ({ month, amount }));

    const generalSpent = expenses.filter(ex => ex.fundSource === 'GENERAL').reduce((sum, ex) => sum + ex.amount, 0);
    const reserveSpent = expenses.filter(ex => ex.fundSource === 'RESERVE').reduce((sum, ex) => sum + ex.amount, 0);

    const topCategory = categoryBreakdown.length > 0 ? categoryBreakdown[0] : null;

    res.status(200).json({
      totalAmount,
      categoryBreakdown,
      monthlyTrend,
      fundSourceBreakdown: {
        GENERAL: generalSpent,
        RESERVE: reserveSpent
      },
      topCategory,
      recentExpenses: expenses.slice(0, 5)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getCollectionReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const { type, courseId, month, paymentMode, startDate, endDate, search } = req.query;

    const whereClause: any = {};

    if (paymentMode && paymentMode !== 'ALL') {
      whereClause.paymentMode = paymentMode as string;
    }

    if (startDate || endDate) {
      whereClause.date = {};
      if (startDate) {
        whereClause.date.gte = new Date(startDate as string);
      }
      if (endDate) {
        const end = new Date(endDate as string);
        end.setHours(23, 59, 59, 999);
        whereClause.date.lte = end;
      }
    }

    if (search) {
      whereClause.student = {
        OR: [
          { regNo: { contains: search as string, mode: 'insensitive' } },
          { user: { name: { contains: search as string, mode: 'insensitive' } } }
        ]
      };
    }

    const feeClause: any = {};
    let hasFeeClause = false;

    if (type && type !== 'ALL') {
      feeClause.type = type as string;
      hasFeeClause = true;
    }

    if (courseId && courseId !== 'ALL') {
      feeClause.courseId = courseId as string;
      hasFeeClause = true;
    }

    if (month && month !== 'ALL') {
      feeClause.month = month as string;
      hasFeeClause = true;
    }

    if (hasFeeClause) {
      whereClause.fee = feeClause;
    }

    const payments = await prisma.payment.findMany({
      where: whereClause,
      include: {
        student: {
          include: {
            user: { select: { name: true, email: true } }
          }
        },
        fee: {
          include: {
            course: { select: { name: true } }
          }
        }
      },
      orderBy: { date: 'desc' }
    });

    // Compute aggregates
    let totalCollected = 0;
    let academicCollected = 0;
    let hostelCollected = 0;
    let lateFeesCollected = 0;
    let mercyWaivers = 0;

    const paymentModeBreakdown: Record<string, number> = {
      CASH: 0,
      UPI: 0,
      ONLINE: 0,
      CHEQUE: 0,
      MERCY: 0
    };

    const uniqueFeeIds = new Set<string>();

    payments.forEach(p => {
      if (p.paymentMode === 'MERCY') {
        mercyWaivers += p.amount;
        if (p.paymentMode) {
          const mode = p.paymentMode.toUpperCase();
          paymentModeBreakdown[mode] = (paymentModeBreakdown[mode] || 0) + p.amount;
        }
        return;
      }

      totalCollected += p.amount;

      if (p.fee.type === 'ACADEMIC') {
        academicCollected += p.amount;
      } else if (p.fee.type === 'HOSTEL') {
        hostelCollected += p.amount;
      }

      if (p.paymentMode) {
        const mode = p.paymentMode.toUpperCase();
        paymentModeBreakdown[mode] = (paymentModeBreakdown[mode] || 0) + p.amount;
      }

      uniqueFeeIds.add(p.feeId);
    });

    if (uniqueFeeIds.size > 0) {
      // Sum late fees for all uniquely touched fees in this result set
      const touchedFees = await prisma.fee.findMany({
        where: { id: { in: Array.from(uniqueFeeIds) } },
        select: { lateFee: true }
      });
      
      touchedFees.forEach(f => {
        lateFeesCollected += f.lateFee || 0;
      });
    }

    // Group collections by month for monthly trend chart
    const trendMap: Record<string, number> = {};
    payments.forEach(p => {
      const monthLabel = p.date.toLocaleString('default', { month: 'short', year: 'numeric' });
      trendMap[monthLabel] = (trendMap[monthLabel] || 0) + p.amount;
    });
    const monthlyTrend = Object.entries(trendMap).map(([m, amount]) => ({ month: m, amount }));

    res.status(200).json({
      payments,
      aggregates: {
        totalCollected,
        academicCollected,
        hostelCollected,
        lateFeesCollected,
        mercyWaivers,
        paymentModeBreakdown,
        monthlyTrend
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
