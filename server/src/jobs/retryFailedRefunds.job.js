import RefundRequest from '../models/RefundRequest.js';
import Booking from '../models/Booking.js';
import { razorpay } from '../config/razorpay.js';
import { logger } from '../utils/logger.js';

export const retryFailedRefunds = async () => {
  try {
    const failed = await RefundRequest.find({ status: 'FAILED', attempts: { $lt: 3 } });

    for (const req of failed) {
      try {
        const booking = await Booking.findById(req.bookingId);
        if (!booking?.razorpayPaymentId) continue;

        const r = await razorpay.payments.refund(booking.razorpayPaymentId, {
          amount: req.amount,
          notes: { booking: booking.bookingCode, purpose: req.purpose },
        });

        req.razorpayRefundId = r.id;
        req.status = 'REQUESTED';
        req.attempts += 1;
        await req.save();
        logger.info(`retryFailedRefunds: retried refund for ${booking.bookingCode}`);
      } catch (e) {
        req.attempts += 1;
        await req.save();
        logger.error(`retryFailedRefunds: attempt ${req.attempts} failed for ${req._id}:`, e.message);
      }
    }
  } catch (err) {
    logger.error('retryFailedRefunds error:', err.message);
  }
};
