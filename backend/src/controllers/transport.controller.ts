import { Request, Response } from 'express';
import prisma from '../prisma';

export const getVehicles = async (req: Request, res: Response) => {
  try {
    const vehicles = await prisma.vehicle.findMany({
      include: {
        allocations: true,
      },
    });
    res.json({ success: true, vehicles });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createVehicle = async (req: Request, res: Response) => {
  try {
    const { registrationNo, capacity, driverName, driverPhone } = req.body;
    const vehicle = await prisma.vehicle.create({
      data: {
        registrationNo,
        capacity: parseInt(capacity),
        driverName,
        driverPhone,
      },
    });
    res.status(201).json({ success: true, vehicle });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getRoutes = async (req: Request, res: Response) => {
  try {
    const routes = await prisma.route.findMany({
      include: {
        allocations: {
          include: {
            student: {
              select: { user: { select: { name: true } }, regNo: true }
            }
          }
        },
      },
    });
    res.json({ success: true, routes });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createRoute = async (req: Request, res: Response) => {
  try {
    const { name, stops, monthlyFee } = req.body;
    const route = await prisma.route.create({
      data: {
        name,
        stops,
        monthlyFee: parseFloat(monthlyFee),
      },
    });
    res.status(201).json({ success: true, route });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const allocateTransport = async (req: Request, res: Response) => {
  try {
    const { regNo, vehicleId, routeId } = req.body;

    const student = await prisma.student.findUnique({
      where: { regNo }
    });

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found with this Registration Number' });
    }

    // Check if allocation already exists
    const existing = await prisma.transportAllocation.findUnique({
      where: { studentId: student.id }
    });

    if (existing) {
      const updated = await prisma.transportAllocation.update({
        where: { studentId: student.id },
        data: { vehicleId, routeId }
      });
      return res.json({ success: true, allocation: updated });
    }

    const allocation = await prisma.transportAllocation.create({
      data: {
        studentId: student.id,
        vehicleId,
        routeId,
      },
    });
    res.status(201).json({ success: true, allocation });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
