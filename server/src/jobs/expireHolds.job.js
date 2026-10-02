import Booking from '../models/Booking.js';
import { logger } from '../utils/logger.js';

export const expireHolds = async () => {
  try {
    const result = await Booking.updateMany(
      { status: 'PENDING_PAYMENT', holdExpiresAt: { $lt: new Date() } },
      { $set: { status: 'EXPIRED' } }
    );
    if (result.modifiedCount > 0)
      logger.info(`expireHolds: expired ${result.modifiedCount} holds`);
  } catch (err) {
    logger.error('expireHolds error:', err.message);
  }
};
