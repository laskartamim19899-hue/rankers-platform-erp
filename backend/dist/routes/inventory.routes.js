"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const inventory_controller_1 = require("../controllers/inventory.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/', auth_1.authenticate, inventory_controller_1.getAllItems);
router.get('/issues', auth_1.authenticate, inventory_controller_1.getAllIssues);
router.post('/', auth_1.authenticate, inventory_controller_1.createItem);
router.post('/issue', auth_1.authenticate, inventory_controller_1.issueItem);
router.patch('/return/:id', auth_1.authenticate, inventory_controller_1.returnItem);
router.delete('/:id', auth_1.authenticate, inventory_controller_1.deleteItem);
exports.default = router;
//# sourceMappingURL=inventory.routes.js.map