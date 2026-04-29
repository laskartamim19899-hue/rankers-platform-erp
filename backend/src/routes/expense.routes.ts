import { Router } from 'express';
import { createExpense, getExpenses, getExpense, deleteExpense } from '../controllers/expense.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, authorize(['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT']), getExpenses);
router.get('/:id', authenticate, authorize(['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT']), getExpense);
router.post('/', authenticate, authorize(['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT']), createExpense);
router.delete('/:id', authenticate, authorize(['SUPER_ADMIN', 'ADMIN']), deleteExpense);

export default router;
