import express from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import * as notificationController from '../controllers/notification.controller';

const router = express.Router();
router.use(authenticateToken);

router.get('/', notificationController.getNotifications);
router.get('/unread/count', notificationController.getUnreadCount);
router.patch('/:id/read', notificationController.markAsRead);
router.patch('/read-all', notificationController.markAllAsRead);
router.delete('/:id', notificationController.deleteNotification);

export default router;
