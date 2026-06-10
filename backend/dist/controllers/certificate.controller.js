"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCertificate = exports.getCertificateById = exports.issueCertificate = exports.getCertificates = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const getCertificates = async (req, res) => {
    try {
        const certificates = await prisma_1.default.certificateRecord.findMany({
            include: {
                student: {
                    select: {
                        user: { select: { name: true } },
                        regNo: true,
                        courses: { include: { course: true } }
                    }
                }
            },
            orderBy: { issueDate: 'desc' }
        });
        res.json({ success: true, certificates });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getCertificates = getCertificates;
const issueCertificate = async (req, res) => {
    try {
        const { regNo, type, referenceNumber, remarks } = req.body;
        // Look up student by regNo
        const student = await prisma_1.default.student.findUnique({
            where: { regNo }
        });
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found with this Registration Number' });
        }
        // Auth middleware should provide req.user, but for simplicity we assume 'issuedBy' is passed or we default
        const issuedBy = req.user?.name || "Admin";
        const certificate = await prisma_1.default.certificateRecord.create({
            data: {
                studentId: student.id,
                type,
                referenceNumber,
                issuedBy,
                remarks
            },
        });
        res.status(201).json({ success: true, certificate });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.issueCertificate = issueCertificate;
const getCertificateById = async (req, res) => {
    try {
        const id = req.params.id;
        const certificate = await prisma_1.default.certificateRecord.findUnique({
            where: { id },
            include: {
                student: {
                    select: { user: { select: { name: true } }, regNo: true, courses: { include: { course: true } } }
                }
            }
        });
        if (!certificate)
            return res.status(404).json({ success: false, message: 'Not found' });
        res.json({ success: true, certificate });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getCertificateById = getCertificateById;
const deleteCertificate = async (req, res) => {
    try {
        const id = req.params.id;
        await prisma_1.default.certificateRecord.delete({
            where: { id }
        });
        res.json({ success: true, message: 'Deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.deleteCertificate = deleteCertificate;
//# sourceMappingURL=certificate.controller.js.map