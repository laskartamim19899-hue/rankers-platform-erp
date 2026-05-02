import { Request, Response } from 'express';
import prisma from '../prisma';

export const getAllHostels = async (req: Request, res: Response): Promise<void> => {
  try {
    const hostels = await prisma.hostel.findMany({
      include: { allocations: { include: { student: { include: { user: { select: { name: true } } } } } } }
    });
    res.status(200).json(hostels);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const allocateRoom = async (req: Request, res: Response): Promise<void> => {
  try {
    const { studentId, hostelId, joinDate } = req.body;

    const hostel = await prisma.hostel.findUnique({ where: { id: hostelId } });
    if (!hostel || hostel.occupancy >= hostel.capacity) {
      res.status(400).json({ message: 'Hostel is full or not found' });
      return;
    }

    const allocation = await prisma.$transaction([
      prisma.hostelAllocation.create({
        data: {
          studentId,
          hostelId,
          joinDate: new Date(joinDate)
        }
      }),
      prisma.hostel.update({
        where: { id: hostelId },
        data: { occupancy: { increment: 1 } }
      })
    ]);

    res.status(201).json(allocation[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const deallocateRoom = async (req: Request, res: Response): Promise<void> => {
  try {
    const { studentId } = req.params;

    const allocation = await prisma.hostelAllocation.findUnique({ where: { studentId: studentId as string } });
    if (!allocation) {
      res.status(404).json({ message: 'Allocation not found' });
      return;
    }

    await prisma.$transaction([
      prisma.hostelAllocation.delete({ where: { studentId: studentId as string } }),
      prisma.hostel.update({
        where: { id: allocation.hostelId },
        data: { occupancy: { decrement: 1 } }
      })
    ]);

    res.status(200).json({ message: 'Room deallocated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const createHostel = async (req: Request, res: Response): Promise<void> => {
  try {
    const { roomNumber, capacity } = req.body;
    
    const existing = await prisma.hostel.findUnique({ where: { roomNumber } });
    if (existing) {
      res.status(400).json({ message: 'Room number already exists' });
      return;
    }

    const hostel = await prisma.hostel.create({
      data: {
        roomNumber,
        capacity: parseInt(capacity),
        occupancy: 0
      }
    });
    res.status(201).json(hostel);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const deleteHostel = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Check if occupied
    const hostel = await prisma.hostel.findUnique({ 
      where: { id: id as string },
      include: { _count: { select: { allocations: true } } }
    });
    
    if (hostel && (hostel as any)._count.allocations > 0) {
      res.status(400).json({ message: 'Cannot delete occupied room' });
      return;
    }

    await prisma.hostel.delete({ where: { id: id as string } });
    res.status(200).json({ message: 'Room removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
