import Booking from '../models/Booking.js';
import LedgerEntry from '../models/LedgerEntry.js';
import { logger } from '../utils/logger.js';

export const overdueCheck = async () => {
  try {
    const now = new Date();

    // Mark ACTIVE bookings as OVERDUE
    const newOverdue = await Booking.updateMany(
      { status: 'ACTIVE', endDate: { $lt: now } },
      { $set: { status: 'OVERDUE' } }
    );
    if (newOverdue.modifiedCount > 0)
      logger.info(`overdueCheck: ${newOverdue.modifiedCount} bookings marked OVERDUE`);

    // Apply daily late fee to existing OVERDUE bookings
    const overdueBookings = await Booking.find({ status: 'OVERDUE' });
    for (const booking of overdueBookings) {
      const lateFee = Math.round(1.5 * booking.priceSnapshot.rent / booking.days);
      const key = `${booking._id}:LATE_FEE:${now.toISOString().slice(0, 10)}`;
      try {
        await LedgerEntry.create({
          bookingId: booking._id,
          type: 'LATE_FEE_DEDUCTED',
          amount: lateFee,
          direction: 'out',
          party: 'renter',
          idempotencyKey: key,
        });
        logger.info(`overdueCheck: late fee ₹${lateFee / 100} applied to ${booking.bookingCode}`);
      } catch (e) {
        if (e.code !== 11000) logger.error('Late fee ledger error:', e.message);
      }
    }
  } catch (err) {
    logger.error('overdueCheck error:', err.message);
  }
};
