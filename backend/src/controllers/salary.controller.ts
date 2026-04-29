import { Request, Response } from 'express';
import prisma from '../prisma';

// GET all staff with their salary profiles
export const getAllStaffSalaries = async (req: Request, res: Response): Promise<void> => {
  try {
    const staff = await prisma.user.findMany({
      where: { role: { in: ['TEACHER', 'ADMIN', 'ACCOUNTANT'] } },
      include: {
        staffProfile: {
          include: {
            salaryRecords: { orderBy: { paidAt: 'desc' }, take: 5 }
          }
        }
      }
    });
    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// CREATE or UPDATE staff salary profile
export const upsertStaffProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, designation, department, baseSalary, bankAccount, ifscCode } = req.body;
    const profile = await prisma.staffProfile.upsert({
      where: { userId },
      update: { designation, department, baseSalary: parseFloat(baseSalary), bankAccount, ifscCode },
      create: { userId, designation, department, baseSalary: parseFloat(baseSalary), bankAccount, ifscCode }
    });
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// DISBURSE salary (create salary record)
export const disburseSalary = async (req: Request, res: Response): Promise<void> => {
  try {
    const { staffProfileId, month, basicSalary, allowances, deductions, paymentMode, transactionId, remarks } = req.body;
    const basic = parseFloat(basicSalary);
    const allow = parseFloat(allowances || '0');
    const deduct = parseFloat(deductions || '0');
    const net = basic + allow - deduct;

    // 1. Get staff profile to know the name
    const profile = await prisma.staffProfile.findUnique({
      where: { id: staffProfileId },
      include: { user: true }
    });

    if (!profile) {
      res.status(404).json({ message: 'Staff profile not found' });
      return;
    }

    // 2. Create the salary record and the expense record in a transaction
    const [record] = await prisma.$transaction([
      prisma.salaryRecord.create({
        data: {
          staffProfileId,
          month,
          basicSalary: basic,
          allowances: allow,
          deductions: deduct,
          netSalary: net,
          paymentMode,
          transactionId,
          remarks,
          status: 'PAID'
        },
        include: { staffProfile: { include: { user: true } } }
      }),
      prisma.expense.create({
        data: {
          title: `Salary - ${profile.user.name} - ${month}`,
          category: 'SALARY',
          amount: net,
          date: new Date(),
          description: `Base: ₹${basic}, Allowances: ₹${allow}, Deductions: ₹${deduct}`,
          payeeName: profile.user.name,
          purpose: 'STAFF_PAYROLL'
        }
      })
    ]);

    res.json(record);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// GET salary record by ID (for slip)
export const getSalaryRecord = async (req: Request, res: Response): Promise<void> => {
  try {
    const record = await prisma.salaryRecord.findUnique({
      where: { id: req.params.id },
      include: { staffProfile: { include: { user: true } } }
    });
    if (!record) { res.status(404).json({ message: 'Record not found' }); return; }
    res.json(record);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// GET all salary records for a staff
export const getStaffSalaryHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { profileId } = req.params;
    const records = await prisma.salaryRecord.findMany({
      where: { staffProfileId: profileId },
      orderBy: { paidAt: 'desc' },
      include: { staffProfile: { include: { user: true } } }
    });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// DELETE salary record
export const deleteSalaryRecord = async (req: Request, res: Response): Promise<void> => {
  try {
    await prisma.salaryRecord.delete({ where: { id: req.params.id } });
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
