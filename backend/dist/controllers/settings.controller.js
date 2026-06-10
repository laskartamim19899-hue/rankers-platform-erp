"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.waiveLateFee = exports.updateSettings = exports.getSettings = void 0;
const prisma_1 = __importDefault(require("../prisma"));
// Upsert singleton settings record
const getOrCreateSettings = async () => {
    return prisma_1.default.institutionSettings.upsert({
        where: { id: 'singleton' },
        update: {},
        create: { id: 'singleton' }
    });
};
const getSettings = async (req, res) => {
    try {
        const settings = await getOrCreateSettings();
        res.status(200).json(settings);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getSettings = getSettings;
const updateSettings = async (req, res) => {
    try {
        const { lateFeePerDay, gracePeriodDays, lateFeeEnabled, institutionName, phone, email, website, address, gstNumber, tagline, principalName, reserveFundPercentage } = req.body;
        const settings = await prisma_1.default.institutionSettings.upsert({
            where: { id: 'singleton' },
            update: {
                ...(lateFeePerDay !== undefined && { lateFeePerDay: parseFloat(lateFeePerDay) }),
                ...(gracePeriodDays !== undefined && { gracePeriodDays: parseInt(gracePeriodDays) }),
                ...(lateFeeEnabled !== undefined && { lateFeeEnabled }),
                ...(institutionName !== undefined && { institutionName }),
                ...(phone !== undefined && { phone }),
                ...(email !== undefined && { email }),
                ...(website !== undefined && { website }),
                ...(address !== undefined && { address }),
                ...(gstNumber !== undefined && { gstNumber }),
                ...(tagline !== undefined && { tagline }),
                ...(principalName !== undefined && { principalName }),
                ...(reserveFundPercentage !== undefined && { reserveFundPercentage: parseFloat(reserveFundPercentage) }),
            },
            create: { id: 'singleton' }
        });
        res.status(200).json({ message: 'Settings updated', settings });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.updateSettings = updateSettings;
const waiveLateFee = async (req, res) => {
    try {
        const { feeId } = req.params;
        const fee = await prisma_1.default.fee.findUnique({ where: { id: feeId } });
        if (!fee) {
            res.status(404).json({ message: 'Fee not found' });
            return;
        }
        const updated = await prisma_1.default.fee.update({
            where: { id: feeId },
            data: { lateFee: 0 }
        });
        res.status(200).json({ message: 'Late fee waived successfully', fee: updated });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.waiveLateFee = waiveLateFee;
//# sourceMappingURL=settings.controller.js.map