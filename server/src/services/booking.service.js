import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import { AppError } from '../utils/AppError.js';
import { diffDays, addHours } from '../utils/dateUtils.js';

export const checkAvailability = async (itemId, startDate, endDate, session, excludeBookingId = null) => {
  const reqStart = new Date(startDate);
  const reqEnd = new Date(endDate);
  const query = {
    itemId,
    status: { $in: ['PENDING_PAYMENT','CONFIRMED','ACTIVE','OVERDUE','RETURN_PENDING'] },
    startDate: { $lt: reqEnd },
    endDate: { $gt: reqStart },
    $or: [
      { status: { $ne: 'PENDING_PAYMENT' } },
      { holdExpiresAt: { $gt: new Date() } }
    ]
  };
  if (excludeBookingId) query._id = { $ne: excludeBookingId };
  const clash = await Booking.exists(query).session(session);
  if (clash) throw new AppError('DATES_UNAVAILABLE', 'Those dates are not available', 409);
};

export const generateBookingCode = async () => {
  const year = new Date().getFullYear();
  const count = await Booking.countDocuments();
  return `RL-${year}-${String(count + 1).padStart(6, '0')}`;
};

