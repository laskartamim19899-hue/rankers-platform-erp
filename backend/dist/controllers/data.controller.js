"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.importData = exports.resetAllData = exports.exportAllData = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
// ─── EXPORT ALL DATA ─────────────────────────────────────────────────────────
const exportAllData = async (req, res) => {
    try {
        const [students, courses, batches, fees, payments, attendance, tests, results, expenses, hostelAllocations, leaves, inventory, inventoryIssues, timetables, staff] = await Promise.all([
            prisma_1.default.student.findMany({
                include: { user: { select: { email: true, name: true } }, courses: true, fees: true }
            }),
            prisma_1.default.course.findMany({ include: { batches: true } }),
            prisma_1.default.batch.findMany({ include: { course: true } }),
            prisma_1.default.fee.findMany(),
            prisma_1.default.payment.findMany(),
            prisma_1.default.attendance.findMany(),
            prisma_1.default.test.findMany(),
            prisma_1.default.result.findMany(),
            prisma_1.default.expense.findMany(),
            prisma_1.default.hostelAllocation.findMany(),
            prisma_1.default.leavePass.findMany(),
            prisma_1.default.inventoryItem.findMany(),
            prisma_1.default.inventoryIssue.findMany(),
            prisma_1.default.timetable.findMany({ include: { slots: true } }),
            prisma_1.default.user.findMany({
                where: { role: { not: 'STUDENT' } },
                select: { id: true, name: true, email: true, role: true, createdAt: true }
            })
        ]);
        const exportPayload = {
            exportedAt: new Date().toISOString(),
            version: '1.0',
            data: {
                students, courses, batches, fees, payments, attendance, tests, results,
                expenses, hostelAllocations, leaves, inventory, inventoryIssues,
                timetables, staff
            }
        };
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="rankers_backup_${Date.now()}.json"`);
        res.status(200).json(exportPayload);
    }
    catch (error) {
        res.status(500).json({ message: 'Export failed', error });
    }
};
exports.exportAllData = exportAllData;
// ─── RESET ALL DATA ──────────────────────────────────────────────────────────
const resetAllData = async (req, res) => {
    try {
        const { confirmPhrase } = req.body;
        if (confirmPhrase !== 'RESET ALL DATA') {
            res.status(400).json({ message: 'Confirmation phrase incorrect. Type exactly: RESET ALL DATA' });
            return;
        }
        // PostgreSQL compatible truncation with CASCADE to handle foreign keys
        await prisma_1.default.$executeRawUnsafe(`
      TRUNCATE TABLE 
        "GuestPayment", "SalaryRecord", "StaffProfile", "GuestTeacher", 
        "InventoryIssue", "InventoryItem", "LeavePass", "HostelAllocation", 
        "Hostel", "Result", "Test", "Attendance", "TimetableSlot", 
        "Timetable", "Payment", "Fee", "StudentCourse", "Student", 
        "Batch", "Course", "Expense", "AdmissionInquiry", "Announcement"
      RESTART IDENTITY CASCADE;
    `);
        // Manually delete users except SUPER_ADMIN
        await prisma_1.default.user.deleteMany({
            where: { role: { not: 'SUPER_ADMIN' } }
        });
        res.status(200).json({ message: 'All institution data has been reset successfully. Settings and SUPER_ADMIN account preserved.' });
    }
    catch (error) {
        console.error('Reset error:', error);
        res.status(500).json({ message: 'Reset failed', error });
    }
};
exports.resetAllData = resetAllData;
// ─── IMPORT DATA ─────────────────────────────────────────────────────────────
const importData = async (req, res) => {
    try {
        const { data, version } = req.body;
        if (!data || !data.courses) {
            res.status(400).json({ message: 'Invalid import format. Please upload a valid Rankers backup file.' });
            return;
        }
        const results = { courses: 0, batches: 0, staff: 0, students: 0, fees: 0, expenses: 0, skipped: 0 };
        // Import Courses
        for (const course of (data.courses || [])) {
            try {
                await prisma_1.default.course.upsert({
                    where: { id: course.id },
                    update: { name: course.name, description: course.description, duration: course.duration },
                    create: { id: course.id, name: course.name, description: course.description, duration: course.duration }
                });
                results.courses++;
            }
            catch {
                results.skipped++;
            }
        }
        // Import Batches
        for (const batch of (data.batches || [])) {
            try {
                await prisma_1.default.batch.upsert({
                    where: { id: batch.id },
                    update: { name: batch.name, courseId: batch.courseId },
                    create: { id: batch.id, name: batch.name, courseId: batch.courseId, teacherId: batch.teacherId || null }
                });
                results.batches++;
            }
            catch {
                results.skipped++;
            }
        }
        // Import Staff Users
        for (const staffMember of (data.staff || [])) {
            try {
                const existing = await prisma_1.default.user.findUnique({ where: { email: staffMember.email } });
                if (!existing) {
                    const hashed = await bcryptjs_1.default.hash('welcome123', 10);
                    await prisma_1.default.user.create({
                        data: {
                            id: staffMember.id,
                            name: staffMember.name,
                            email: staffMember.email,
                            password: hashed,
                            role: staffMember.role
                        }
                    });
                    results.staff++;
                }
                else {
                    results.skipped++;
                }
            }
            catch {
                results.skipped++;
            }
        }
        // Import Timetables & Slots
        for (const tt of (data.timetables || [])) {
            try {
                const existing = await prisma_1.default.timetable.findUnique({ where: { batchId: tt.batchId } });
                if (!existing) {
                    await prisma_1.default.timetable.create({
                        data: {
                            id: tt.id,
                            batchId: tt.batchId,
                            slots: {
                                create: (tt.slots || []).map((s) => ({
                                    id: s.id,
                                    day: s.day,
                                    startTime: s.startTime,
                                    endTime: s.endTime,
                                    subject: s.subject,
                                    teacherName: s.teacherName,
                                    roomNo: s.roomNo
                                }))
                            }
                        }
                    });
                }
            }
            catch {
                results.skipped++;
            }
        }
        // Import Students + their course links
        for (const student of (data.students || [])) {
            try {
                const existing = await prisma_1.default.user.findUnique({ where: { email: student.user.email } });
                if (existing) {
                    results.skipped++;
                    continue;
                }
                const hashed = await bcryptjs_1.default.hash('password123', 10);
                await prisma_1.default.user.create({
                    data: {
                        id: student.userId,
                        name: student.user.name,
                        email: student.user.email,
                        password: hashed,
                        role: 'STUDENT',
                        studentProfile: {
                            create: {
                                id: student.id,
                                regNo: student.regNo,
                                guardianName: student.guardianName,
                                dob: new Date(student.dob),
                                gender: student.gender,
                                phone: student.phone,
                                address: student.address,
                                schoolName: student.schoolName,
                                madhyamikMarks: student.madhyamikMarks,
                                isResidential: student.isResidential,
                                status: student.status,
                            }
                        }
                    }
                });
                // Restore course/batch links
                for (const sc of (student.courses || [])) {
                    try {
                        await prisma_1.default.studentCourse.create({
                            data: {
                                studentId: student.id,
                                courseId: sc.courseId,
                                batchId: sc.batchId || null
                            }
                        });
                    }
                    catch { }
                }
                results.students++;
            }
            catch {
                results.skipped++;
            }
        }
        // Import Expenses
        for (const expense of (data.expenses || [])) {
            try {
                await prisma_1.default.expense.create({
                    data: {
                        id: expense.id,
                        title: expense.title,
                        category: expense.category,
                        amount: expense.amount,
                        date: new Date(expense.date),
                        notes: expense.notes
                    }
                });
                results.expenses++;
            }
            catch {
                results.skipped++;
            }
        }
        res.status(200).json({
            message: 'Import completed!',
            summary: results
        });
    }
    catch (error) {
        console.error('Import error:', error);
        res.status(500).json({ message: 'Import failed', error });
    }
};
exports.importData = importData;
//# sourceMappingURL=data.controller.js.map