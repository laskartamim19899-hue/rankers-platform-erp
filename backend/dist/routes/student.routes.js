"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const student_controller_1 = require("../controllers/student.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.post('/', student_controller_1.createStudent);
router.get('/pending', auth_1.authenticate, (0, auth_1.authorize)(['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT']), student_controller_1.getPendingStudents);
router.post('/:id/approve', auth_1.authenticate, (0, auth_1.authorize)(['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT']), student_controller_1.approveStudent);
router.post('/:id/enroll', auth_1.authenticate, (0, auth_1.authorize)(['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT']), student_controller_1.enrollOrPromote);
router.get('/', auth_1.authenticate, (0, auth_1.authorize)(['SUPER_ADMIN', 'ADMIN', 'TEACHER', 'ACCOUNTANT']), student_controller_1.getAllStudents);
router.get('/search/:regNo', auth_1.authenticate, (0, auth_1.authorize)(['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT']), student_controller_1.searchStudentByRegNo);
router.get('/:id', auth_1.authenticate, student_controller_1.getStudentById);
router.patch('/:id', auth_1.authenticate, student_controller_1.updateStudent);
router.delete('/:id', auth_1.authenticate, (0, auth_1.authorize)(['SUPER_ADMIN', 'ADMIN']), student_controller_1.deleteStudent);
exports.default = router;
//# sourceMappingURL=student.routes.js.map