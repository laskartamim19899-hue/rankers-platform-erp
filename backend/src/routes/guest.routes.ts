import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  getAllGuestTeachers,
  createGuestTeacher,
  updateGuestTeacher,
  deleteGuestTeacher,
  disburseGuestPayment,
  getGuestPayment,
  getGuestPaymentHistory,
  deleteGuestPayment
} from '../controllers/guest.controller';

const router = Router();

const ROLES = ['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT'];

router.get('/', authenticate, authorize(ROLES), getAllGuestTeachers);
router.post('/', authenticate, authorize(['SUPER_ADMIN', 'ADMIN']), createGuestTeacher);
router.patch('/:id', authenticate, authorize(['SUPER_ADMIN', 'ADMIN']), updateGuestTeacher);
router.delete('/:id', authenticate, authorize(['SUPER_ADMIN', 'ADMIN']), deleteGuestTeacher);
router.post('/pay', authenticate, authorize(ROLES), disburseGuestPayment);
router.get('/payment/:id', authenticate, authorize(ROLES), getGuestPayment);
router.get('/history/:id', authenticate, authorize(ROLES), getGuestPaymentHistory);
router.delete('/payment/:id', authenticate, authorize(['SUPER_ADMIN', 'ADMIN']), deleteGuestPayment);

export default router;
