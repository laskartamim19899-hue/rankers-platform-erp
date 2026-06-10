"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.terminateAttempt = exports.getLiveAttempts = exports.updateHeartbeat = exports.getAttemptResult = exports.submitExam = exports.saveResponse = exports.startAttempt = exports.getStudentExams = exports.getExams = exports.createExam = exports.getQuestions = exports.createQuestion = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const createQuestion = async (req, res) => {
    try {
        const { content, type, subject, topic, difficulty, options, correctOption, explanation, imageUrl } = req.body;
        const question = await prisma_1.default.question.create({
            data: {
                content,
                type,
                subject,
                topic,
                difficulty,
                options,
                correctOption,
                explanation,
                imageUrl
            }
        });
        res.status(201).json(question);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.createQuestion = createQuestion;
const getQuestions = async (req, res) => {
    try {
        const { subject, topic, difficulty } = req.query;
        const where = {};
        if (subject)
            where.subject = subject;
        if (topic)
            where.topic = topic;
        if (difficulty)
            where.difficulty = difficulty;
        const questions = await prisma_1.default.question.findMany({
            where,
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json(questions);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getQuestions = getQuestions;
const createExam = async (req, res) => {
    try {
        const { title, description, startTime, endTime, duration, totalMarks, positiveMarks, negativeMarks, examPattern, questionIds, batchIds } = req.body;
        // Create Exam and connect to batches and questions
        const exam = await prisma_1.default.cbtExam.create({
            data: {
                title,
                description,
                startTime: new Date(startTime),
                endTime: new Date(endTime),
                duration: parseInt(duration),
                totalMarks: parseInt(totalMarks),
                positiveMarks: parseFloat(positiveMarks),
                negativeMarks: parseFloat(negativeMarks),
                examPattern: examPattern || 'STANDARD',
                status: 'PUBLISHED',
                batches: {
                    connect: batchIds.map((id) => ({ id }))
                },
                questions: {
                    create: questionIds.map((q) => ({
                        questionId: q.id,
                        order: q.order,
                        section: q.section
                    }))
                }
            },
            include: {
                questions: {
                    include: { question: true }
                },
                batches: true
            }
        });
        res.status(201).json(exam);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.createExam = createExam;
const getExams = async (req, res) => {
    try {
        const exams = await prisma_1.default.cbtExam.findMany({
            include: {
                batches: true,
                _count: { select: { questions: true, attempts: true } }
            },
            orderBy: { startTime: 'desc' }
        });
        res.status(200).json(exams);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getExams = getExams;
const getStudentExams = async (req, res) => {
    try {
        const { studentId } = req.params;
        // Find batches student is in
        const studentIdStr = studentId;
        const student = await prisma_1.default.student.findUnique({
            where: { id: studentIdStr },
            include: { courses: true }
        });
        if (!student) {
            res.status(404).json({ message: 'Student not found' });
            return;
        }
        const batchIds = student.courses.map((c) => c.batchId).filter(Boolean);
        const exams = await prisma_1.default.cbtExam.findMany({
            where: {
                batches: {
                    some: { id: { in: batchIds } }
                },
                status: 'PUBLISHED'
            },
            include: {
                attempts: {
                    where: { studentId: studentIdStr }
                }
            },
            orderBy: { startTime: 'desc' }
        });
        res.status(200).json(exams);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getStudentExams = getStudentExams;
const startAttempt = async (req, res) => {
    try {
        const { studentId, examId } = req.body;
        // Check if exam exists and student has access
        const exam = await prisma_1.default.cbtExam.findUnique({
            where: { id: examId },
            include: {
                questions: {
                    include: { question: true },
                    orderBy: { order: 'asc' }
                }
            }
        });
        if (!exam) {
            res.status(404).json({ message: 'Exam not found' });
            return;
        }
        // Check if attempt already exists
        let attempt = await prisma_1.default.cbtAttempt.findUnique({
            where: { studentId_examId: { studentId, examId } },
            include: { responses: true }
        });
        if (attempt && attempt.status === 'SUBMITTED') {
            res.status(400).json({ message: 'Exam already submitted' });
            return;
        }
        if (!attempt) {
            attempt = await prisma_1.default.cbtAttempt.create({
                data: { studentId, examId },
                include: { responses: true }
            });
        }
        // Return exam data (sanitize questions: remove correct answers)
        const sanitizedQuestions = exam.questions.map(eq => {
            const { correctOption, explanation, ...rest } = eq.question;
            return {
                ...eq,
                question: rest
            };
        });
        res.status(200).json({
            attempt,
            exam: {
                ...exam,
                questions: sanitizedQuestions
            }
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.startAttempt = startAttempt;
const saveResponse = async (req, res) => {
    try {
        const { attemptId, questionId, selectedOption, timeSpent } = req.body;
        const response = await prisma_1.default.cbtResponse.upsert({
            where: {
                attemptId_questionId: { attemptId, questionId }
            },
            update: {
                selectedOption,
                timeSpent: { increment: timeSpent || 0 }
            },
            create: {
                attemptId,
                questionId,
                selectedOption,
                timeSpent: timeSpent || 0
            }
        });
        res.status(200).json(response);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.saveResponse = saveResponse;
const submitExam = async (req, res) => {
    try {
        const { attemptId } = req.body;
        const attempt = await prisma_1.default.cbtAttempt.findUnique({
            where: { id: attemptId },
            include: {
                exam: {
                    include: { questions: true }
                },
                responses: {
                    include: { question: true }
                }
            }
        });
        if (!attempt) {
            res.status(404).json({ message: 'Attempt not found' });
            return;
        }
        if (attempt.status === 'SUBMITTED') {
            res.status(400).json({ message: 'Already submitted' });
            return;
        }
        // Calculate Score
        let score = 0;
        const responsesWithCorrectness = [];
        if (attempt.exam.examPattern === 'NEET_NTA') {
            // Group responses by subject and section
            const subjects = ['PHYSICS', 'CHEMISTRY', 'BIOLOGY', 'BOTANY', 'ZOOLOGY'];
            for (const subject of subjects) {
                // Section A (35 questions)
                const secA = attempt.responses.filter(r => r.question.subject === subject && attempt.exam.questions.find((eq) => eq.questionId === r.questionId)?.section === 'A');
                for (const resp of secA) {
                    const isCorrect = resp.selectedOption === resp.question.correctOption;
                    if (resp.selectedOption) {
                        score += isCorrect ? attempt.exam.positiveMarks : -attempt.exam.negativeMarks;
                    }
                    responsesWithCorrectness.push({ id: resp.id, isCorrect });
                }
                // Section B (Attempt any 10 out of 15)
                const secB = attempt.responses.filter(r => r.question.subject === subject && attempt.exam.questions.find((eq) => eq.questionId === r.questionId)?.section === 'B');
                // Find first 10 attempted (with selectedOption)
                const attemptedInB = secB.filter(r => r.selectedOption).slice(0, 10);
                const unattemptedInB = secB.filter(r => !attemptedInB.includes(r));
                for (const resp of attemptedInB) {
                    const isCorrect = resp.selectedOption === resp.question.correctOption;
                    score += isCorrect ? attempt.exam.positiveMarks : -attempt.exam.negativeMarks;
                    responsesWithCorrectness.push({ id: resp.id, isCorrect });
                }
                // Mark remaining as incorrect/not-counted (isCorrect false but 0 marks)
                for (const resp of unattemptedInB) {
                    responsesWithCorrectness.push({ id: resp.id, isCorrect: false });
                }
            }
        }
        else {
            // Standard Scoring
            for (const resp of attempt.responses) {
                const isCorrect = resp.selectedOption === resp.question.correctOption;
                if (resp.selectedOption) {
                    score += isCorrect ? attempt.exam.positiveMarks : -attempt.exam.negativeMarks;
                }
                responsesWithCorrectness.push({ id: resp.id, isCorrect });
            }
        }
        // Update attempt status and score
        const updatedAttempt = await prisma_1.default.cbtAttempt.update({
            where: { id: attemptId },
            data: {
                status: 'SUBMITTED',
                submitTime: new Date(),
                score,
                responses: {
                // This is a bit tricky in Prisma, better to update responses individually or use a transaction
                }
            }
        });
        // Update each response with its correctness
        await Promise.all(responsesWithCorrectness.map(r => prisma_1.default.cbtResponse.update({
            where: { id: r.id },
            data: { isCorrect: r.isCorrect }
        })));
        res.status(200).json({
            message: 'Exam submitted successfully',
            score,
            attempt: updatedAttempt
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.submitExam = submitExam;
const getAttemptResult = async (req, res) => {
    try {
        const { attemptId } = req.params;
        const attempt = await prisma_1.default.cbtAttempt.findUnique({
            where: { id: attemptId },
            include: {
                exam: {
                    include: {
                        questions: {
                            include: { question: true },
                            orderBy: { order: 'asc' }
                        }
                    }
                },
                responses: true,
                student: {
                    include: { user: true }
                }
            }
        });
        if (!attempt) {
            res.status(404).json({ message: 'Attempt not found' });
            return;
        }
        res.status(200).json(attempt);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getAttemptResult = getAttemptResult;
const updateHeartbeat = async (req, res) => {
    try {
        const { attemptId, securityAlerts } = req.body;
        const attempt = await prisma_1.default.cbtAttempt.update({
            where: { id: attemptId },
            data: {
                lastHeartbeat: new Date(),
                securityAlerts: securityAlerts !== undefined ? { increment: securityAlerts } : undefined
            }
        });
        if (attempt.securityAlerts >= 3 && !attempt.isTerminated) {
            await prisma_1.default.cbtAttempt.update({
                where: { id: attemptId },
                data: { status: 'SUBMITTED', submitTime: new Date() }
            });
        }
        res.status(200).json(attempt);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.updateHeartbeat = updateHeartbeat;
const getLiveAttempts = async (req, res) => {
    try {
        const attempts = await prisma_1.default.cbtAttempt.findMany({
            where: {
                status: 'STARTED',
                lastHeartbeat: {
                    gte: new Date(Date.now() - 5 * 60 * 1000) // Active in last 5 mins
                }
            },
            include: {
                student: { include: { user: true } },
                exam: true,
                _count: { select: { responses: true } }
            }
        });
        res.status(200).json(attempts);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getLiveAttempts = getLiveAttempts;
const terminateAttempt = async (req, res) => {
    try {
        const { attemptId } = req.params;
        await prisma_1.default.cbtAttempt.update({
            where: { id: attemptId },
            data: { status: 'SUBMITTED', submitTime: new Date(), isTerminated: true }
        });
        res.status(200).json({ message: 'Attempt terminated' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.terminateAttempt = terminateAttempt;
//# sourceMappingURL=cbt.controller.js.map