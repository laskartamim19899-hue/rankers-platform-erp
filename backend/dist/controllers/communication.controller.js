"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAnnouncement = exports.createAnnouncement = exports.getAnnouncements = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const getAnnouncements = async (req, res) => {
    try {
        const { audience } = req.query;
        const where = {};
        if (audience) {
            where.targetAudience = { in: ['ALL', audience] };
        }
        const announcements = await prisma_1.default.announcement.findMany({
            where,
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json(announcements);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getAnnouncements = getAnnouncements;
const createAnnouncement = async (req, res) => {
    try {
        const { title, content, type, targetAudience } = req.body;
        const announcement = await prisma_1.default.announcement.create({
            data: {
                title,
                content,
                type,
                targetAudience
            }
        });
        res.status(201).json(announcement);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.createAnnouncement = createAnnouncement;
const deleteAnnouncement = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma_1.default.announcement.delete({ where: { id: id } });
        res.status(200).json({ message: 'Announcement deleted' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.deleteAnnouncement = deleteAnnouncement;
//# sourceMappingURL=communication.controller.js.map