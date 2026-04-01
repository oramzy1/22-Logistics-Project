import { Router } from 'express';
import { forgotPassword, login, register, resetPassword, verifyEmail } from '../controllers/auth.controller';
import { upload } from '../lib/upload';

const router = Router();

router.post('/register', upload.single('logo'), register);
router.post('/login', login);
router.post('/verify-email', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;
