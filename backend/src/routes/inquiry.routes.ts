import { Router } from 'express';
import { createInquiry, getInquiries, updateInquiryStatus, deleteInquiry } from '../controllers/inquiry.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Public route for students to apply
router.post('/apply', createInquiry);

// Admin routes to manage inquiries
router.get('/', authenticate, authorize(['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT']), getInquiries);
router.patch('/:id/status', authenticate, authorize(['SUPER_ADMIN', 'ADMIN']), updateInquiryStatus);
router.delete('/:id', authenticate, authorize(['SUPER_ADMIN', 'ADMIN']), deleteInquiry);

export default router;
