import { Request, Response } from 'express';
import prisma from '../prisma';
import bcrypt from 'bcryptjs';

export const getStaff = async (req: Request, res: Response): Promise<void> => {
  try {
    const staff = await prisma.user.findMany({
      where: {
        role: { in: ['ADMIN', 'TEACHER', 'ACCOUNTANT'] }
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });
    res.status(200).json(staff);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const createStaff = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(400).json({ message: 'User with this email already exists' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password || 'welcome123', 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role
      }
    });

    res.status(201).json({
      message: 'Staff account created successfully',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const deleteStaff = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Prevent self-deletion if needed (optional)
    
    await prisma.user.delete({ where: { id: id as string } });
    res.status(200).json({ message: 'Staff member removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
export const updateProfilePic = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.body;
    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }

    const photoUrl = `/uploads/${req.file.filename}`;

    await prisma.user.update({
      where: { id: userId },
      data: { photoUrl }
    });

    res.status(200).json({ 
      message: 'Profile picture updated',
      photoUrl 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const removeProfilePic = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.body;
    await prisma.user.update({
      where: { id: userId },
      data: { photoUrl: null }
    });
    res.status(200).json({ message: 'Profile picture removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
