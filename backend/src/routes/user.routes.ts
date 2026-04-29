import { Router } from 'express';
import { getStaff, createStaff, deleteStaff, updateProfilePic, removeProfilePic } from '../controllers/user.controller';
import { authenticate, authorize } from '../middleware/auth';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

// Configure Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

router.get('/staff', authenticate, authorize(['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT']), getStaff);
router.post('/staff', authenticate, authorize(['SUPER_ADMIN']), createStaff);
router.delete('/staff/:id', authenticate, authorize(['SUPER_ADMIN']), deleteStaff);
router.post('/profile-pic', authenticate, upload.single('photo'), updateProfilePic);
router.delete('/profile-pic', authenticate, removeProfilePic);

export default router;
