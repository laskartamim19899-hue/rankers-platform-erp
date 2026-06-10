import { Request, Response } from 'express';
import prisma from '../prisma';

const generatePassNo = () => {
  const date = new Date();
  const datePart = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(1000 + Math.random() * 9000);
  return `LP-${datePart}-${random}`;
};

export const issueLeave = async (req: Request, res: Response): Promise<void> => {
  try {
    const { studentId, reason, destination, startDate, endDate, issuedBy, notes } = req.body;
    if (!studentId || !reason || !destination || !startDate || !endDate || !issuedBy) {
      res.status(400).json({ message: 'All fields are required' }); return;
    }
    const passNo = generatePassNo();
    const leave = await prisma.leavePass.create({
      data: { studentId, reason, destination, startDate: new Date(startDate), endDate: new Date(endDate), issuedBy, passNo, notes, status: 'APPROVED' },
      include: { student: { include: { user: true } } }
    });
    res.status(201).json(leave);
  } catch (error) { res.status(500).json({ message: 'Server error', error }); }
};

export const getAllLeaves = async (req: Request, res: Response): Promise<void> => {
  try {
    const leaves = await prisma.leavePass.findMany({
      orderBy: { issuedAt: 'desc' },
      include: { student: { include: { user: true } } }
    });
    res.status(200).json(leaves);
  } catch (error) { res.status(500).json({ message: 'Server error', error }); }
};

export const getLeaveById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const leave = await prisma.leavePass.findUnique({
      where: { id: id as string },
      include: { student: { include: { user: true, courses: { include: { course: true } }, hostelAlloc: { include: { hostel: true } } } } }
    });
    if (!leave) { res.status(404).json({ message: 'Leave pass not found' }); return; }
    res.status(200).json(leave);
  } catch (error) { res.status(500).json({ message: 'Server error', error }); }
};

export const updateLeaveStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, returnedAt } = req.body;
    const leave = await prisma.leavePass.update({
      where: { id: id as string },
      data: { status, returnedAt: returnedAt ? new Date(returnedAt) : undefined }
    });
    res.status(200).json(leave);
  } catch (error) { res.status(500).json({ message: 'Server error', error }); }
};

export const deleteLeave = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.leavePass.delete({ where: { id: id as string } });
    res.status(200).json({ message: 'Leave pass deleted' });
  } catch (error) { res.status(500).json({ message: 'Server error', error }); }
};

// ─── PUBLIC: Guardian applies for leave ──────────────────────────────────────
export const submitLeaveApplication = async (req: Request, res: Response): Promise<void> => {
  try {
    const { regNo, guardianName, guardianPhone, reason, destination, startDate, endDate } = req.body;
    if (!regNo || !guardianName || !guardianPhone || !reason || !destination || !startDate || !endDate) {
      res.status(400).json({ message: 'All fields are required' }); return;
    }
    const student = await prisma.student.findUnique({
      where: { regNo },
      include: { user: { select: { name: true } } }
    });
    if (!student) { res.status(404).json({ message: 'No student found with this Registration Number' }); return; }
    if (student.status !== 'APPROVED') { res.status(400).json({ message: 'Student is not yet enrolled' }); return; }

    const application = await prisma.leavePass.create({
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
  } catch (error) { res.status(500).json({ message: 'Server error', error }); }
};

// ─── ADMIN: Approve pending application ──────────────────────────────────────
export const approveLeaveApplication = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { issuedBy } = req.body;
    const existing = await prisma.leavePass.findUnique({ where: { id: id as string } });
    if (!existing) { res.status(404).json({ message: 'Not found' }); return; }
    if (existing.status !== 'PENDING') { res.status(400).json({ message: 'Not a pending application' }); return; }

    const passNo = generatePassNo();
    const leave = await prisma.leavePass.update({
      where: { id: id as string },
      data: { status: 'APPROVED', passNo, issuedBy: issuedBy || 'Admin' },
      include: { student: { include: { user: true } } }
    });
    res.status(200).json({ message: `Approved. Pass No: ${passNo}`, leave });
  } catch (error) { res.status(500).json({ message: 'Server error', error }); }
};

// ─── ADMIN: Reject pending application ───────────────────────────────────────
export const rejectLeaveApplication = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const leave = await prisma.leavePass.update({ where: { id: id as string }, data: { status: 'REJECTED' } });
    res.status(200).json({ message: 'Application rejected', leave });
  } catch (error) { res.status(500).json({ message: 'Server error', error }); }
};

// ─── PUBLIC: Check leave status by registration number ────────────────────────
export const getLeaveStatusByRegNo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { regNo } = req.params;
    const student = await prisma.student.findUnique({
      where: { regNo: String(regNo).toUpperCase() },
      include: { user: { select: { name: true } } }
    });
    if (!student) { res.status(404).json({ message: 'No student found with this Registration Number' }); return; }

    const leaves = await prisma.leavePass.findMany({
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
  } catch (error) { res.status(500).json({ message: 'Server error', error }); }
};
