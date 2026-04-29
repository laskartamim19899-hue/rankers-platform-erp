import { Router } from 'express';
import { exportAllData, resetAllData, importData } from '../controllers/data.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Only SUPER_ADMIN can do these destructive/sensitive operations
router.get('/export', authenticate, authorize(['SUPER_ADMIN']), exportAllData);
router.post('/reset', authenticate, authorize(['SUPER_ADMIN']), resetAllData);
router.post('/import', authenticate, authorize(['SUPER_ADMIN']), importData);

export default router;
