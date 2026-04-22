import { Router } from 'express';
import { getMe, updateProfile, updateEmail, changePassword, deactivateAccount, deleteAccount, uploadAvatar, savePushToken, setupPassword, requestPasswordSetupOtp, requestEmailChange, confirmEmailChange, requestActionOtp } from '../controllers/user.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { upload } from '../lib/upload';

const router = Router();

router.use(authenticate);

router.get('/me', getMe);
router.patch('/profile', updateProfile);
router.patch('/email', updateEmail);
router.patch('/password', changePassword);
router.post('/avatar', (req, res, next) => {
  upload.single('avatar')(req, res, (err) => {
    if (err && !req.file) {
      console.error('Upload middleware error:', err);
      return res.status(400).json({ message: err.message, details: err.toString() });
    }
    if (err) console.warn('Non-fatal upload warning:', err.message)
    next();
  });
}, uploadAvatar);
// router.post('/request-password-setup-otp', requestPasswordSetupOtp);
// router.post('/setup-password', setupPassword)
router.post('/request-email-change', requestEmailChange)
router.post('/confirm-email-change', confirmEmailChange)
router.post('/request-action-otp', requestActionOtp)
router.post('/push-token', savePushToken);
router.patch('/deactivate', deactivateAccount);
router.delete('/delete', deleteAccount);

export default router;