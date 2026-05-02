import { Request, Response } from 'express';
import prisma from '../prisma';

export const createInquiry = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, guardianName, dob, gender, phone, email, address, schoolName, courseInterest } = req.body;
    
    const newInquiry = await prisma.admissionInquiry.create({
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
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getInquiries = async (req: Request, res: Response): Promise<void> => {
  try {
    const inquiries = await prisma.admissionInquiry.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json(inquiries);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const updateInquiryStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updated = await prisma.admissionInquiry.update({
      where: { id: id as string },
      data: { status }
    });
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const deleteInquiry = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.admissionInquiry.delete({ where: { id: id as string } });
    res.status(200).json({ message: 'Inquiry deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
