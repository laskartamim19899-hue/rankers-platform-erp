import { Router } from 'express';
import { getStudentAcademicSummary, markAttendance, addTestResult, getCourses, getBatches, getTests, createTest, createBatch, assignTeacher, getTeachers, createCourse, deleteCourse, deleteBatch, getAttendanceReport, getResultsByRegNo } from '../controllers/academic.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/student/:studentId', authenticate, getStudentAcademicSummary);
router.get('/results/public/:regNo', getResultsByRegNo);  // PUBLIC — no auth
router.post('/attendance', authenticate, authorize(['SUPER_ADMIN', 'ADMIN', 'TEACHER']), markAttendance);
router.get('/courses', authenticate, getCourses);
router.post('/courses', authenticate, authorize(['SUPER_ADMIN', 'ADMIN']), createCourse);
router.delete('/courses/:id', authenticate, authorize(['SUPER_ADMIN', 'ADMIN']), deleteCourse);

// New endpoints for Batches and Tests
router.get('/batches', authenticate, getBatches);
router.post('/batches', authenticate, authorize(['SUPER_ADMIN', 'ADMIN']), createBatch);
router.delete('/batches/:id', authenticate, authorize(['SUPER_ADMIN', 'ADMIN']), deleteBatch);
router.patch('/batches/:id/assign', authenticate, authorize(['SUPER_ADMIN', 'ADMIN']), assignTeacher);
router.get('/teachers', authenticate, authorize(['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT']), getTeachers);
router.get('/tests', authenticate, getTests);
router.post('/tests', authenticate, authorize(['SUPER_ADMIN', 'ADMIN', 'TEACHER']), createTest);
router.post('/results', authenticate, authorize(['SUPER_ADMIN', 'ADMIN', 'TEACHER']), addTestResult);
router.get('/attendance/report', authenticate, authorize(['SUPER_ADMIN', 'ADMIN', 'TEACHER']), getAttendanceReport);

export default router;
