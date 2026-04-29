import { Router } from 'express';
import { getAnnouncements, createAnnouncement, deleteAnnouncement } from '../controllers/communication.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getAnnouncements);
router.post('/', authenticate, authorize(['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT']), createAnnouncement);
router.delete('/:id', authenticate, authorize(['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT']), deleteAnnouncement);

export default router;
