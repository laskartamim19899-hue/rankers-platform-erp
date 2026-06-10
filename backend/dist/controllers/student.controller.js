"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.enrollOrPromote = exports.deleteStudent = exports.searchStudentByRegNo = exports.updateStudent = exports.getStudentById = exports.getAllStudents = exports.approveStudent = exports.getPendingStudents = exports.createStudent = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
// Auto-generate Registration Number
const generateRegNo = async () => {
    const students = await prisma_1.default.student.findMany({
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
const createStudent = async (req, res) => {
    try {
        const { email, password, name, guardianName, dob, gender, phone, address, schoolName, madhyamikMarks, hsMarksPhysics, hsMarksChemistry, hsMarksBiology, prevNeetMarks, isResidential, batchId } = req.body;
        const existingUser = await prisma_1.default.user.findUnique({ where: { email } });
        if (existingUser) {
            res.status(400).json({ message: 'User with this email already exists' });
            return;
        }
        let courseIdToConnect = null;
        if (batchId) {
            const batch = await prisma_1.default.batch.findUnique({ where: { id: batchId } });
            if (batch)
                courseIdToConnect = batch.courseId;
        }
        const hashedPassword = await bcryptjs_1.default.hash(password || 'password123', 10);
        // Registration number will be generated only upon approval by Admin
        const regNo = null;
        const newStudent = await prisma_1.default.user.create({
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
                await prisma_1.default.fee.create({
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
                    await prisma_1.default.fee.create({
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
    }
    catch (error) {
        console.error('Error registering student:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.createStudent = createStudent;
const getPendingStudents = async (req, res) => {
    try {
        const students = await prisma_1.default.student.findMany({
            where: { status: 'PENDING' },
            include: {
                user: { select: { id: true, name: true, email: true } },
                courses: { include: { course: true, batch: true } }
            }
        });
        res.status(200).json(students);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getPendingStudents = getPendingStudents;
const approveStudent = async (req, res) => {
    try {
        const { id } = req.params;
        // Check if already approved
        const student = await prisma_1.default.student.findUnique({ where: { id: id } });
        if (!student) {
            res.status(404).json({ message: 'Student not found' });
            return;
        }
        if (student.status === 'APPROVED') {
            res.status(400).json({ message: 'Student is already approved' });
            return;
        }
        const regNo = await generateRegNo();
        const updated = await prisma_1.default.student.update({
            where: { id: id },
            data: {
                status: 'APPROVED',
                regNo
            },
            include: {
                user: { select: { name: true, email: true } }
            }
        });
        res.status(200).json({ message: 'Student approved successfully', student: updated });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.approveStudent = approveStudent;
const getAllStudents = async (req, res) => {
    try {
        const students = await prisma_1.default.student.findMany({
            include: {
                user: { select: { id: true, name: true, email: true } },
                courses: { include: { course: true, batch: true } }
            }
        });
        res.status(200).json(students);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getAllStudents = getAllStudents;
const getStudentById = async (req, res) => {
    try {
        const { id } = req.params;
        const student = await prisma_1.default.student.findUnique({
            where: { id: id },
            include: {
                user: { select: { id: true, name: true, email: true } },
                courses: { include: { course: true, batch: true } },
                fees: { include: { course: true } },
                payments: true,
                attendances: true,
                results: { include: { test: true } },
                hostelAlloc: { include: { hostel: true } },
                leavePasses: true,
                inventoryIssues: { include: { item: true } },
                transportAlloc: { include: { vehicle: true, route: true } },
                certificates: true
            }
        });
        if (!student) {
            res.status(404).json({ message: 'Student not found' });
            return;
        }
        if (student.status === 'INACTIVE') {
            student.fees = student.fees.filter(f => f.status === 'PAID');
        }
        res.status(200).json(student);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getStudentById = getStudentById;
const updateStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const { phone, address, photoUrl, guardianName, schoolName, status } = req.body;
        const updated = await prisma_1.default.student.update({
            where: { id: id },
            data: {
                ...(phone !== undefined && { phone }),
                ...(address !== undefined && { address }),
                ...(photoUrl !== undefined && { photoUrl }),
                ...(guardianName !== undefined && { guardianName }),
                ...(schoolName !== undefined && { schoolName }),
                ...(status !== undefined && { status }),
            }
        });
        res.status(200).json(updated);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.updateStudent = updateStudent;
const searchStudentByRegNo = async (req, res) => {
    try {
        const { regNo } = req.params;
        const student = await prisma_1.default.student.findUnique({
            where: { regNo: regNo },
            include: {
                user: { select: { id: true, name: true, email: true } },
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
        if (student.status === 'INACTIVE') {
            student.fees = [];
        }
        res.status(200).json(student);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.searchStudentByRegNo = searchStudentByRegNo;
const deleteStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const student = await prisma_1.default.student.findUnique({ where: { id: id } });
        if (!student) {
            res.status(404).json({ message: 'Student not found' });
            return;
        }
        // Cleanup all relations
        await prisma_1.default.studentCourse.deleteMany({ where: { studentId: id } });
        await prisma_1.default.attendance.deleteMany({ where: { studentId: id } });
        await prisma_1.default.result.deleteMany({ where: { studentId: id } });
        // Cleanup new modules
        await prisma_1.default.leavePass.deleteMany({ where: { studentId: id } });
        await prisma_1.default.inventoryIssue.deleteMany({ where: { studentId: id } });
        // Payments linked to student
        await prisma_1.default.payment.deleteMany({ where: { studentId: id } });
        await prisma_1.default.fee.deleteMany({ where: { studentId: id } });
        await prisma_1.default.hostelAllocation.deleteMany({ where: { studentId: id } });
        // Finally delete student and user
        await prisma_1.default.student.delete({ where: { id: id } });
        await prisma_1.default.user.delete({ where: { id: student.userId } });
        res.status(200).json({ message: 'Student deleted successfully' });
    }
    catch (error) {
        console.error("Delete Student Error:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.deleteStudent = deleteStudent;
const enrollOrPromote = async (req, res) => {
    try {
        const { id } = req.params;
        const { courseId, batchId, academicFee, monthlyHostelFee, isResidential } = req.body;
        const student = await prisma_1.default.student.findUnique({ where: { id: id } });
        if (!student) {
            res.status(404).json({ message: 'Student not found' });
            return;
        }
        // 1. Upsert StudentCourse enrollment
        await prisma_1.default.studentCourse.upsert({
            where: {
                studentId_courseId: {
                    studentId: id,
                    courseId: courseId
                }
            },
            update: { batchId: batchId },
            create: {
                studentId: id,
                courseId: courseId,
                batchId: batchId
            }
        });
        // 2. Generate New Academic Fee
        if (academicFee) {
            await prisma_1.default.fee.create({
                data: {
                    studentId: id,
                    courseId: courseId,
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
                await prisma_1.default.fee.create({
                    data: {
                        studentId: id,
                        courseId: courseId,
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
    }
    catch (error) {
        console.error('Error in enrollOrPromote:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.enrollOrPromote = enrollOrPromote;
//# sourceMappingURL=student.controller.js.map