"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.autoAssignTiers = exports.updateScholarshipTier = exports.getMeritBoard = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const getMeritBoard = async (req, res) => {
    try {
        // Get all students with their test results
        const students = await prisma_1.default.student.findMany({
            where: { status: 'APPROVED' },
            include: {
                user: true,
                results: { include: { test: true } },
                courses: { include: { course: true } },
            }
        });
        const ranked = students.map(s => {
            const totalMarks = s.results.reduce((sum, r) => sum + r.marksObtained, 0);
            const maxPossible = s.results.reduce((sum, r) => sum + r.test.maxMarks, 0);
            const percentage = maxPossible > 0 ? (totalMarks / maxPossible) * 100 : 0;
            return { ...s, totalMarks, maxPossible, percentage: parseFloat(percentage.toFixed(2)) };
        }).sort((a, b) => b.percentage - a.percentage);
        // Assign ranks
        const withRanks = ranked.map((s, i) => ({ ...s, rank: i + 1 }));
        res.status(200).json(withRanks);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getMeritBoard = getMeritBoard;
const updateScholarshipTier = async (req, res) => {
    try {
        const { id } = req.params;
        const { scholarshipTier } = req.body;
        const student = await prisma_1.default.student.update({
            where: { id: id },
            data: { scholarshipTier }
        });
        res.status(200).json(student);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.updateScholarshipTier = updateScholarshipTier;
const autoAssignTiers = async (req, res) => {
    try {
        const students = await prisma_1.default.student.findMany({
            where: { status: 'APPROVED' },
            include: { results: { include: { test: true } } }
        });
        const ranked = students.map(s => {
            const totalMarks = s.results.reduce((sum, r) => sum + r.marksObtained, 0);
            const maxPossible = s.results.reduce((sum, r) => sum + r.test.maxMarks, 0);
            const percentage = maxPossible > 0 ? (totalMarks / maxPossible) * 100 : 0;
            return { id: s.id, percentage };
        }).sort((a, b) => b.percentage - a.percentage);
        // Top 10% = MERIT_A, 10-25% = MERIT_B, 25-50% = MERIT_C, rest = NONE
        const total = ranked.length;
        const updates = ranked.map((s, i) => {
            const pos = (i / total) * 100;
            let tier = 'NONE';
            if (pos < 10)
                tier = 'MERIT_A';
            else if (pos < 25)
                tier = 'MERIT_B';
            else if (pos < 50)
                tier = 'MERIT_C';
            return prisma_1.default.student.update({ where: { id: s.id }, data: { scholarshipTier: tier } });
        });
        await prisma_1.default.$transaction(updates);
        res.status(200).json({ message: 'Scholarship tiers auto-assigned successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.autoAssignTiers = autoAssignTiers;
//# sourceMappingURL=merit.controller.js.map