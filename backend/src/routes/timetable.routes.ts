import { Router } from 'express';
import { getAllTimetables, getTimetable, upsertTimetable, deleteSlot } from '../controllers/timetable.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
router.get('/', authenticate, getAllTimetables);
router.get('/:batchId', authenticate, getTimetable);
router.post('/', authenticate, upsertTimetable);
router.delete('/slot/:id', authenticate, deleteSlot);
export default router;
