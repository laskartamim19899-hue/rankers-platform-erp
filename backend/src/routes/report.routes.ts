import { Router } from 'express';
import { getFinancialSummary, getAcademicAnalytics, getPayrollReport } from '../controllers/report.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/finance', authenticate, authorize(['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT']), getFinancialSummary);
router.get('/academic', authenticate, authorize(['SUPER_ADMIN', 'ADMIN', 'TEACHER', 'ACCOUNTANT']), getAcademicAnalytics);
router.get('/payroll', authenticate, authorize(['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT']), getPayrollReport);

export default router;
