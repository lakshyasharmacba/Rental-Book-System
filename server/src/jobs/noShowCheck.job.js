import Booking from '../models/Booking.js';
import { logger } from '../utils/logger.js';

export const noShowCheck = async () => {
  try {
    const now = new Date();
    const noShows = await Booking.find({
      status: 'CONFIRMED',
      pickupWindowEnd: { $lt: now },
    });
    for (const booking of noShows) {
      booking.status = 'NO_SHOW';
      await booking.save();
      logger.info(`noShowCheck: booking ${booking.bookingCode} marked NO_SHOW`);
    }
  } catch (err) {
    logger.error('noShowCheck error:', err.message);
  }
};
