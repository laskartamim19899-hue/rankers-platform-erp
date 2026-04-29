import { Router } from 'express';
import { getAllHostels, allocateRoom, deallocateRoom, createHostel, deleteHostel } from '../controllers/residential.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/hostels', authenticate, getAllHostels);
router.post('/hostels', authenticate, authorize(['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT']), createHostel);
router.delete('/hostels/:id', authenticate, authorize(['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT']), deleteHostel);
router.post('/allocate', authenticate, authorize(['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT']), allocateRoom);
router.delete('/deallocate/:studentId', authenticate, authorize(['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT']), deallocateRoom);

export default router;
