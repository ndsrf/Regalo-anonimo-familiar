import express from 'express';
import {
  getUnreadNotifications,
  markNotificationsAsRead,
  getAllNotifications,
} from '../controllers/notificationController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

// Notification management
router.get('/unread', getUnreadNotifications);
router.get('/all', getAllNotifications);
router.put('/read', markNotificationsAsRead);

export default router;
