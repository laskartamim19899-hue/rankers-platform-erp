"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const merit_controller_1 = require("../controllers/merit.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/', auth_1.authenticate, merit_controller_1.getMeritBoard);
router.post('/auto-assign', auth_1.authenticate, merit_controller_1.autoAssignTiers);
router.patch('/:id/tier', auth_1.authenticate, merit_controller_1.updateScholarshipTier);
exports.default = router;
//# sourceMappingURL=merit.routes.js.map