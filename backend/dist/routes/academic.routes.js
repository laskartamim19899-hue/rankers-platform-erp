"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const academic_controller_1 = require("../controllers/academic.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/student/:studentId', auth_1.authenticate, academic_controller_1.getStudentAcademicSummary);
router.get('/results/public/:regNo', academic_controller_1.getResultsByRegNo); // PUBLIC — no auth
router.post('/attendance', auth_1.authenticate, (0, auth_1.authorize)(['SUPER_ADMIN', 'ADMIN', 'TEACHER']), academic_controller_1.markAttendance);
router.get('/courses', auth_1.authenticate, academic_controller_1.getCourses);
router.post('/courses', auth_1.authenticate, (0, auth_1.authorize)(['SUPER_ADMIN', 'ADMIN']), academic_controller_1.createCourse);
router.delete('/courses/:id', auth_1.authenticate, (0, auth_1.authorize)(['SUPER_ADMIN', 'ADMIN']), academic_controller_1.deleteCourse);
// New endpoints for Batches and Tests
router.get('/batches', auth_1.authenticate, academic_controller_1.getBatches);
router.post('/batches', auth_1.authenticate, (0, auth_1.authorize)(['SUPER_ADMIN', 'ADMIN']), academic_controller_1.createBatch);
router.delete('/batches/:id', auth_1.authenticate, (0, auth_1.authorize)(['SUPER_ADMIN', 'ADMIN']), academic_controller_1.deleteBatch);
router.patch('/batches/:id/assign', auth_1.authenticate, (0, auth_1.authorize)(['SUPER_ADMIN', 'ADMIN']), academic_controller_1.assignTeacher);
router.get('/teachers', auth_1.authenticate, (0, auth_1.authorize)(['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT']), academic_controller_1.getTeachers);
router.get('/tests', auth_1.authenticate, academic_controller_1.getTests);
router.post('/tests', auth_1.authenticate, (0, auth_1.authorize)(['SUPER_ADMIN', 'ADMIN', 'TEACHER']), academic_controller_1.createTest);
router.post('/results', auth_1.authenticate, (0, auth_1.authorize)(['SUPER_ADMIN', 'ADMIN', 'TEACHER']), academic_controller_1.addTestResult);
router.get('/attendance/report', auth_1.authenticate, (0, auth_1.authorize)(['SUPER_ADMIN', 'ADMIN', 'TEACHER']), academic_controller_1.getAttendanceReport);
exports.default = router;
//# sourceMappingURL=academic.routes.js.map