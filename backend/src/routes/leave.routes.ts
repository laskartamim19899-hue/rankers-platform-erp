import { Router } from 'express';
import { issueLeave, getAllLeaves, getLeaveById, updateLeaveStatus, deleteLeave, submitLeaveApplication, approveLeaveApplication, rejectLeaveApplication, getLeaveStatusByRegNo } from '../controllers/leave.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// PUBLIC — no login required
router.post('/apply', submitLeaveApplication);
router.get('/status/:regNo', getLeaveStatusByRegNo);

// ADMIN — approve / reject
router.patch('/:id/approve', authenticate, authorize(['SUPER_ADMIN', 'ADMIN']), approveLeaveApplication);
router.patch('/:id/reject', authenticate, authorize(['SUPER_ADMIN', 'ADMIN']), rejectLeaveApplication);

// Existing routes
router.get('/', authenticate, getAllLeaves);
router.post('/', authenticate, issueLeave);
router.get('/:id', authenticate, getLeaveById);
router.patch('/:id/status', authenticate, updateLeaveStatus);
router.delete('/:id', authenticate, authorize(['SUPER_ADMIN', 'ADMIN']), deleteLeave);

export default router;
