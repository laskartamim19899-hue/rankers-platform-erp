"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLeaveStatusByRegNo = exports.rejectLeaveApplication = exports.approveLeaveApplication = exports.submitLeaveApplication = exports.deleteLeave = exports.updateLeaveStatus = exports.getLeaveById = exports.getAllLeaves = exports.issueLeave = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const generatePassNo = () => {
    const date = new Date();
    const datePart = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(1000 + Math.random() * 9000);
    return `LP-${datePart}-${random}`;
};
const issueLeave = async (req, res) => {
    try {
        const { studentId, reason, destination, startDate, endDate, issuedBy, notes } = req.body;
        if (!studentId || !reason || !destination || !startDate || !endDate || !issuedBy) {
            res.status(400).json({ message: 'All fields are required' });
            return;
        }
        const passNo = generatePassNo();
        const leave = await prisma_1.default.leavePass.create({
            data: { studentId, reason, destination, startDate: new Date(startDate), endDate: new Date(endDate), issuedBy, passNo, notes, status: 'APPROVED' },
            include: { student: { include: { user: true } } }
        });
        res.status(201).json(leave);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.issueLeave = issueLeave;
const getAllLeaves = async (req, res) => {
    try {
        const leaves = await prisma_1.default.leavePass.findMany({
            orderBy: { issuedAt: 'desc' },
            include: { student: { include: { user: true } } }
        });
        res.status(200).json(leaves);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getAllLeaves = getAllLeaves;
const getLeaveById = async (req, res) => {
    try {
        const { id } = req.params;
        const leave = await prisma_1.default.leavePass.findUnique({
            where: { id: id },
            include: { student: { include: { user: true, courses: { include: { course: true } }, hostelAlloc: { include: { hostel: true } } } } }
        });
        if (!leave) {
            res.status(404).json({ message: 'Leave pass not found' });
            return;
        }
        res.status(200).json(leave);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getLeaveById = getLeaveById;
const updateLeaveStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, returnedAt } = req.body;
        const leave = await prisma_1.default.leavePass.update({
            where: { id: id },
            data: { status, returnedAt: returnedAt ? new Date(returnedAt) : undefined }
        });
        res.status(200).json(leave);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.updateLeaveStatus = updateLeaveStatus;
const deleteLeave = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma_1.default.leavePass.delete({ where: { id: id } });
        res.status(200).json({ message: 'Leave pass deleted' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.deleteLeave = deleteLeave;
// ─── PUBLIC: Guardian applies for leave ──────────────────────────────────────
const submitLeaveApplication = async (req, res) => {
    try {
        const { regNo, guardianName, guardianPhone, reason, destination, startDate, endDate } = req.body;
        if (!regNo || !guardianName || !guardianPhone || !reason || !destination || !startDate || !endDate) {
            res.status(400).json({ message: 'All fields are required' });
            return;
        }
        const student = await prisma_1.default.student.findUnique({
            where: { regNo },
            include: { user: { select: { name: true } } }
        });
        if (!student) {
            res.status(404).json({ message: 'No student found with this Registration Number' });
            return;
        }
        if (student.status !== 'APPROVED') {
            res.status(400).json({ message: 'Student is not yet enrolled' });
            return;
        }
        const application = await prisma_1.default.leavePass.create({
            data: {
                studentId: student.id,
                reason,
                destination,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                issuedBy: `Guardian: ${guardianName} (${guardianPhone})`,
                passNo: `REQ-${Date.now()}`,
                notes: `Guardian application. Contact: ${guardianPhone}`,
                status: 'PENDING'
            }
        });
        res.status(201).json({
            message: 'Application submitted! Admin will review and issue the leave pass shortly.',
            studentName: student.user.name,
            applicationId: application.id
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.submitLeaveApplication = submitLeaveApplication;
// ─── ADMIN: Approve pending application ──────────────────────────────────────
const approveLeaveApplication = async (req, res) => {
    try {
        const { id } = req.params;
        const { issuedBy } = req.body;
        const existing = await prisma_1.default.leavePass.findUnique({ where: { id: id } });
        if (!existing) {
            res.status(404).json({ message: 'Not found' });
            return;
        }
        if (existing.status !== 'PENDING') {
            res.status(400).json({ message: 'Not a pending application' });
            return;
        }
        const passNo = generatePassNo();
        const leave = await prisma_1.default.leavePass.update({
            where: { id: id },
            data: { status: 'APPROVED', passNo, issuedBy: issuedBy || 'Admin' },
            include: { student: { include: { user: true } } }
        });
        res.status(200).json({ message: `Approved. Pass No: ${passNo}`, leave });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.approveLeaveApplication = approveLeaveApplication;
// ─── ADMIN: Reject pending application ───────────────────────────────────────
const rejectLeaveApplication = async (req, res) => {
    try {
        const { id } = req.params;
        const leave = await prisma_1.default.leavePass.update({ where: { id: id }, data: { status: 'REJECTED' } });
        res.status(200).json({ message: 'Application rejected', leave });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.rejectLeaveApplication = rejectLeaveApplication;
// ─── PUBLIC: Check leave status by registration number ────────────────────────
const getLeaveStatusByRegNo = async (req, res) => {
    try {
        const { regNo } = req.params;
        const student = await prisma_1.default.student.findUnique({
            where: { regNo: String(regNo).toUpperCase() },
            include: { user: { select: { name: true } } }
        });
        if (!student) {
            res.status(404).json({ message: 'No student found with this Registration Number' });
            return;
        }
        const leaves = await prisma_1.default.leavePass.findMany({
            where: { studentId: student.id },
            orderBy: { issuedAt: 'desc' },
            select: {
                id: true, passNo: true, status: true,
                reason: true, destination: true,
                startDate: true, endDate: true,
                issuedAt: true, returnedAt: true
            }
        });
        res.status(200).json({
            studentName: student.user.name,
            regNo: student.regNo,
            applications: leaves
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getLeaveStatusByRegNo = getLeaveStatusByRegNo;
//# sourceMappingURL=leave.controller.js.map