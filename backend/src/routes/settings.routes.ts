import { Router } from 'express';
import { getSettings, updateSettings, waiveLateFee } from '../controllers/settings.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, authorize(['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT']), getSettings);
router.put('/', authenticate, authorize(['SUPER_ADMIN']), updateSettings);
router.post('/waive-late-fee/:feeId', authenticate, authorize(['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT']), waiveLateFee);

export default router;
