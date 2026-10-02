import express from 'express';
import * as notificationsController from '../controllers/notifications.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(authenticate);

router.get('/', notificationsController.getNotifications);
router.patch('/:id/read', notificationsController.markRead);
router.put('/:id/read', notificationsController.markRead);
router.patch('/read-all', notificationsController.markAllRead);
router.put('/read-all', notificationsController.markAllRead);
router.delete('/:id', notificationsController.deleteNotification);
router.delete('/', notificationsController.deleteAllNotifications);

export default router;
