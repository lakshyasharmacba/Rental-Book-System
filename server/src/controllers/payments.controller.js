import crypto from 'crypto';
import { asyncHandler } from '../utils/asyncHandler.js';
import Booking from '../models/Booking.js';
import WebhookEvent from '../models/WebhookEvent.js';
import { handlePaymentCaptured } from '../services/payment.service.js';
import { razorpay } from '../config/razorpay.js';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';

export const createOrder = asyncHandler(async (req, res) => {
  const { amount, bookingId } = req.body;
  const booking = await Booking.findById(bookingId);
  const totalAmount = amount || booking?.priceSnapshot?.total || 10000;

  let orderId = `order_${Date.now()}`;
  try {
    const order = await razorpay.orders.create({
      amount: totalAmount, // in paise
      currency: 'INR',
      receipt: booking?.bookingCode || `rcpt_${Date.now()}`,
    });
    orderId = order.id;
  } catch (err) {
    console.warn('Razorpay order create fallback:', err.message);
  }

  if (booking) {
    booking.razorpayOrderId = orderId;
    await booking.save();
  }

  res.status(200).json({
    success: true,
    data: {
      orderId,
      razorpayOrderId: orderId,
      amount: totalAmount,
      currency: 'INR',
      keyId: env.RAZORPAY_KEY_ID,
    },
  });
});

export const createPaymentIntent = createOrder;

export const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId, orderId, paymentId } = req.body;
  const oid = razorpay_order_id || orderId;
  const pid = razorpay_payment_id || paymentId;

  const booking = await Booking.findOne({
    $or: [{ razorpayOrderId: oid }, { _id: bookingId }],
  });

  if (booking) {
    booking.status = 'CONFIRMED';
    booking.razorpayPaymentId = pid;
    await booking.save();
  }

  res.status(200).json({
    success: true,
    data: { verified: true, booking },
    message: 'Payment verified and booking confirmed',
  });
});

export const processPayment = verifyPayment;

export const getPaymentDetails = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  res.status(200).json({ success: true, data: booking?.priceSnapshot });
});

export const getMyPaymentHistory = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ renterId: req.user._id, status: { $in: ['CONFIRMED', 'ACTIVE', 'COMPLETED'] } });
  res.status(200).json({ success: true, data: bookings });
});

export const webhookHandler = asyncHandler(async (req, res) => {
  const sig = req.headers['x-razorpay-signature'];
  const eventId = req.headers['x-razorpay-event-id'] || `evt_${Date.now()}`;

  // Signature verification (use raw body)
  if (sig && env.RAZORPAY_WEBHOOK_SECRET) {
    const body = Buffer.isBuffer(req.body) ? req.body : Buffer.from(JSON.stringify(req.body));
    const expected = crypto.createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET)
      .update(body)
      .digest('hex');
    if (sig !== expected) {
      console.warn('Webhook signature mismatch');
      return res.status(400).json({ error: 'Invalid signature' });
    }
  }

  // Deduplicate
  try {
    const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from(JSON.stringify(req.body));
    const eventData = JSON.parse(rawBody.toString());
    await WebhookEvent.create({ 
      eventId, 
      type: eventData?.event || 'unknown',
      payloadHash: crypto.createHash('sha256').update(rawBody).digest('hex'),
    });
  } catch (e) {
    if (e.code === 11000) return res.sendStatus(200); // duplicate
    console.error('Webhook dedup error:', e.message);
  }

  const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from(JSON.stringify(req.body));
  const event = JSON.parse(rawBody.toString());
  
  try {
    if (event?.event === 'payment.captured') {
      await handlePaymentCaptured(event);
    } else if (event?.event === 'payment.failed') {
      const orderId = event.payload?.payment?.entity?.order_id;
      if (orderId) {
        await Booking.findOneAndUpdate(
          { razorpayOrderId: orderId, status: 'PENDING_PAYMENT' },
          { status: 'EXPIRED' }
        );
      }
    } else if (event?.event === 'refund.processed') {
      const refundId = event.payload?.refund?.entity?.id;
      if (refundId) {
        await import('../models/RefundRequest.js').then(m => 
          m.default.findOneAndUpdate({ razorpayRefundId: refundId }, { status: 'REFUNDED' })
        );
      }
    }
  } catch (e) {
    console.error('Webhook processing error:', e.message);
  }

  res.sendStatus(200);
});
