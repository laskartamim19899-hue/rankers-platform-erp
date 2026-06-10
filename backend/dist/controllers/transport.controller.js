"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.allocateTransport = exports.createRoute = exports.getRoutes = exports.createVehicle = exports.getVehicles = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const getVehicles = async (req, res) => {
    try {
        const vehicles = await prisma_1.default.vehicle.findMany({
            include: {
                allocations: true,
            },
        });
        res.json({ success: true, vehicles });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getVehicles = getVehicles;
const createVehicle = async (req, res) => {
    try {
        const { registrationNo, capacity, driverName, driverPhone } = req.body;
        const vehicle = await prisma_1.default.vehicle.create({
            data: {
                registrationNo,
                capacity: parseInt(capacity),
                driverName,
                driverPhone,
            },
        });
        res.status(201).json({ success: true, vehicle });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.createVehicle = createVehicle;
const getRoutes = async (req, res) => {
    try {
        const routes = await prisma_1.default.route.findMany({
            include: {
                allocations: {
                    include: {
                        student: {
                            select: { user: { select: { name: true } }, regNo: true }
                        }
                    }
                },
            },
        });
        res.json({ success: true, routes });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getRoutes = getRoutes;
const createRoute = async (req, res) => {
    try {
        const { name, stops, monthlyFee } = req.body;
        const route = await prisma_1.default.route.create({
            data: {
                name,
                stops,
                monthlyFee: parseFloat(monthlyFee),
            },
        });
        res.status(201).json({ success: true, route });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.createRoute = createRoute;
const allocateTransport = async (req, res) => {
    try {
        const { regNo, vehicleId, routeId } = req.body;
        const student = await prisma_1.default.student.findUnique({
            where: { regNo }
        });
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found with this Registration Number' });
        }
        // Check if allocation already exists
        const existing = await prisma_1.default.transportAllocation.findUnique({
            where: { studentId: student.id }
        });
        if (existing) {
            const updated = await prisma_1.default.transportAllocation.update({
                where: { studentId: student.id },
                data: { vehicleId, routeId }
            });
            return res.json({ success: true, allocation: updated });
        }
        const allocation = await prisma_1.default.transportAllocation.create({
            data: {
                studentId: student.id,
                vehicleId,
                routeId,
            },
        });
        res.status(201).json({ success: true, allocation });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.allocateTransport = allocateTransport;
//# sourceMappingURL=transport.controller.js.map