import { Router } from 'express';
import { 
  createOtherIncome, 
  getAllOtherIncome, 
  getOtherIncomeById, 
  deleteOtherIncome 
} from '../controllers/otherIncome.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.use(authorize(['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT']));

router.post('/', createOtherIncome);
router.get('/', getAllOtherIncome);
router.get('/:id', getOtherIncomeById);
router.delete('/:id', deleteOtherIncome);

export default router;
