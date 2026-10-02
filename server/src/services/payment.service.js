import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import User from '../models/User.js';
import Item from '../models/Item.js';
import { addLedgerEntry } from './ledger.service.js';
import { notifyUser } from './notification.service.js';
import bcrypt from 'bcrypt';
import { generatePickupCode, generateToken } from '../utils/generateCode.js';
import { generateBookingCode } from './booking.service.js';
import { addHours } from '../utils/dateUtils.js';

export const handlePaymentCaptured = async (event) => {
  const paymentId = event.payload?.payment?.entity?.id;
  const orderId = event.payload?.payment?.entity?.order_id;
  const booking = await Booking.findOne({ razorpayOrderId: orderId });
  if (!booking || booking.status !== 'PENDING_PAYMENT') return;

  const pickupCode = generatePickupCode();
  const pickupCodeHash = await bcrypt.hash(pickupCode, 10);
  const bookingCode = await generateBookingCode();
  const item = await Item.findById(booking.itemId);

  booking.status = 'CONFIRMED';
  booking.razorpayPaymentId = paymentId;
  booking.pickupCodeHash = pickupCodeHash;
  booking.bookingCode = bookingCode;
  booking.pickupWindowEnd = addHours(booking.startDate, 24);
  await booking.save();

  const { rent, fee, deposit } = booking.priceSnapshot;
  await addLedgerEntry({ bookingId: booking._id, type: 'RENT_RECEIVED', amount: rent, direction: 'in', party: 'renter' });
  await addLedgerEntry({ bookingId: booking._id, type: 'FEE_EARNED', amount: fee, direction: 'in', party: 'platform' });
  await addLedgerEntry({ bookingId: booking._id, type: 'DEPOSIT_HELD', amount: deposit, direction: 'in', party: 'renter' });

  const renter = await User.findById(booking.renterId);
  const owner = await User.findById(booking.ownerId);
  
  if (renter) {
    await notifyUser(renter, {
      type: 'BOOKING_CONFIRMED',
      message: `Your booking for ${item?.title || 'an item'} is confirmed!`,
      link: `/bookings/${booking._id}`,
      channels: ['in_app', 'email'],
      subject: 'Booking Confirmed',
    });
  }
  if (owner) {
    await notifyUser(owner, {
      type: 'NEW_BOOKING',
      message: `You have a new booking for ${item?.title || 'an item'}!`,
      link: `/owner/bookings/${booking._id}`,
      channels: ['in_app', 'email'],
      subject: 'New Booking',
    });
  }

  return { booking, renter, owner, pickupCode };
};

