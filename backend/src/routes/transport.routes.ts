import { Router } from 'express';
import {
  getVehicles,
  createVehicle,
  getRoutes,
  createRoute,
  allocateTransport
} from '../controllers/transport.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Require authentication for all transport routes
router.use(authenticate);

router.get('/vehicles', getVehicles);
router.post('/vehicles', createVehicle);

router.get('/routes', getRoutes);
router.post('/routes', createRoute);

router.post('/allocate', allocateTransport);

export default router;
