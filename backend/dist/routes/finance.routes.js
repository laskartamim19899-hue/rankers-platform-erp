"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const finance_controller_1 = require("../controllers/finance.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/ledger/search', auth_1.authenticate, (0, auth_1.authorize)(['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT']), finance_controller_1.getStudentLedger);
router.get('/student/:studentId', auth_1.authenticate, finance_controller_1.getStudentFees);
router.get('/all-pending', auth_1.authenticate, (0, auth_1.authorize)(['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT']), finance_controller_1.getAllPendingFees);
router.post('/payment', auth_1.authenticate, (0, auth_1.authorize)(['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT']), finance_controller_1.recordPayment);
router.get('/dues', auth_1.authenticate, (0, auth_1.authorize)(['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT']), finance_controller_1.getAllDues);
router.post('/allocate', auth_1.authenticate, (0, auth_1.authorize)(['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT']), finance_controller_1.allocateFee);
router.get('/payment/:id', auth_1.authenticate, finance_controller_1.getPayment);
router.delete('/payment/:id', auth_1.authenticate, (0, auth_1.authorize)(['SUPER_ADMIN', 'ADMIN']), finance_controller_1.deletePayment);
exports.default = router;
//# sourceMappingURL=finance.routes.js.map