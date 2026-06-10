"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCollectionReport = exports.getExpenseAnalysis = exports.getDashboardStats = exports.getPayrollReport = exports.getAcademicAnalytics = exports.getFinancialSummary = void 0;
const prisma_1 = __importDefault(require("../prisma"));
// In-memory cache for the dashboard summary
let dashboardCache = null;
const CACHE_TTL_MS = 30_000; // 30 seconds
const getFinancialSummary = async (req, res) => {
    try {
        // Return cached data immediately if fresh enough
        if (dashboardCache && (Date.now() - dashboardCache.ts) < CACHE_TTL_MS) {
            res.setHeader('X-Cache', 'HIT');
            res.status(200).json(dashboardCache.data);
            return;
        }
        // Fire ALL queries in parallel — no more sequential waterfall
        const [dueFees, totalCollected, settings, academicPayments, reserveExpenses, generalExpenses, recentPayments, recentStudents, totalStudents, topPerformers, courses, allPayments] = await Promise.all([
            prisma_1.default.fee.findMany({
                where: { status: { in: ['PENDING', 'PARTIAL'] }, dueDate: { lte: new Date() }, student: { status: { not: 'INACTIVE' } } },
                include: { payments: { select: { amount: true } } }
            }),
            prisma_1.default.payment.aggregate({ _sum: { amount: true } }),
            prisma_1.default.institutionSettings.findUnique({ where: { id: 'singleton' } }),
            prisma_1.default.payment.aggregate({ _sum: { amount: true }, where: { fee: { type: 'ACADEMIC' } } }),
            prisma_1.default.expense.aggregate({ _sum: { amount: true }, where: { fundSource: 'RESERVE' } }),
            prisma_1.default.expense.aggregate({ _sum: { amount: true }, where: { fundSource: 'GENERAL' } }),
            prisma_1.default.payment.findMany({
                take: 5,
                orderBy: { date: 'desc' },
                include: { student: { include: { user: { select: { name: true } } } } }
            }),
            prisma_1.default.student.findMany({
                take: 5,
                orderBy: { user: { createdAt: 'desc' } },
                include: { user: { select: { name: true, createdAt: true } }, courses: { include: { course: true } } }
            }),
            prisma_1.default.student.count({ where: { status: 'APPROVED' } }),
            prisma_1.default.student.count({ where: { hsMarksPhysics: { gte: 90 } } }),
            prisma_1.default.course.findMany({ include: { _count: { select: { students: true } } } }),
            prisma_1.default.payment.findMany({ select: { amount: true, date: true } })
        ]);
        // Compute derived values
        const pendingTotal = dueFees.reduce((sum, fee) => {
            const gross = fee.amount + (fee.lateFee || 0);
            const paid = fee.payments.reduce((s, p) => s + p.amount, 0);
            return sum + Math.max(0, gross - paid);
        }, 0);
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
        const revMap = {};
        allPayments.forEach(p => {
            const month = p.date.toLocaleString('default', { month: 'short' });
            revMap[month] = (revMap[month] || 0) + p.amount;
        });
        const revenueOverTime = Object.entries(revMap).map(([month, amount]) => ({ month, amount }));
        const result = {
            pending: pendingTotal,
            collected: totalCollectedAmount,
            recentStream: stream,
            totalStudents,
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
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getFinancialSummary = getFinancialSummary;
const getAcademicAnalytics = async (req, res) => {
    try {
        const totalStudents = await prisma_1.default.student.count({ where: { status: 'APPROVED' } });
        const attendanceStats = await prisma_1.default.attendance.groupBy({
            by: ['status'],
            _count: { _all: true }
        });
        const testPerformance = await prisma_1.default.result.aggregate({
            _avg: { marksObtained: true }
        });
        res.status(200).json({
            totalStudents,
            attendanceStats,
            averageScore: testPerformance._avg.marksObtained || 0
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getAcademicAnalytics = getAcademicAnalytics;
const getPayrollReport = async (req, res) => {
    try {
        const salaries = await prisma_1.default.expense.findMany({
            where: { category: { in: ['SALARY', 'STAFF_SALARY', 'TEACHER_SALARY'] } },
            orderBy: { date: 'desc' }
        });
        // Group by Date for a Day Payroll view
        const payrollMap = {};
        salaries.forEach(s => {
            const dateStr = s.date.toISOString().split('T')[0];
            if (!payrollMap[dateStr])
                payrollMap[dateStr] = [];
            payrollMap[dateStr].push(s);
        });
        const dayPayroll = Object.keys(payrollMap).map(date => ({
            date,
            totalAmount: payrollMap[date].reduce((acc, curr) => acc + curr.amount, 0),
            records: payrollMap[date]
        })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        res.status(200).json(dayPayroll);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getPayrollReport = getPayrollReport;
const getDashboardStats = async (req, res) => {
    try {
        const [totalStudents, pendingStudents, hostelStudents, totalCollected, totalExpenses, dueFees, payments] = await Promise.all([
            prisma_1.default.student.count({ where: { status: 'APPROVED' } }),
            prisma_1.default.student.count({ where: { status: 'PENDING' } }),
            prisma_1.default.student.count({ where: { isResidential: true, status: 'APPROVED' } }),
            prisma_1.default.payment.aggregate({ _sum: { amount: true } }),
            prisma_1.default.expense.aggregate({ _sum: { amount: true } }),
            prisma_1.default.fee.findMany({
                where: { status: { in: ['PENDING', 'PARTIAL'] }, dueDate: { lte: new Date() }, student: { status: { not: 'INACTIVE' } } },
                include: { payments: { select: { amount: true } } }
            }),
            prisma_1.default.payment.findMany({
                select: { amount: true, date: true }
            })
        ]);
        // Calculate total dues
        const totalDues = dueFees.reduce((sum, fee) => {
            const gross = fee.amount + (fee.lateFee || 0);
            const paid = fee.payments.reduce((s, p) => s + p.amount, 0);
            return sum + Math.max(0, gross - paid);
        }, 0);
        // Calculate monthly collection trend
        const revMap = {};
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
            totalDues,
            totalExpenses: totalExpenses._sum.amount || 0,
            monthlyCollection
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getDashboardStats = getDashboardStats;
const getExpenseAnalysis = async (req, res) => {
    try {
        const expenses = await prisma_1.default.expense.findMany({
            orderBy: { date: 'desc' }
        });
        const categoryMap = {};
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
        const trendMap = {};
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
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getExpenseAnalysis = getExpenseAnalysis;
const getCollectionReport = async (req, res) => {
    try {
        const { type, courseId, month, paymentMode, startDate, endDate, search } = req.query;
        const whereClause = {};
        if (paymentMode && paymentMode !== 'ALL') {
            whereClause.paymentMode = paymentMode;
        }
        if (startDate || endDate) {
            whereClause.date = {};
            if (startDate) {
                whereClause.date.gte = new Date(startDate);
            }
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                whereClause.date.lte = end;
            }
        }
        if (search) {
            whereClause.student = {
                OR: [
                    { regNo: { contains: search, mode: 'insensitive' } },
                    { user: { name: { contains: search, mode: 'insensitive' } } }
                ]
            };
        }
        const feeClause = {};
        let hasFeeClause = false;
        if (type && type !== 'ALL') {
            feeClause.type = type;
            hasFeeClause = true;
        }
        if (courseId && courseId !== 'ALL') {
            feeClause.courseId = courseId;
            hasFeeClause = true;
        }
        if (month && month !== 'ALL') {
            feeClause.month = month;
            hasFeeClause = true;
        }
        if (hasFeeClause) {
            whereClause.fee = feeClause;
        }
        const payments = await prisma_1.default.payment.findMany({
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
        const paymentModeBreakdown = {
            CASH: 0,
            UPI: 0,
            ONLINE: 0,
            CHEQUE: 0
        };
        const uniqueFeeIds = new Set();
        payments.forEach(p => {
            totalCollected += p.amount;
            if (p.fee.type === 'ACADEMIC') {
                academicCollected += p.amount;
            }
            else if (p.fee.type === 'HOSTEL') {
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
            const touchedFees = await prisma_1.default.fee.findMany({
                where: { id: { in: Array.from(uniqueFeeIds) } },
                select: { lateFee: true }
            });
            touchedFees.forEach(f => {
                lateFeesCollected += f.lateFee || 0;
            });
        }
        // Group collections by month for monthly trend chart
        const trendMap = {};
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
                paymentModeBreakdown,
                monthlyTrend
            }
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getCollectionReport = getCollectionReport;
//# sourceMappingURL=report.controller.js.map