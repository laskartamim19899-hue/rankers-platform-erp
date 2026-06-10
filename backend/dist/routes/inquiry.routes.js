"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const inquiry_controller_1 = require("../controllers/inquiry.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Public route for students to apply
router.post('/apply', inquiry_controller_1.createInquiry);
// Admin routes to manage inquiries
router.get('/', auth_1.authenticate, (0, auth_1.authorize)(['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT']), inquiry_controller_1.getInquiries);
router.patch('/:id/status', auth_1.authenticate, (0, auth_1.authorize)(['SUPER_ADMIN', 'ADMIN']), inquiry_controller_1.updateInquiryStatus);
router.delete('/:id', auth_1.authenticate, (0, auth_1.authorize)(['SUPER_ADMIN', 'ADMIN']), inquiry_controller_1.deleteInquiry);
exports.default = router;
//# sourceMappingURL=inquiry.routes.js.map