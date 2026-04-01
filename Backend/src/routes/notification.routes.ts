import { Router } from 'express';
import { getNotifications, markAsRead, markAllAsRead, savePushToken } from '../controllers/notification.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);
router.get('/', getNotifications);
router.patch('/:id/read', markAsRead);
router.patch('/read-all', markAllAsRead);
router.post('/push-token', savePushToken);

export default router;