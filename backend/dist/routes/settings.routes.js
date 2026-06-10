"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const settings_controller_1 = require("../controllers/settings.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/', auth_1.authenticate, (0, auth_1.authorize)(['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT']), settings_controller_1.getSettings);
router.put('/', auth_1.authenticate, (0, auth_1.authorize)(['SUPER_ADMIN']), settings_controller_1.updateSettings);
router.post('/waive-late-fee/:feeId', auth_1.authenticate, (0, auth_1.authorize)(['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT']), settings_controller_1.waiveLateFee);
exports.default = router;
//# sourceMappingURL=settings.routes.js.map