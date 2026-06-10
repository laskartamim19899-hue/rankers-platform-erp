import { Router } from 'express';
import * as cbtController from '../controllers/cbt.controller';

const router = Router();

// Question Bank
router.post('/questions', cbtController.createQuestion);
router.get('/questions', cbtController.getQuestions);

// Exam Management
router.post('/exams', cbtController.createExam);
router.get('/exams', cbtController.getExams);

// Student Endpoints
router.get('/student/:studentId/exams', cbtController.getStudentExams);
router.post('/start-attempt', cbtController.startAttempt);
router.post('/save-response', cbtController.saveResponse);
router.post('/submit-exam', cbtController.submitExam);
router.get('/attempt/:attemptId', cbtController.getAttemptResult);
// Proctoring & Security
router.post('/heartbeat', cbtController.updateHeartbeat);
router.get('/live', cbtController.getLiveAttempts);
router.post('/terminate/:attemptId', cbtController.terminateAttempt);

export default router;
