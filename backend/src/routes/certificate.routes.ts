import { Router } from 'express';
import {
  getCertificates,
  getCertificateById,
  issueCertificate,
  deleteCertificate
} from '../controllers/certificate.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Require authentication for all certificate routes
router.use(authenticate);

router.get('/', getCertificates);
router.get('/:id', getCertificateById);
router.post('/issue', issueCertificate);
router.delete('/:id', deleteCertificate);

export default router;
