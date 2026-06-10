"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const transaction_controller_1 = require("../controllers/transaction.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/verify/:txnId', auth_1.authenticate, (0, auth_1.authorize)(['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT']), transaction_controller_1.getTransactionByTxnId);
router.get('/', auth_1.authenticate, (0, auth_1.authorize)(['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT']), transaction_controller_1.getTransactionHistory);
exports.default = router;
//# sourceMappingURL=transaction.routes.js.map