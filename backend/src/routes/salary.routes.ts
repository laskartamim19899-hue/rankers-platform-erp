import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  getAllStaffSalaries,
  upsertStaffProfile,
  disburseSalary,
  getSalaryRecord,
  getStaffSalaryHistory,
  deleteSalaryRecord
} from '../controllers/salary.controller';

const router = Router();

router.get('/', authenticate, authorize(['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT']), getAllStaffSalaries);
router.post('/profile', authenticate, authorize(['SUPER_ADMIN', 'ADMIN']), upsertStaffProfile);
router.post('/disburse', authenticate, authorize(['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT']), disburseSalary);
router.get('/record/:id', authenticate, authorize(['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT']), getSalaryRecord);
router.get('/history/:profileId', authenticate, authorize(['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT']), getStaffSalaryHistory);
router.delete('/record/:id', authenticate, authorize(['SUPER_ADMIN', 'ADMIN']), deleteSalaryRecord);

export default router;
