import { Router } from 'express';
import { getTransactionHistory, getTransactionByTxnId } from '../controllers/transaction.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/verify/:txnId', authenticate, authorize(['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT']), getTransactionByTxnId);
router.get('/', authenticate, authorize(['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT']), getTransactionHistory);

export default router;
