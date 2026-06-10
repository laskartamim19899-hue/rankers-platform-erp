"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const expense_controller_1 = require("../controllers/expense.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/', auth_1.authenticate, (0, auth_1.authorize)(['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT']), expense_controller_1.getExpenses);
router.get('/:id', auth_1.authenticate, (0, auth_1.authorize)(['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT']), expense_controller_1.getExpense);
router.post('/', auth_1.authenticate, (0, auth_1.authorize)(['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT']), expense_controller_1.createExpense);
router.delete('/:id', auth_1.authenticate, (0, auth_1.authorize)(['SUPER_ADMIN', 'ADMIN']), expense_controller_1.deleteExpense);
// Category Routes
router.get('/categories/all', auth_1.authenticate, (0, auth_1.authorize)(['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT']), expense_controller_1.getCategories);
router.post('/categories/add', auth_1.authenticate, (0, auth_1.authorize)(['SUPER_ADMIN', 'ADMIN']), expense_controller_1.createCategory);
router.delete('/categories/:id', auth_1.authenticate, (0, auth_1.authorize)(['SUPER_ADMIN', 'ADMIN']), expense_controller_1.deleteCategory);
exports.default = router;
//# sourceMappingURL=expense.routes.js.map