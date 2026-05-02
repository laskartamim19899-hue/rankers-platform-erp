import { Request, Response } from 'express';
import prisma from '../prisma';

export const getAnnouncements = async (req: Request, res: Response): Promise<void> => {
  try {
    const { audience } = req.query;
    const where: any = {};
    if (audience) {
      where.targetAudience = { in: ['ALL', audience] };
    }

    const announcements = await prisma.announcement.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json(announcements);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const createAnnouncement = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, content, type, targetAudience } = req.body;
    const announcement = await prisma.announcement.create({
      data: {
        title,
        content,
        type,
        targetAudience
      }
    });
    res.status(201).json(announcement);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const deleteAnnouncement = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.announcement.delete({ where: { id: id as string } });
    res.status(200).json({ message: 'Announcement deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
