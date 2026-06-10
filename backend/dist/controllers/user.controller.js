"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeProfilePic = exports.updateProfilePic = exports.deleteStaff = exports.createStaff = exports.getStaff = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const getStaff = async (req, res) => {
    try {
        const staff = await prisma_1.default.user.findMany({
            where: {
                role: { in: ['ADMIN', 'TEACHER', 'ACCOUNTANT'] }
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true
            }
        });
        res.status(200).json(staff);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getStaff = getStaff;
const createStaff = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        // Check if user already exists
        const existing = await prisma_1.default.user.findUnique({ where: { email } });
        if (existing) {
            res.status(400).json({ message: 'User with this email already exists' });
            return;
        }
        const hashedPassword = await bcryptjs_1.default.hash(password || 'welcome123', 10);
        const newUser = await prisma_1.default.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role
            }
        });
        res.status(201).json({
            message: 'Staff account created successfully',
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role
            }
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.createStaff = createStaff;
const deleteStaff = async (req, res) => {
    try {
        const { id } = req.params;
        // Prevent self-deletion if needed (optional)
        await prisma_1.default.user.delete({ where: { id: id } });
        res.status(200).json({ message: 'Staff member removed' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.deleteStaff = deleteStaff;
const updateProfilePic = async (req, res) => {
    try {
        const { userId } = req.body;
        if (!req.file) {
            res.status(400).json({ message: 'No file uploaded' });
            return;
        }
        const photoUrl = `/uploads/${req.file.filename}`;
        await prisma_1.default.user.update({
            where: { id: userId },
            data: { photoUrl }
        });
        res.status(200).json({
            message: 'Profile picture updated',
            photoUrl
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.updateProfilePic = updateProfilePic;
const removeProfilePic = async (req, res) => {
    try {
        const { userId } = req.body;
        await prisma_1.default.user.update({
            where: { id: userId },
            data: { photoUrl: null }
        });
        res.status(200).json({ message: 'Profile picture removed' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.removeProfilePic = removeProfilePic;
//# sourceMappingURL=user.controller.js.map