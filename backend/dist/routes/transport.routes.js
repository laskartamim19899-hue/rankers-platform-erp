"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const transport_controller_1 = require("../controllers/transport.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Require authentication for all transport routes
router.use(auth_1.authenticate);
router.get('/vehicles', transport_controller_1.getVehicles);
router.post('/vehicles', transport_controller_1.createVehicle);
router.get('/routes', transport_controller_1.getRoutes);
router.post('/routes', transport_controller_1.createRoute);
router.post('/allocate', transport_controller_1.allocateTransport);
exports.default = router;
//# sourceMappingURL=transport.routes.js.map