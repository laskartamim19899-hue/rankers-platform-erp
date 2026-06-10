import { Router } from 'express';
import { register, login, changePassword, forgotPassword, resetPassword, adminResetPassword } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/change-password', authenticate, changePassword);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/admin-reset-password', adminResetPassword);

export default router;
