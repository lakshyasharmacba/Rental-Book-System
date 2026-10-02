import Booking from '../models/Booking.js';
import Notification from '../models/Notification.js';
import { logger } from '../utils/logger.js';

export const returnReminders = async () => {
  try {
    const now = new Date();
    const in25h = new Date(now.getTime() + 25 * 3600 * 1000);
    const in23h = new Date(now.getTime() + 23 * 3600 * 1000);

    const upcoming = await Booking.find({
      status: 'ACTIVE',
      endDate: { $gte: in23h, $lte: in25h },
    });

    for (const booking of upcoming) {
      const key = `return_reminder_${booking._id}_${now.toISOString().slice(0, 10)}`;
      const exists = await Notification.findOne({ link: `/bookings/${booking._id}`, type: 'RETURN_REMINDER', createdAt: { $gte: new Date(now.setHours(0,0,0,0)) } });
      if (exists) continue;

      await Notification.create({
        userId: booking.renterId,
        type: 'RETURN_REMINDER',
        message: `Return reminder: Please return the item by tomorrow.`,
        link: `/bookings/${booking._id}`,
        channels: ['in_app', 'email'],
      });
      logger.info(`returnReminders: reminder sent for booking ${booking.bookingCode}`);
    }
  } catch (err) {
    logger.error('returnReminders error:', err.message);
  }
};
