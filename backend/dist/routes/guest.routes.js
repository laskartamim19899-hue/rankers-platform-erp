"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const guest_controller_1 = require("../controllers/guest.controller");
const router = (0, express_1.Router)();
const ROLES = ['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT'];
router.get('/', auth_1.authenticate, (0, auth_1.authorize)(ROLES), guest_controller_1.getAllGuestTeachers);
router.post('/', auth_1.authenticate, (0, auth_1.authorize)(['SUPER_ADMIN', 'ADMIN']), guest_controller_1.createGuestTeacher);
router.patch('/:id', auth_1.authenticate, (0, auth_1.authorize)(['SUPER_ADMIN', 'ADMIN']), guest_controller_1.updateGuestTeacher);
router.delete('/:id', auth_1.authenticate, (0, auth_1.authorize)(['SUPER_ADMIN', 'ADMIN']), guest_controller_1.deleteGuestTeacher);
router.post('/pay', auth_1.authenticate, (0, auth_1.authorize)(ROLES), guest_controller_1.disburseGuestPayment);
router.get('/payment/:id', auth_1.authenticate, (0, auth_1.authorize)(ROLES), guest_controller_1.getGuestPayment);
router.get('/history/:id', auth_1.authenticate, (0, auth_1.authorize)(ROLES), guest_controller_1.getGuestPaymentHistory);
router.delete('/payment/:id', auth_1.authenticate, (0, auth_1.authorize)(ROLES), guest_controller_1.deleteGuestPayment);
exports.default = router;
//# sourceMappingURL=guest.routes.js.map