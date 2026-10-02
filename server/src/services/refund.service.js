import RefundRequest from '../models/RefundRequest.js';
import { razorpay } from '../config/razorpay.js';

export const safeRefund = async (booking, purpose, amount) => {
  const key = `${booking._id}:${purpose}`;
  let row;
  try {
    row = await RefundRequest.create({ bookingId: booking._id, purpose, amount, idempotencyKey: key });
  } catch (e) {
    if (e.code === 11000) {
      row = await RefundRequest.findOne({ idempotencyKey: key });
      if (row?.razorpayRefundId) return row;
    } else throw e;
  }
  const r = await razorpay.payments.refund(booking.razorpayPaymentId, {
    amount,
    notes: { booking: booking.bookingCode, purpose },
  });
  row.razorpayRefundId = r.id;
  row.status = 'REQUESTED';
  await row.save();
  return row;
};

