import { Router } from 'express';
import { listNotifications, getUnreadCount, markRead, markAllRead } from '../controllers/notification.controller.js';
import { protect } from '../middleware/auth.js';
import { validateObjectId } from '../middleware/validateObjectId.js';

const router = Router();
router.param('id', validateObjectId);
router.use(protect);

router.get('/', listNotifications);
router.get('/unread-count', getUnreadCount);
router.patch('/read-all', markAllRead);
router.patch('/:id/read', markRead);

export default router;