import { Router } from 'express';
import { getAllItems, createItem, issueItem, returnItem, deleteItem, getAllIssues } from '../controllers/inventory.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
router.get('/', authenticate, getAllItems);
router.get('/issues', authenticate, getAllIssues);
router.post('/', authenticate, createItem);
router.post('/issue', authenticate, issueItem);
router.patch('/return/:id', authenticate, returnItem);
router.delete('/:id', authenticate, deleteItem);
export default router;
