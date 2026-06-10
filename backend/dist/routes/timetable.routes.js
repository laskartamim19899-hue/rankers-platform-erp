"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const timetable_controller_1 = require("../controllers/timetable.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/', auth_1.authenticate, timetable_controller_1.getAllTimetables);
router.get('/:batchId', auth_1.authenticate, timetable_controller_1.getTimetable);
router.post('/', auth_1.authenticate, timetable_controller_1.upsertTimetable);
router.delete('/slot/:id', auth_1.authenticate, timetable_controller_1.deleteSlot);
exports.default = router;
//# sourceMappingURL=timetable.routes.js.map