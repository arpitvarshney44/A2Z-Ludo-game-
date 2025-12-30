import express from 'express';
import { updateProfile, uploadAvatar, getUserStats } from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';
import multer from 'multer';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.put('/profile', protect, updateProfile);
router.post('/avatar', protect, upload.single('avatar'), uploadAvatar);
router.get('/stats', protect, getUserStats);

export default router;
