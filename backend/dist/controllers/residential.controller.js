"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteHostel = exports.createHostel = exports.deallocateRoom = exports.allocateRoom = exports.getAllHostels = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const getAllHostels = async (req, res) => {
    try {
        const hostels = await prisma_1.default.hostel.findMany({
            include: { allocations: { include: { student: { include: { user: { select: { name: true } } } } } } }
        });
        res.status(200).json(hostels);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getAllHostels = getAllHostels;
const allocateRoom = async (req, res) => {
    try {
        const { studentId, hostelId, joinDate } = req.body;
        const hostel = await prisma_1.default.hostel.findUnique({ where: { id: hostelId } });
        if (!hostel || hostel.occupancy >= hostel.capacity) {
            res.status(400).json({ message: 'Hostel is full or not found' });
            return;
        }
        const allocation = await prisma_1.default.$transaction([
            prisma_1.default.hostelAllocation.create({
                data: {
                    studentId,
                    hostelId,
                    joinDate: new Date(joinDate)
                }
            }),
            prisma_1.default.hostel.update({
                where: { id: hostelId },
                data: { occupancy: { increment: 1 } }
            })
        ]);
        res.status(201).json(allocation[0]);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.allocateRoom = allocateRoom;
const deallocateRoom = async (req, res) => {
    try {
        const { studentId } = req.params;
        const allocation = await prisma_1.default.hostelAllocation.findUnique({ where: { studentId: studentId } });
        if (!allocation) {
            res.status(404).json({ message: 'Allocation not found' });
            return;
        }
        await prisma_1.default.$transaction([
            prisma_1.default.hostelAllocation.delete({ where: { studentId: studentId } }),
            prisma_1.default.hostel.update({
                where: { id: allocation.hostelId },
                data: { occupancy: { decrement: 1 } }
            })
        ]);
        res.status(200).json({ message: 'Room deallocated successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.deallocateRoom = deallocateRoom;
const createHostel = async (req, res) => {
    try {
        const { roomNumber, capacity } = req.body;
        const existing = await prisma_1.default.hostel.findUnique({ where: { roomNumber } });
        if (existing) {
            res.status(400).json({ message: 'Room number already exists' });
            return;
        }
        const hostel = await prisma_1.default.hostel.create({
            data: {
                roomNumber,
                capacity: parseInt(capacity),
                occupancy: 0
            }
        });
        res.status(201).json(hostel);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.createHostel = createHostel;
const deleteHostel = async (req, res) => {
    try {
        const { id } = req.params;
        // Check if occupied
        const hostel = await prisma_1.default.hostel.findUnique({
            where: { id: id },
            include: { _count: { select: { allocations: true } } }
        });
        if (hostel && hostel._count.allocations > 0) {
            res.status(400).json({ message: 'Cannot delete occupied room' });
            return;
        }
        await prisma_1.default.hostel.delete({ where: { id: id } });
        res.status(200).json({ message: 'Room removed successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.deleteHostel = deleteHostel;
//# sourceMappingURL=residential.controller.js.map