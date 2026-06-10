import { Router } from 'express';
import { getFinancialSummary, getAcademicAnalytics, getPayrollReport, getDashboardStats, getExpenseAnalysis, getCollectionReport } from '../controllers/report.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/finance', authenticate, authorize(['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT']), getFinancialSummary);
router.get('/academic', authenticate, authorize(['SUPER_ADMIN', 'ADMIN', 'TEACHER', 'ACCOUNTANT']), getAcademicAnalytics);
router.get('/payroll', authenticate, authorize(['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT']), getPayrollReport);
router.get('/expenses', authenticate, authorize(['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT']), getExpenseAnalysis);
router.get('/dashboard', authenticate, authorize(['SUPER_ADMIN', 'ADMIN']), getDashboardStats);
router.get('/collections', authenticate, authorize(['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT']), getCollectionReport);

export default router;
