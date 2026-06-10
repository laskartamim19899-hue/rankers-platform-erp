"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const salary_controller_1 = require("../controllers/salary.controller");
const router = (0, express_1.Router)();
router.get('/', auth_1.authenticate, (0, auth_1.authorize)(['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT']), salary_controller_1.getAllStaffSalaries);
router.post('/profile', auth_1.authenticate, (0, auth_1.authorize)(['SUPER_ADMIN', 'ADMIN']), salary_controller_1.upsertStaffProfile);
router.post('/disburse', auth_1.authenticate, (0, auth_1.authorize)(['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT']), salary_controller_1.disburseSalary);
router.get('/record/:id', auth_1.authenticate, (0, auth_1.authorize)(['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT']), salary_controller_1.getSalaryRecord);
router.get('/history/:profileId', auth_1.authenticate, (0, auth_1.authorize)(['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT']), salary_controller_1.getStaffSalaryHistory);
router.delete('/record/:id', auth_1.authenticate, (0, auth_1.authorize)(['SUPER_ADMIN', 'ADMIN']), salary_controller_1.deleteSalaryRecord);
exports.default = router;
//# sourceMappingURL=salary.routes.js.map