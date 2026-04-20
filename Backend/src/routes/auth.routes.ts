import { Router } from 'express';
import { appleAuth, completeBusiness, completeDriverProfile, forgotPassword, googleAuth, login, register, resetPassword, verifyEmail } from '../controllers/auth.controller';
import { upload } from '../lib/upload';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.post('/register', upload.single('logo'), register);
router.post('/google', googleAuth);
router.post('/apple', appleAuth);
router.post('/complete-business-profile', authenticate, upload.single('logo'), completeBusiness);
router.post('/complete-driver-profile',   authenticate, upload.single('license'), completeDriverProfile);
router.post('/login', login);
router.post('/verify-email', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;
