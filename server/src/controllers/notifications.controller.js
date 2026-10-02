import Notification from '../models/Notification.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .limit(50);

  const unreadCount = await Notification.countDocuments({ userId: req.user._id, readAt: null });

  res.status(200).json({
    success: true,
    data: notifications,
    unreadCount,
  });
});

export const markRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { readAt: new Date() },
    { new: true }
  );

  res.status(200).json({ success: true, data: notification });
});

export const markAsRead = markRead;

export const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { userId: req.user._id, readAt: null },
    { readAt: new Date() }
  );

  res.status(200).json({ success: true, message: 'All notifications marked as read' });
});

export const markAllAsRead = markAllRead;

export const deleteNotification = asyncHandler(async (req, res) => {
  await Notification.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  res.status(200).json({ success: true, message: 'Notification deleted' });
});

export const deleteAllNotifications = asyncHandler(async (req, res) => {
  await Notification.deleteMany({ userId: req.user._id });
  res.status(200).json({ success: true, message: 'All notifications deleted' });
});
