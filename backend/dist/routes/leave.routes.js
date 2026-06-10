"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const leave_controller_1 = require("../controllers/leave.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// PUBLIC — no login required
router.post('/apply', leave_controller_1.submitLeaveApplication);
router.get('/status/:regNo', leave_controller_1.getLeaveStatusByRegNo);
// ADMIN — approve / reject
router.patch('/:id/approve', auth_1.authenticate, (0, auth_1.authorize)(['SUPER_ADMIN', 'ADMIN']), leave_controller_1.approveLeaveApplication);
router.patch('/:id/reject', auth_1.authenticate, (0, auth_1.authorize)(['SUPER_ADMIN', 'ADMIN']), leave_controller_1.rejectLeaveApplication);
// Existing routes
router.get('/', auth_1.authenticate, leave_controller_1.getAllLeaves);
router.post('/', auth_1.authenticate, leave_controller_1.issueLeave);
router.get('/:id', auth_1.authenticate, leave_controller_1.getLeaveById);
router.patch('/:id/status', auth_1.authenticate, leave_controller_1.updateLeaveStatus);
router.delete('/:id', auth_1.authenticate, (0, auth_1.authorize)(['SUPER_ADMIN', 'ADMIN']), leave_controller_1.deleteLeave);
exports.default = router;
//# sourceMappingURL=leave.routes.js.map