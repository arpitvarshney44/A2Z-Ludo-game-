import express from 'express';
import { sendOTPController, verifyOTPController, getMe, logout } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { otpLimiter, loginLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/send-otp', otpLimiter, sendOTPController);
router.post('/verify-otp', loginLimiter, verifyOTPController);
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

export default router;
