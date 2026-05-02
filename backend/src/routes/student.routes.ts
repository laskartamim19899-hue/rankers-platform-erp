import { Router } from 'express';
import { createStudent, getAllStudents, getStudentById, updateStudent, searchStudentByRegNo, getPendingStudents, approveStudent, deleteStudent, enrollOrPromote } from '../controllers/student.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.post('/', createStudent);
router.get('/pending', authenticate, authorize(['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT']), getPendingStudents);
router.post('/:id/approve', authenticate, authorize(['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT']), approveStudent);
router.post('/:id/enroll', authenticate, authorize(['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT']), enrollOrPromote);
router.get('/', authenticate, authorize(['SUPER_ADMIN', 'ADMIN', 'TEACHER', 'ACCOUNTANT']), getAllStudents);
router.get('/search/:regNo', authenticate, authorize(['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT']), searchStudentByRegNo);
router.get('/:id', authenticate, getStudentById);
router.patch('/:id', authenticate, updateStudent);
router.delete('/:id', authenticate, authorize(['SUPER_ADMIN', 'ADMIN']), deleteStudent);

export default router;
