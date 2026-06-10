"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const auth_1 = require("../middleware/auth");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const router = (0, express_1.Router)();
// Configure Multer
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'uploads/';
        if (!fs_1.default.existsSync(dir))
            fs_1.default.mkdirSync(dir);
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path_1.default.extname(file.originalname));
    }
});
const upload = (0, multer_1.default)({ storage });
router.get('/staff', auth_1.authenticate, (0, auth_1.authorize)(['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT']), user_controller_1.getStaff);
router.post('/staff', auth_1.authenticate, (0, auth_1.authorize)(['SUPER_ADMIN']), user_controller_1.createStaff);
router.delete('/staff/:id', auth_1.authenticate, (0, auth_1.authorize)(['SUPER_ADMIN']), user_controller_1.deleteStaff);
router.post('/profile-pic', auth_1.authenticate, upload.single('photo'), user_controller_1.updateProfilePic);
router.delete('/profile-pic', auth_1.authenticate, user_controller_1.removeProfilePic);
exports.default = router;
//# sourceMappingURL=user.routes.js.map