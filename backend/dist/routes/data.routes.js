"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const data_controller_1 = require("../controllers/data.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Only SUPER_ADMIN can do these destructive/sensitive operations
router.get('/export', auth_1.authenticate, (0, auth_1.authorize)(['SUPER_ADMIN']), data_controller_1.exportAllData);
router.post('/reset', auth_1.authenticate, (0, auth_1.authorize)(['SUPER_ADMIN']), data_controller_1.resetAllData);
router.post('/import', auth_1.authenticate, (0, auth_1.authorize)(['SUPER_ADMIN']), data_controller_1.importData);
exports.default = router;
//# sourceMappingURL=data.routes.js.map