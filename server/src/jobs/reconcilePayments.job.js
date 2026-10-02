import Booking from '../models/Booking.js';
import { razorpay } from '../config/razorpay.js';
import { logger } from '../utils/logger.js';

export const reconcilePayments = async () => {
  try {
    const now = new Date();
    const stuck = await Booking.find({
      status: 'PENDING_PAYMENT',
      razorpayOrderId: { $exists: true, $ne: null },
      holdExpiresAt: { $gt: now },
    });

    for (const booking of stuck) {
      try {
        const order = await razorpay.orders.fetch(booking.razorpayOrderId);
        if (order.status === 'paid') {
          logger.info(`reconcilePayments: order ${booking.razorpayOrderId} already paid — webhook may have been missed`);
          // Webhook will handle actual state change; just log for now
        } else if (order.status === 'expired') {
          booking.status = 'EXPIRED';
          await booking.save();
          logger.info(`reconcilePayments: expired booking ${booking.bookingCode}`);
        }
      } catch (e) {
        logger.error(`reconcilePayments: failed for booking ${booking._id}:`, e.message);
      }
    }
  } catch (err) {
    logger.error('reconcilePayments error:', err.message);
  }
};
