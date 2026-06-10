"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSlot = exports.upsertTimetable = exports.getAllTimetables = exports.getTimetable = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const getTimetable = async (req, res) => {
    try {
        const { batchId } = req.params;
        const timetable = await prisma_1.default.timetable.findUnique({
            where: { batchId: batchId },
            include: { slots: { orderBy: [{ day: 'asc' }, { startTime: 'asc' }] }, batch: true }
        });
        res.status(200).json(timetable);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getTimetable = getTimetable;
const getAllTimetables = async (req, res) => {
    try {
        const timetables = await prisma_1.default.timetable.findMany({
            include: { batch: true, slots: { orderBy: [{ day: 'asc' }, { startTime: 'asc' }] } }
        });
        res.status(200).json(timetables);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getAllTimetables = getAllTimetables;
const upsertTimetable = async (req, res) => {
    try {
        const { batchId, slots } = req.body;
        // Ensure timetable exists
        const timetable = await prisma_1.default.timetable.upsert({
            where: { batchId },
            create: { batchId },
            update: {},
        });
        // Delete existing slots and recreate
        await prisma_1.default.timetableSlot.deleteMany({ where: { timetableId: timetable.id } });
        if (slots && slots.length > 0) {
            await prisma_1.default.timetableSlot.createMany({
                data: slots.map((s) => ({ ...s, timetableId: timetable.id }))
            });
        }
        const updated = await prisma_1.default.timetable.findUnique({
            where: { batchId },
            include: { slots: { orderBy: [{ day: 'asc' }, { startTime: 'asc' }] }, batch: true }
        });
        res.status(200).json(updated);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.upsertTimetable = upsertTimetable;
const deleteSlot = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma_1.default.timetableSlot.delete({ where: { id: id } });
        res.status(200).json({ message: 'Slot deleted' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.deleteSlot = deleteSlot;
//# sourceMappingURL=timetable.controller.js.map