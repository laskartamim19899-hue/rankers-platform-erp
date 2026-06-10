"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getResultsByRegNo = exports.getAttendanceReport = exports.deleteCourse = exports.createCourse = exports.getTeachers = exports.deleteBatch = exports.assignTeacher = exports.createBatch = exports.createTest = exports.getTests = exports.getBatches = exports.getCourses = exports.addTestResult = exports.markAttendance = exports.getStudentAcademicSummary = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const getStudentAcademicSummary = async (req, res) => {
    try {
        const { studentId } = req.params;
        // Fetch Attendance
        const attendance = await prisma_1.default.attendance.findMany({
            where: { studentId: studentId }
        });
        const totalDays = attendance.length;
        const presentDays = attendance.filter(a => a.status === 'PRESENT').length;
        const attendancePercentage = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;
        // Fetch Test Results
        const results = await prisma_1.default.result.findMany({
            where: { studentId: studentId },
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
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getStudentAcademicSummary = getStudentAcademicSummary;
const markAttendance = async (req, res) => {
    try {
        const { studentId, batchId, date, status, timetableSlotId } = req.body;
        // Build start/end of day without mutating the same Date object
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        const existing = await prisma_1.default.attendance.findFirst({
            where: {
                studentId,
                date: { gte: startOfDay, lte: endOfDay },
                timetableSlotId: timetableSlotId || null
            }
        });
        if (existing) {
            // UPDATE the existing record instead of rejecting
            const updated = await prisma_1.default.attendance.update({
                where: { id: existing.id },
                data: { status }
            });
            res.status(200).json(updated);
            return;
        }
        const newAttendance = await prisma_1.default.attendance.create({
            data: {
                studentId,
                batchId,
                date: new Date(date),
                status,
                timetableSlotId: timetableSlotId || null
            }
        });
        res.status(201).json(newAttendance);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.markAttendance = markAttendance;
const addTestResult = async (req, res) => {
    try {
        const { testId, studentId, marksObtained } = req.body;
        const result = await prisma_1.default.result.create({
            data: {
                testId,
                studentId,
                marksObtained: parseFloat(marksObtained)
            }
        });
        res.status(201).json(result);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.addTestResult = addTestResult;
const getCourses = async (req, res) => {
    try {
        const courses = await prisma_1.default.course.findMany();
        res.status(200).json(courses);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getCourses = getCourses;
const getBatches = async (req, res) => {
    try {
        const batches = await prisma_1.default.batch.findMany({
            include: { course: true }
        });
        res.status(200).json(batches);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getBatches = getBatches;
const getTests = async (req, res) => {
    try {
        const tests = await prisma_1.default.test.findMany({
            orderBy: { date: 'desc' }
        });
        res.status(200).json(tests);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getTests = getTests;
const createTest = async (req, res) => {
    try {
        const { title, type, date, maxMarks } = req.body;
        const test = await prisma_1.default.test.create({
            data: {
                title,
                type,
                date: new Date(date),
                maxMarks: parseFloat(maxMarks)
            }
        });
        res.status(201).json(test);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.createTest = createTest;
const createBatch = async (req, res) => {
    try {
        const { name, courseId, teacherId } = req.body;
        const batch = await prisma_1.default.batch.create({
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
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.createBatch = createBatch;
const assignTeacher = async (req, res) => {
    try {
        const { id } = req.params;
        const { teacherId } = req.body;
        const updated = await prisma_1.default.batch.update({
            where: { id: id },
            data: { teacherId },
            include: {
                teacher: { select: { name: true, email: true } }
            }
        });
        res.status(200).json(updated);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.assignTeacher = assignTeacher;
const deleteBatch = async (req, res) => {
    try {
        const { id } = req.params;
        // Delete attendance records first
        await prisma_1.default.attendance.deleteMany({ where: { batchId: id } });
        await prisma_1.default.batch.delete({ where: { id: id } });
        res.status(200).json({ message: 'Batch removed successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.deleteBatch = deleteBatch;
const getTeachers = async (req, res) => {
    try {
        const teachers = await prisma_1.default.user.findMany({
            where: { role: 'TEACHER' },
            select: { id: true, name: true, email: true }
        });
        res.status(200).json(teachers);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getTeachers = getTeachers;
const createCourse = async (req, res) => {
    try {
        const { name, description, duration } = req.body;
        const course = await prisma_1.default.course.create({
            data: { name, description, duration }
        });
        res.status(201).json(course);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.createCourse = createCourse;
const deleteCourse = async (req, res) => {
    try {
        const { id } = req.params;
        // Cleanup relations first to avoid foreign key errors
        await prisma_1.default.studentCourse.deleteMany({ where: { courseId: id } });
        await prisma_1.default.fee.deleteMany({ where: { courseId: id } });
        await prisma_1.default.batch.deleteMany({ where: { courseId: id } });
        await prisma_1.default.course.delete({ where: { id: id } });
        res.status(200).json({ message: 'Course deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.deleteCourse = deleteCourse;
// ─── ATTENDANCE REPORT ───────────────────────────────────────────────────────
const getAttendanceReport = async (req, res) => {
    try {
        const { batchId, from, to, slotId } = req.query;
        const where = {};
        if (batchId)
            where.batchId = batchId;
        if (slotId === 'GENERAL') {
            where.timetableSlotId = null;
        }
        else if (slotId) {
            where.timetableSlotId = slotId;
        }
        if (from || to) {
            where.date = {};
            if (from)
                where.date.gte = new Date(from);
            if (to) {
                const toDate = new Date(to);
                toDate.setHours(23, 59, 59, 999);
                where.date.lte = toDate;
            }
        }
        const records = await prisma_1.default.attendance.findMany({
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
        const studentMap = {};
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
            if (r.status === 'PRESENT')
                studentMap[sid].present++;
            else if (r.status === 'ABSENT')
                studentMap[sid].absent++;
            else if (r.status === 'LATE')
                studentMap[sid].late++;
            studentMap[sid].records.push({
                id: r.id,
                date: r.date,
                status: r.status,
                slot: r.timetableSlot ? `${r.timetableSlot.subject} (${r.timetableSlot.startTime}-${r.timetableSlot.endTime})` : 'General',
                day: r.timetableSlot?.day || null
            });
        }
        const summary = Object.values(studentMap).map((s) => ({
            ...s,
            percentage: s.total > 0 ? ((s.present / s.total) * 100).toFixed(1) : '0'
        }));
        res.status(200).json({ summary, totalRecords: records.length });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getAttendanceReport = getAttendanceReport;
// ─── PUBLIC: Get student results by Registration Number ───────────────────────
const getResultsByRegNo = async (req, res) => {
    try {
        const { regNo } = req.params;
        const student = await prisma_1.default.student.findUnique({
            where: { regNo: String(regNo).toUpperCase() },
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
        const results = await prisma_1.default.result.findMany({
            where: { studentId: student.id },
            include: { test: true },
            orderBy: { test: { date: 'desc' } }
        });
        const attendance = await prisma_1.default.attendance.findMany({ where: { studentId: student.id } });
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
                testName: r.test.name || r.test.title || 'Test',
                testDate: r.test.date,
                testType: r.test.type,
                marksObtained: r.marksObtained,
                totalMarks: r.test.totalMarks || r.test.maxMarks,
                percentage: r.test.totalMarks || r.test.maxMarks
                    ? ((r.marksObtained / (r.test.totalMarks || r.test.maxMarks)) * 100).toFixed(1)
                    : null
            }))
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getResultsByRegNo = getResultsByRegNo;
//# sourceMappingURL=academic.controller.js.map