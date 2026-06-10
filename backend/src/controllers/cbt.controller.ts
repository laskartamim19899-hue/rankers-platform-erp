import { Request, Response } from 'express';
import prisma from '../prisma';

export const createQuestion = async (req: Request, res: Response): Promise<void> => {
  try {
    const { content, type, subject, topic, difficulty, options, correctOption, explanation, imageUrl } = req.body;
    const question = await prisma.question.create({
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
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getQuestions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { subject, topic, difficulty } = req.query;
    const where: any = {};
    if (subject) where.subject = subject as string;
    if (topic) where.topic = topic as string;
    if (difficulty) where.difficulty = difficulty as string;

    const questions = await prisma.question.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json(questions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const createExam = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, startTime, endTime, duration, totalMarks, positiveMarks, negativeMarks, examPattern, questionIds, batchIds } = req.body;
    
    // Create Exam and connect to batches and questions
    const exam = await prisma.cbtExam.create({
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
          connect: batchIds.map((id: string) => ({ id }))
        },
        questions: {
          create: questionIds.map((q: { id: string, order: number, section?: string }) => ({
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
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getExams = async (req: Request, res: Response): Promise<void> => {
  try {
    const exams = await prisma.cbtExam.findMany({
      include: {
        batches: true,
        _count: { select: { questions: true, attempts: true } }
      },
      orderBy: { startTime: 'desc' }
    });
    res.status(200).json(exams);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getStudentExams = async (req: Request, res: Response): Promise<void> => {
  try {
    const { studentId } = req.params;
    
    // Find batches student is in
    const studentIdStr = studentId as string;
    const student = await prisma.student.findUnique({
      where: { id: studentIdStr },
      include: { courses: true }
    });

    if (!student) {
      res.status(404).json({ message: 'Student not found' });
      return;
    }

    const batchIds = (student as any).courses.map((c: any) => c.batchId).filter(Boolean) as string[];

    const exams = await prisma.cbtExam.findMany({
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
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const startAttempt = async (req: Request, res: Response): Promise<void> => {
  try {
    const { studentId, examId } = req.body;

    // Check if exam exists and student has access
    const exam = await prisma.cbtExam.findUnique({
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
    let attempt = await prisma.cbtAttempt.findUnique({
      where: { studentId_examId: { studentId, examId } },
      include: { responses: true }
    });

    if (attempt && attempt.status === 'SUBMITTED') {
      res.status(400).json({ message: 'Exam already submitted' });
      return;
    }

    if (!attempt) {
      attempt = await prisma.cbtAttempt.create({
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
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const saveResponse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { attemptId, questionId, selectedOption, timeSpent } = req.body;

    const response = await prisma.cbtResponse.upsert({
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
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const submitExam = async (req: Request, res: Response): Promise<void> => {
  try {
    const { attemptId } = req.body;

    const attempt = await prisma.cbtAttempt.findUnique({
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
        const secA = attempt.responses.filter(r => r.question.subject === subject && (attempt.exam as any).questions.find((eq: any) => eq.questionId === r.questionId)?.section === 'A');
        for (const resp of secA) {
          const isCorrect = resp.selectedOption === resp.question.correctOption;
          if (resp.selectedOption) {
            score += isCorrect ? attempt.exam.positiveMarks : -attempt.exam.negativeMarks;
          }
          responsesWithCorrectness.push({ id: resp.id, isCorrect });
        }

        // Section B (Attempt any 10 out of 15)
        const secB = attempt.responses.filter(r => r.question.subject === subject && (attempt.exam as any).questions.find((eq: any) => eq.questionId === r.questionId)?.section === 'B');
        
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
    } else {
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
    const updatedAttempt = await prisma.cbtAttempt.update({
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
    await Promise.all(responsesWithCorrectness.map(r => 
      prisma.cbtResponse.update({
        where: { id: r.id },
        data: { isCorrect: r.isCorrect }
      })
    ));

    res.status(200).json({
      message: 'Exam submitted successfully',
      score,
      attempt: updatedAttempt
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getAttemptResult = async (req: Request, res: Response): Promise<void> => {
  try {
    const { attemptId } = req.params;

    const attempt = await prisma.cbtAttempt.findUnique({
      where: { id: attemptId as string },
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
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const updateHeartbeat = async (req: Request, res: Response): Promise<void> => {
  try {
    const { attemptId, securityAlerts } = req.body;
    const attempt = await prisma.cbtAttempt.update({
      where: { id: attemptId },
      data: {
        lastHeartbeat: new Date(),
        securityAlerts: securityAlerts !== undefined ? { increment: securityAlerts } : undefined
      }
    });

    if (attempt.securityAlerts >= 3 && !attempt.isTerminated) {
      await prisma.cbtAttempt.update({
        where: { id: attemptId },
        data: { status: 'SUBMITTED', submitTime: new Date() }
      });
    }

    res.status(200).json(attempt);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getLiveAttempts = async (req: Request, res: Response): Promise<void> => {
  try {
    const attempts = await prisma.cbtAttempt.findMany({
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
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const terminateAttempt = async (req: Request, res: Response): Promise<void> => {
  try {
    const { attemptId } = req.params;
    await prisma.cbtAttempt.update({
      where: { id: attemptId as string },
      data: { status: 'SUBMITTED', submitTime: new Date(), isTerminated: true }
    });
    res.status(200).json({ message: 'Attempt terminated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
