import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { upload } from '../lib/upload';
import { submitSupportRequest } from '../controllers/support.controller';

const router = Router();

router.use(authenticate); 
router.post('/request', upload.single('screenshot'), submitSupportRequest);

export default router;