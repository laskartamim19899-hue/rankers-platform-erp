"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const report_controller_1 = require("../controllers/report.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/finance', auth_1.authenticate, (0, auth_1.authorize)(['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT']), report_controller_1.getFinancialSummary);
router.get('/academic', auth_1.authenticate, (0, auth_1.authorize)(['SUPER_ADMIN', 'ADMIN', 'TEACHER', 'ACCOUNTANT']), report_controller_1.getAcademicAnalytics);
router.get('/payroll', auth_1.authenticate, (0, auth_1.authorize)(['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT']), report_controller_1.getPayrollReport);
router.get('/expenses', auth_1.authenticate, (0, auth_1.authorize)(['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT']), report_controller_1.getExpenseAnalysis);
router.get('/dashboard', auth_1.authenticate, (0, auth_1.authorize)(['SUPER_ADMIN', 'ADMIN']), report_controller_1.getDashboardStats);
router.get('/collections', auth_1.authenticate, (0, auth_1.authorize)(['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT']), report_controller_1.getCollectionReport);
exports.default = router;
//# sourceMappingURL=report.routes.js.map