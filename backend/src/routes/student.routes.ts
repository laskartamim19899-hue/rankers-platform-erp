import { Router } from 'express';
import { createStudent, getAllStudents, getStudentById, updateStudent, searchStudentByRegNo, getPendingStudents, approveStudent, deleteStudent } from '../controllers/student.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.post('/', createStudent);
router.get('/pending', authenticate, authorize(['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT']), getPendingStudents);
router.post('/:id/approve', authenticate, authorize(['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT']), approveStudent);
router.get('/', authenticate, authorize(['SUPER_ADMIN', 'ADMIN', 'TEACHER', 'ACCOUNTANT']), getAllStudents);
router.get('/search/:regNo', authenticate, authorize(['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT']), searchStudentByRegNo);
router.get('/:id', authenticate, getStudentById);
router.patch('/:id', authenticate, updateStudent);
router.delete('/:id', authenticate, authorize(['SUPER_ADMIN', 'ADMIN']), deleteStudent);

export default router;
