"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const residential_controller_1 = require("../controllers/residential.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/hostels', auth_1.authenticate, residential_controller_1.getAllHostels);
router.post('/hostels', auth_1.authenticate, (0, auth_1.authorize)(['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT']), residential_controller_1.createHostel);
router.delete('/hostels/:id', auth_1.authenticate, (0, auth_1.authorize)(['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT']), residential_controller_1.deleteHostel);
router.post('/allocate', auth_1.authenticate, (0, auth_1.authorize)(['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT']), residential_controller_1.allocateRoom);
router.delete('/deallocate/:studentId', auth_1.authenticate, (0, auth_1.authorize)(['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT']), residential_controller_1.deallocateRoom);
exports.default = router;
//# sourceMappingURL=residential.routes.js.map