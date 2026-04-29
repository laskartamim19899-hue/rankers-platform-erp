import { Request, Response } from 'express';
import prisma from '../prisma';

// Upsert singleton settings record
const getOrCreateSettings = async () => {
  return prisma.institutionSettings.upsert({
    where: { id: 'singleton' },
    update: {},
    create: { id: 'singleton' }
  });
};

export const getSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const settings = await getOrCreateSettings();
    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const updateSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const { lateFeePerDay, gracePeriodDays, lateFeeEnabled, institutionName, phone, email, website, address, gstNumber, tagline, principalName } = req.body;
    const settings = await prisma.institutionSettings.upsert({
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
      },
      create: { id: 'singleton' }
    });
    res.status(200).json({ message: 'Settings updated', settings });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const waiveLateFee = async (req: Request, res: Response): Promise<void> => {
  try {
    const { feeId } = req.params;
    const fee = await prisma.fee.findUnique({ where: { id: feeId } });
    if (!fee) {
      res.status(404).json({ message: 'Fee not found' });
      return;
    }
    const updated = await prisma.fee.update({
      where: { id: feeId },
      data: { lateFee: 0 }
    });
    res.status(200).json({ message: 'Late fee waived successfully', fee: updated });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
