"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const otherIncome_controller_1 = require("../controllers/otherIncome.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.use((0, auth_1.authorize)(['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT']));
router.post('/', otherIncome_controller_1.createOtherIncome);
router.get('/', otherIncome_controller_1.getAllOtherIncome);
router.get('/:id', otherIncome_controller_1.getOtherIncomeById);
router.delete('/:id', otherIncome_controller_1.deleteOtherIncome);
exports.default = router;
//# sourceMappingURL=otherIncome.routes.js.map