import { Router } from 'express';
import { getStudentFees, recordPayment, getAllDues, allocateFee, getPayment, deletePayment, getStudentLedger } from '../controllers/finance.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/ledger/search', authenticate, authorize(['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT']), getStudentLedger);
router.get('/student/:studentId', authenticate, getStudentFees);
router.post('/payment', authenticate, authorize(['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT']), recordPayment);
router.get('/dues', authenticate, authorize(['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT']), getAllDues);
router.post('/allocate', authenticate, authorize(['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT']), allocateFee);
router.get('/payment/:id', authenticate, getPayment);
router.delete('/payment/:id', authenticate, authorize(['SUPER_ADMIN', 'ADMIN']), deletePayment);

export default router;
