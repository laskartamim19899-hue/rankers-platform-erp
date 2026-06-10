"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const certificate_controller_1 = require("../controllers/certificate.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Require authentication for all certificate routes
router.use(auth_1.authenticate);
router.get('/', certificate_controller_1.getCertificates);
router.get('/:id', certificate_controller_1.getCertificateById);
router.post('/issue', certificate_controller_1.issueCertificate);
router.delete('/:id', certificate_controller_1.deleteCertificate);
exports.default = router;
//# sourceMappingURL=certificate.routes.js.map