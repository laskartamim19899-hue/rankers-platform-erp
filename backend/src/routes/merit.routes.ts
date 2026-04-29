import { Router } from 'express';
import { getMeritBoard, updateScholarshipTier, autoAssignTiers } from '../controllers/merit.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
router.get('/', authenticate, getMeritBoard);
router.post('/auto-assign', authenticate, autoAssignTiers);
router.patch('/:id/tier', authenticate, updateScholarshipTier);
export default router;
