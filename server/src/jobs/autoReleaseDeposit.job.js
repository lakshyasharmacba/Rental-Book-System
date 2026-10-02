import Booking from '../models/Booking.js';
import RefundRequest from '../models/RefundRequest.js';
import LedgerEntry from '../models/LedgerEntry.js';
import { logger } from '../utils/logger.js';
import { safeRefund } from '../services/refund.service.js';

export const autoReleaseDeposit = async () => {
  try {
    const now = new Date();
    const eligible = await Booking.find({
      status: 'RETURN_PENDING',
      inspectionDeadline: { $lt: now },
    });

    for (const booking of eligible) {
      try {
        const deposit = booking.priceSnapshot?.deposit || 0;
        const key = `${booking._id}:auto_deposit_release`;
        const exists = await RefundRequest.findOne({ idempotencyKey: key });
        if (exists) continue;

        if (deposit > 0) await safeRefund(booking, 'auto_deposit_release', deposit);

        await LedgerEntry.create({
          bookingId: booking._id,
          type: 'DEPOSIT_REFUND_REQUESTED',
          amount: deposit,
          direction: 'out',
          party: 'renter',
          idempotencyKey: `${key}:ledger`,
        }).catch(() => {});

        booking.status = 'COMPLETED';
        await booking.save();
        logger.info(`autoReleaseDeposit: deposit released for ${booking.bookingCode}`);
      } catch (e) {
        logger.error(`autoReleaseDeposit: failed for ${booking._id}:`, e.message);
      }
    }
  } catch (err) {
    logger.error('autoReleaseDeposit error:', err.message);
  }
};
