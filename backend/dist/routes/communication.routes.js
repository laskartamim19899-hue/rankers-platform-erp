"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const communication_controller_1 = require("../controllers/communication.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/', auth_1.authenticate, communication_controller_1.getAnnouncements);
router.post('/', auth_1.authenticate, (0, auth_1.authorize)(['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT']), communication_controller_1.createAnnouncement);
router.delete('/:id', auth_1.authenticate, (0, auth_1.authorize)(['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT']), communication_controller_1.deleteAnnouncement);
exports.default = router;
//# sourceMappingURL=communication.routes.js.map