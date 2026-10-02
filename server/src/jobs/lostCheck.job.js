import Booking from '../models/Booking.js';
import User from '../models/User.js';
import LedgerEntry from '../models/LedgerEntry.js';
import { logger } from '../utils/logger.js';
import { applyTrustEvent } from '../services/trust.service.js';

export const lostCheck = async () => {
  try {
    const graceDeadline = new Date(Date.now() - 2 * 24 * 3600 * 1000); // 2 days ago
    const lost = await Booking.find({
      status: 'OVERDUE',
      endDate: { $lt: graceDeadline },
    });

    for (const booking of lost) {
      try {
        const deposit = booking.priceSnapshot?.deposit || 0;
        const key = `${booking._id}:DEPOSIT_FORFEITED`;
        await LedgerEntry.create({
          bookingId: booking._id,
          type: 'DEPOSIT_FORFEITED',
          amount: deposit,
          direction: 'out',
          party: 'owner',
          idempotencyKey: key,
        }).catch(() => {});

        booking.status = 'LOST';
        await booking.save();

        await User.findByIdAndUpdate(booking.renterId, { status: 'blocked', blockedReason: 'Non-return of rented item' });
        await applyTrustEvent(booking.renterId, booking._id, 'NON_RETURN');

        logger.info(`lostCheck: booking ${booking.bookingCode} marked LOST, renter blocked`);
      } catch (e) {
        logger.error(`lostCheck: failed for ${booking._id}:`, e.message);
      }
    }
  } catch (err) {
    logger.error('lostCheck error:', err.message);
  }
};
