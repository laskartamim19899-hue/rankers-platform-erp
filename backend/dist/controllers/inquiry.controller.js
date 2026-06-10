"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteInquiry = exports.updateInquiryStatus = exports.getInquiries = exports.createInquiry = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const createInquiry = async (req, res) => {
    try {
        const { name, guardianName, dob, gender, phone, email, address, schoolName, courseInterest } = req.body;
        const newInquiry = await prisma_1.default.admissionInquiry.create({
            data: {
                name,
                guardianName,
                dob: new Date(dob),
                gender,
                phone,
                email,
                address,
                schoolName,
                courseInterest,
                status: 'NEW'
            }
        });
        res.status(201).json({ message: 'Inquiry submitted successfully!', inquiry: newInquiry });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.createInquiry = createInquiry;
const getInquiries = async (req, res) => {
    try {
        const inquiries = await prisma_1.default.admissionInquiry.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json(inquiries);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getInquiries = getInquiries;
const updateInquiryStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const updated = await prisma_1.default.admissionInquiry.update({
            where: { id: id },
            data: { status }
        });
        res.status(200).json(updated);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.updateInquiryStatus = updateInquiryStatus;
const deleteInquiry = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma_1.default.admissionInquiry.delete({ where: { id: id } });
        res.status(200).json({ message: 'Inquiry deleted' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.deleteInquiry = deleteInquiry;
//# sourceMappingURL=inquiry.controller.js.map