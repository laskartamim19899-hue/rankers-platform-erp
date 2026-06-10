import { Router } from 'express';
import { 
  createExpense, 
  getExpenses, 
  getExpense, 
  deleteExpense,
  getCategories,
  createCategory,
  deleteCategory
} from '../controllers/expense.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, authorize(['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT']), getExpenses);
router.get('/:id', authenticate, authorize(['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT']), getExpense);
router.post('/', authenticate, authorize(['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT']), createExpense);
router.delete('/:id', authenticate, authorize(['SUPER_ADMIN', 'ADMIN']), deleteExpense);

// Category Routes
router.get('/categories/all', authenticate, authorize(['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT']), getCategories);
router.post('/categories/add', authenticate, authorize(['SUPER_ADMIN', 'ADMIN']), createCategory);
router.delete('/categories/:id', authenticate, authorize(['SUPER_ADMIN', 'ADMIN']), deleteCategory);

export default router;
