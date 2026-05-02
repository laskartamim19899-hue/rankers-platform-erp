import { Request, Response } from 'express';
import prisma from '../prisma';
import bcrypt from 'bcryptjs';

// Auto-generate Registration Number
const generateRegNo = async () => {
  const students = await prisma.student.findMany({
    where: { 
      regNo: { not: null },
      status: 'APPROVED'
    },
    select: { regNo: true }
  });
  
  const maxRegNo = students.reduce((max, s) => {
    const num = parseInt(s.regNo || '0');
    return isNaN(num) ? max : (num > max ? num : max);
  }, 0);
  
  return (maxRegNo + 1).toString();
};



export const createStudent = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      email, password, name, guardianName, dob, gender, phone, address,
      schoolName, madhyamikMarks, hsMarksPhysics, hsMarksChemistry,
      hsMarksBiology, prevNeetMarks, isResidential, batchId
    } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ message: 'User with this email already exists' });
      return;
    }

    let courseIdToConnect = null;
    if (batchId) {
      const batch = await prisma.batch.findUnique({ where: { id: batchId } });
      if (batch) courseIdToConnect = batch.courseId;
    }

    const hashedPassword = await bcrypt.hash(password || 'password123', 10);
    // Registration number will be generated only upon approval by Admin
    const regNo = null;

    const newStudent = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'STUDENT',
        studentProfile: {
          create: {
            regNo,
            guardianName,
            dob: new Date(dob),
            gender,
            phone,
            address,
            schoolName,
            madhyamikMarks: madhyamikMarks ? parseFloat(madhyamikMarks) : null,
            hsMarksPhysics: hsMarksPhysics ? parseFloat(hsMarksPhysics) : null,
            hsMarksChemistry: hsMarksChemistry ? parseFloat(hsMarksChemistry) : null,
            hsMarksBiology: hsMarksBiology ? parseFloat(hsMarksBiology) : null,
            prevNeetMarks: prevNeetMarks ? parseFloat(prevNeetMarks) : null,
            isResidential: isResidential === true || isResidential === 'true',
            courses: courseIdToConnect ? {
              create: [{
                course: { connect: { id: courseIdToConnect } },
                batch: { connect: { id: batchId } }
              }]
            } : undefined
          }
        }
      },
      include: {
        studentProfile: true
      }
    });

    const studentId = newStudent.studentProfile?.id;
    if (studentId && courseIdToConnect) {
      const primaryCourseId = courseIdToConnect;
      const { academicFee, monthlyHostelFee } = req.body;

      // 1. Allocate Yearly Academic Fee
      if (academicFee) {
        await prisma.fee.create({
          data: {
            studentId,
            courseId: primaryCourseId,
            amount: parseFloat(academicFee),
            type: 'ACADEMIC',
            dueDate: new Date(), // Due immediately at time of admission
            status: 'PENDING'
          }
        });
      }

      // 2. Allocate 12 Monthly Hostel Fees if Residential (Starting from Admission Month)
      const isRes = isResidential === true || isResidential === 'true';
      if (isRes && monthlyHostelFee) {
        const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
        const admissionDate = new Date();
        const startMonth = admissionDate.getMonth();
        const startYear = admissionDate.getFullYear();
        
        for (let i = 0; i < 12; i++) {
          const targetMonth = (startMonth + i) % 12;
          const yearOffset = Math.floor((startMonth + i) / 12);
          const dueDate = new Date(startYear + yearOffset, targetMonth, 10); // Due on 10th of every month
          
          await prisma.fee.create({
            data: {
              studentId,
              courseId: primaryCourseId,
              amount: parseFloat(monthlyHostelFee),
              type: 'HOSTEL',
              month: months[targetMonth],
              dueDate,
              status: 'PENDING'
            }
          });
        }
      }
    }

    res.status(201).json({ message: 'Student registered successfully and is pending approval.', student: newStudent });
  } catch (error) {
    console.error('Error registering student:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getPendingStudents = async (req: Request, res: Response): Promise<void> => {
  try {
    const students = await prisma.student.findMany({
      where: { status: 'PENDING' },
      include: {
        user: { select: { name: true, email: true } },
        courses: { include: { course: true, batch: true } }
      }
    });
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const approveStudent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Check if already approved
    const student = await prisma.student.findUnique({ where: { id: id as string } });
    if (!student) {
      res.status(404).json({ message: 'Student not found' });
      return;
    }
    if (student.status === 'APPROVED') {
      res.status(400).json({ message: 'Student is already approved' });
      return;
    }

    const regNo = await generateRegNo();

    const updated = await prisma.student.update({
      where: { id: id as string },
      data: {
        status: 'APPROVED',
        regNo
      },
      include: {
        user: { select: { name: true, email: true } }
      }
    });

    res.status(200).json({ message: 'Student approved successfully', student: updated });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getAllStudents = async (req: Request, res: Response): Promise<void> => {
  try {
    const students = await prisma.student.findMany({
      include: {
        user: { select: { name: true, email: true } },
        courses: { include: { course: true, batch: true } }
      }
    });
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getStudentById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const student = await prisma.student.findUnique({
      where: { id: id as string },
      include: {
        user: { select: { name: true, email: true } },
        courses: { include: { course: true, batch: true } },
        fees: true,
        attendances: true,
        results: { include: { test: true } }
      }
    });

    if (!student) {
      res.status(404).json({ message: 'Student not found' });
      return;
    }

    res.status(200).json(student);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
export const updateStudent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { phone, address, photoUrl, guardianName, schoolName } = req.body;

    const updated = await prisma.student.update({
      where: { id: id as string },
      data: {
        ...(phone !== undefined && { phone }),
        ...(address !== undefined && { address }),
        ...(photoUrl !== undefined && { photoUrl }),
        ...(guardianName !== undefined && { guardianName }),
        ...(schoolName !== undefined && { schoolName }),
      }
    });

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const searchStudentByRegNo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { regNo } = req.params;
    const student = await prisma.student.findUnique({
      where: { regNo: regNo as string },
      include: {
        user: { select: { name: true, email: true } },
        courses: { include: { course: true, batch: true } },
        fees: {
          where: {
            dueDate: { lte: new Date() },
            status: { in: ['PENDING', 'PARTIAL'] }
          },
          include: { payments: { select: { amount: true } } }
        }
      }
    });

    if (!student) {
      res.status(404).json({ message: 'Student not found' });
      return;
    }

    res.status(200).json(student);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const deleteStudent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const student = await prisma.student.findUnique({ where: { id: id as string } });
    if (!student) {
      res.status(404).json({ message: 'Student not found' });
      return;
    }

    // Cleanup all relations
    await prisma.studentCourse.deleteMany({ where: { studentId: id as string } });
    await prisma.attendance.deleteMany({ where: { studentId: id as string } });
    await prisma.result.deleteMany({ where: { studentId: id as string } });
    
    // Cleanup new modules
    await prisma.leavePass.deleteMany({ where: { studentId: id as string } });
    await prisma.inventoryIssue.deleteMany({ where: { studentId: id as string } });
    
    // Payments linked to student
    await prisma.payment.deleteMany({ where: { studentId: id as string } });
    await prisma.fee.deleteMany({ where: { studentId: id as string } });
    
    await prisma.hostelAllocation.deleteMany({ where: { studentId: id as string } });

    // Finally delete student and user
    await prisma.student.delete({ where: { id: id as string } });
    await prisma.user.delete({ where: { id: student.userId } });

    res.status(200).json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error("Delete Student Error:", error);
    res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};export const enrollOrPromote = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { courseId, batchId, academicFee, monthlyHostelFee, isResidential } = req.body;

    const student = await prisma.student.findUnique({ where: { id: id as string } });
    if (!student) {
      res.status(404).json({ message: 'Student not found' });
      return;
    }

    // 1. Upsert StudentCourse enrollment
    await prisma.studentCourse.upsert({
      where: {
        studentId_courseId: {
          studentId: id as string,
          courseId: courseId as string
        }
      },
      update: { batchId: batchId as string },
      create: {
        studentId: id as string,
        courseId: courseId as string,
        batchId: batchId as string
      }
    });

    // 2. Generate New Academic Fee
    if (academicFee) {
      await prisma.fee.create({
        data: {
          studentId: id as string,
          courseId: courseId as string,
          amount: parseFloat(academicFee),
          type: 'ACADEMIC',
          dueDate: new Date(),
          status: 'PENDING'
        }
      });
    }

    // 3. Generate Hostel Fees if applicable
    const shouldAddHostel = isResidential === true || isResidential === 'true';
    if (shouldAddHostel && monthlyHostelFee) {
      const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
      const admissionDate = new Date();
      const startMonth = admissionDate.getMonth();
      const startYear = admissionDate.getFullYear();
      
      for (let i = 0; i < 12; i++) {
        const targetMonth = (startMonth + i) % 12;
        const yearOffset = Math.floor((startMonth + i) / 12);
        const dueDate = new Date(startYear + yearOffset, targetMonth, 10);
        
        await prisma.fee.create({
          data: {
            studentId: id as string,
            courseId: courseId as string,
            amount: parseFloat(monthlyHostelFee),
            type: 'HOSTEL',
            month: months[targetMonth],
            dueDate,
            status: 'PENDING'
          }
        });
      }
    }

    res.status(200).json({ message: 'Student promoted/enrolled successfully' });
  } catch (error) {
    console.error('Error in enrollOrPromote:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};
