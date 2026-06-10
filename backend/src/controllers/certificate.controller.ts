import { Request, Response } from 'express';
import prisma from '../prisma';

export const getCertificates = async (req: Request, res: Response) => {
  try {
    const certificates = await prisma.certificateRecord.findMany({
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
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const issueCertificate = async (req: Request, res: Response) => {
  try {
    const { regNo, type, referenceNumber, remarks } = req.body;
    
    // Look up student by regNo
    const student = await prisma.student.findUnique({
      where: { regNo }
    });

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found with this Registration Number' });
    }

    // Auth middleware should provide req.user, but for simplicity we assume 'issuedBy' is passed or we default
    const issuedBy = (req as any).user?.name || "Admin";

    const certificate = await prisma.certificateRecord.create({
      data: {
        studentId: student.id,
        type,
        referenceNumber,
        issuedBy,
        remarks
      },
    });
    res.status(201).json({ success: true, certificate });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCertificateById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const certificate = await prisma.certificateRecord.findUnique({
      where: { id },
      include: {
        student: {
          select: { user: { select: { name: true } }, regNo: true, courses: { include: { course: true } } }
        }
      }
    });
    if (!certificate) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, certificate });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteCertificate = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.certificateRecord.delete({
      where: { id }
    });
    res.json({ success: true, message: 'Deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
