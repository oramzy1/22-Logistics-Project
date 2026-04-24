import { Router } from 'express';
import { appleAuth, completeBusiness, completeDriverProfile, forgotPassword, googleAuth, login, register, resendVerification, resetPassword, verifyEmail, verifyResetCode } from '../controllers/auth.controller';
import { upload } from '../lib/upload';
import { authenticate } from '../middlewares/auth.middleware';
import { forgotPasswordLimiter, loginLimiter, registerLimiter, resendVerificationLimiter, verifyCodeLimiter } from '../middlewares/rateLimiter';

const router = Router();

router.post('/register', registerLimiter, upload.single('logo'), register);
router.post('/google', loginLimiter, googleAuth);
router.post('/apple', loginLimiter, appleAuth);
router.post('/complete-business-profile', authenticate, upload.single('logo'), completeBusiness);
router.post('/complete-driver-profile',   authenticate, upload.single('license'), completeDriverProfile);
router.post('/login', loginLimiter, login);
router.post('/verify-email', verifyCodeLimiter, verifyEmail);
router.post('/verify-reset-code', verifyCodeLimiter, verifyResetCode);
router.post('/resend-verification', resendVerificationLimiter, resendVerification);
router.post('/forgot-password', forgotPasswordLimiter, forgotPassword);
router.post('/reset-password', verifyCodeLimiter, resetPassword);

export default router;
