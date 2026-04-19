import { Router } from 'express';
import { getNotifications, markAsRead, markAllAsRead, savePushToken, getUnreadCount } from '../controllers/notification.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);
router.get('/', getNotifications);
router.get('/unread-count', getUnreadCount);
router.patch('/read-all', markAllAsRead);
router.patch('/:id/read', markAsRead);
router.post('/push-token', savePushToken);

export default router;