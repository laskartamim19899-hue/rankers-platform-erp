import { Request, Response } from 'express';
import prisma from '../prisma';

export const getStudentAcademicSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const { studentId } = req.params;

    // Fetch Attendance
    const attendance = await prisma.attendance.findMany({
      where: { studentId }
    });
    const totalDays = attendance.length;
    const presentDays = attendance.filter(a => a.status === 'PRESENT').length;
    const attendancePercentage = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;

    // Fetch Test Results
    const results = await prisma.result.findMany({
      where: { studentId },
      include: { test: true },
      orderBy: { test: { date: 'desc' } }
    });

    res.status(200).json({
      attendance: {
        totalDays,
        presentDays,
        percentage: attendancePercentage.toFixed(1)
      },
      results,
      lastTest: results.length > 0 ? results[0] : null
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const markAttendance = async (req: Request, res: Response): Promise<void> => {
  try {
    const { studentId, batchId, date, status, timetableSlotId } = req.body;

    // Build start/end of day without mutating the same Date object
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const existing = await prisma.attendance.findFirst({
      where: {
        studentId,
        date: { gte: startOfDay, lte: endOfDay },
        timetableSlotId: timetableSlotId || null
      }
    });

    if (existing) {
      // UPDATE the existing record instead of rejecting
      const updated = await prisma.attendance.update({
        where: { id: existing.id },
        data: { status }
      });
      res.status(200).json(updated);
      return;
    }

    const newAttendance = await prisma.attendance.create({
      data: {
        studentId,
        batchId,
        date: new Date(date),
        status,
        timetableSlotId: timetableSlotId || null
      }
    });
    res.status(201).json(newAttendance);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const addTestResult = async (req: Request, res: Response): Promise<void> => {
  try {
    const { testId, studentId, marksObtained } = req.body;
    const result = await prisma.result.create({
      data: {
        testId,
        studentId,
        marksObtained: parseFloat(marksObtained)
      }
    });
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getCourses = async (req: Request, res: Response): Promise<void> => {
  try {
    const courses = await prisma.course.findMany();
    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getBatches = async (req: Request, res: Response): Promise<void> => {
  try {
    const batches = await prisma.batch.findMany({
      include: { course: true }
    });
    res.status(200).json(batches);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getTests = async (req: Request, res: Response): Promise<void> => {
  try {
    const tests = await prisma.test.findMany({
      orderBy: { date: 'desc' }
    });
    res.status(200).json(tests);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const createTest = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, type, date, maxMarks } = req.body;
    const test = await prisma.test.create({
      data: {
        title,
        type,
        date: new Date(date),
        maxMarks: parseFloat(maxMarks)
      }
    });
    res.status(201).json(test);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const createBatch = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, courseId, teacherId } = req.body;
    const batch = await prisma.batch.create({
      data: {
        name,
        courseId,
        teacherId: teacherId || null
      },
      include: {
        course: true,
        teacher: { select: { name: true, email: true } }
      }
    });
    res.status(201).json(batch);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const assignTeacher = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { teacherId } = req.body;
    const updated = await prisma.batch.update({
      where: { id },
      data: { teacherId },
      include: {
        teacher: { select: { name: true, email: true } }
      }
    });
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const deleteBatch = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Delete attendance records first
    await prisma.attendance.deleteMany({ where: { batchId: id } });
    
    await prisma.batch.delete({ where: { id } });
    res.status(200).json({ message: 'Batch removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getTeachers = async (req: Request, res: Response): Promise<void> => {
  try {
    const teachers = await prisma.user.findMany({
      where: { role: 'TEACHER' },
      select: { id: true, name: true, email: true }
    });
    res.status(200).json(teachers);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const createCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, duration } = req.body;
    const course = await prisma.course.create({
      data: { name, description, duration }
    });
    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const deleteCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Cleanup relations first to avoid foreign key errors
    await prisma.studentCourse.deleteMany({ where: { courseId: id } });
    await prisma.fee.deleteMany({ where: { courseId: id } });
    await prisma.batch.deleteMany({ where: { courseId: id } });
    
    await prisma.course.delete({ where: { id } });
    res.status(200).json({ message: 'Course deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// ─── ATTENDANCE REPORT ───────────────────────────────────────────────────────
export const getAttendanceReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const { batchId, from, to, slotId } = req.query;

    const where: any = {};
    if (batchId) where.batchId = batchId as string;
    if (slotId === 'GENERAL') {
      where.timetableSlotId = null;
    } else if (slotId) {
      where.timetableSlotId = slotId as string;
    }
    if (from || to) {
      where.date = {};
      if (from) where.date.gte = new Date(from as string);
      if (to) {
        const toDate = new Date(to as string);
        toDate.setHours(23, 59, 59, 999);
        where.date.lte = toDate;
      }
    }

    const records = await prisma.attendance.findMany({
      where,
      include: {
        student: {
          include: {
            user: { select: { name: true } }
          }
        },
        batch: { include: { course: true } },
        timetableSlot: true
      },
      orderBy: { date: 'desc' }
    });

    // Build per-student summary
    const studentMap: Record<string, any> = {};
    for (const r of records) {
      const sid = r.studentId;
      if (!studentMap[sid]) {
        studentMap[sid] = {
          studentId: sid,
          name: r.student.user.name,
          batch: r.batch.name,
          course: r.batch.course.name,
          total: 0,
          present: 0,
          absent: 0,
          late: 0,
          records: []
        };
      }
      studentMap[sid].total++;
      if (r.status === 'PRESENT') studentMap[sid].present++;
      else if (r.status === 'ABSENT') studentMap[sid].absent++;
      else if (r.status === 'LATE') studentMap[sid].late++;

      studentMap[sid].records.push({
        id: r.id,
        date: r.date,
        status: r.status,
        slot: r.timetableSlot ? `${r.timetableSlot.subject} (${r.timetableSlot.startTime}-${r.timetableSlot.endTime})` : 'General',
        day: r.timetableSlot?.day || null
      });
    }

    const summary = Object.values(studentMap).map((s: any) => ({
      ...s,
      percentage: s.total > 0 ? ((s.present / s.total) * 100).toFixed(1) : '0'
    }));

    res.status(200).json({ summary, totalRecords: records.length });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// ─── PUBLIC: Get student results by Registration Number ───────────────────────
export const getResultsByRegNo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { regNo } = req.params;

    const student = await prisma.student.findUnique({
      where: { regNo: regNo.toUpperCase() },
      include: {
        user: { select: { name: true } },
        courses: { include: { course: true, batch: true } }
      }
    });

    if (!student) {
      res.status(404).json({ message: 'No student found with this Registration Number' });
      return;
    }
    if (student.status !== 'APPROVED') {
      res.status(400).json({ message: 'Student record not active' });
      return;
    }

    const results = await prisma.result.findMany({
      where: { studentId: student.id },
      include: { test: true },
      orderBy: { test: { date: 'desc' } }
    });

    const attendance = await prisma.attendance.findMany({ where: { studentId: student.id } });
    const presentDays = attendance.filter(a => a.status === 'PRESENT').length;
    const attendancePct = attendance.length > 0 ? ((presentDays / attendance.length) * 100).toFixed(1) : '0';

    res.status(200).json({
      studentName: student.user.name,
      regNo: student.regNo,
      course: student.courses[0]?.course?.name,
      batch: student.courses[0]?.batch?.name,
      attendance: {
        total: attendance.length,
        present: presentDays,
        percentage: attendancePct
      },
      results: results.map(r => ({
        id: r.id,
        testName: (r.test as any).name || (r.test as any).title || 'Test',
        testDate: r.test.date,
        testType: r.test.type,
        marksObtained: r.marksObtained,
        totalMarks: (r.test as any).totalMarks || (r.test as any).maxMarks,
        percentage: (r.test as any).totalMarks || (r.test as any).maxMarks
          ? ((r.marksObtained / ((r.test as any).totalMarks || (r.test as any).maxMarks)) * 100).toFixed(1)
          : null
      }))
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

