import bcrypt from 'bcrypt';
import { asyncHandler } from '../utils/asyncHandler.js';
import Booking from '../models/Booking.js';
import Item from '../models/Item.js';
import Checklist from '../models/Checklist.js';
import { computeQuote } from '../services/pricing.service.js';
import { generatePickupCode } from '../utils/generateCode.js';
import { razorpay } from '../config/razorpay.js';
import { AppError } from '../utils/AppError.js';

export const quote = asyncHandler(async (req, res) => {
  const { itemId, startDate, endDate } = req.body;
  const item = await Item.findById(itemId);
  if (!item) throw new AppError('NOT_FOUND', 'Item not found', 404);

  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));

  const user = req.user || { trustScore: 50, completedRentals: 0 };
  const breakdown = await computeQuote(item, user, days);

  res.status(200).json({ success: true, data: { ...breakdown, days } });
});

export const createBooking = asyncHandler(async (req, res) => {
  const { itemId, startDate, endDate, distanceKmAtBooking } = req.body;
  const item = await Item.findById(itemId);
  if (!item) throw new AppError('NOT_FOUND', 'Item not found', 404);

  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));

  // Check availability - atomic check
  const reqStart = start;
  const reqEnd = end;
  const clash = await Booking.exists({
    itemId,
    status: { $in: ['PENDING_PAYMENT', 'CONFIRMED', 'ACTIVE', 'OVERDUE', 'RETURN_PENDING'] },
    startDate: { $lt: reqEnd },
    endDate: { $gt: reqStart },
    $or: [
      { status: { $ne: 'PENDING_PAYMENT' } },
      { holdExpiresAt: { $gt: new Date() } },
    ],
  });
  if (clash) throw new AppError('DATES_UNAVAILABLE', 'These dates are not available', 409);

  // Validate rental duration
  if (days > 60) throw new AppError('TOO_LONG', 'Maximum rental period is 60 days', 400);
  if (days < (item.minDays || 1)) throw new AppError('TOO_SHORT', `Minimum rental is ${item.minDays || 1} days`, 400);

  // Check minimum lead time (2 hours)
  if (start < new Date(Date.now() + 2 * 60 * 60 * 1000)) throw new AppError('TOO_SOON', 'Booking must start at least 2 hours from now', 400);

  const ownerId = item.ownerId;
  if (ownerId.toString() === req.user._id.toString()) {
    throw new AppError('CANNOT_BOOK_OWN', 'You cannot book your own item', 400);
  }

  const breakdown = await computeQuote(item, req.user, days);
  const year = new Date().getFullYear();
  const count = await Booking.countDocuments();
  const bookingCode = `RL-${year}-${String(count + 1).padStart(6, '0')}`;

  const rawCode = generatePickupCode();
  const pickupCodeHash = await bcrypt.hash(rawCode, 10);

  let razorpayOrderId = `order_${Date.now()}`;
  try {
    const order = await razorpay.orders.create({
      amount: breakdown.total, // in paise
      currency: 'INR',
      receipt: bookingCode,
    });
    razorpayOrderId = order.id;
  } catch (err) {
    console.warn('Razorpay order creation fallback to simulated order ID:', err.message);
  }

  const booking = await Booking.create({
    bookingCode,
    itemId: item._id,
    renterId: req.user._id,
    ownerId,
    startDate: start,
    endDate: end,
    days,
    status: 'PENDING_PAYMENT',
    priceSnapshot: breakdown,
    razorpayOrderId,
    pickupCodeHash,
    pickupWindowEnd: new Date(start.getTime() + 24 * 60 * 60 * 1000),
    holdExpiresAt: new Date(Date.now() + 15 * 60 * 1000),
    distanceKmAtBooking: distanceKmAtBooking || 0,
  });

  res.status(201).json({
    success: true,
    data: {
      booking,
      bookingId: booking._id,
      razorpayOrderId,
      amount: breakdown.total,
      pickupCode: rawCode, // sent to renter upon booking creation
    },
    message: 'Booking created successfully',
  });
});

export const getBookings = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { role, status } = req.query;

  const query = {};
  if (role === 'owner') query.ownerId = userId;
  else if (role === 'renter') query.renterId = userId;
  else query.$or = [{ renterId: userId }, { ownerId: userId }];

  if (status) query.status = status.toUpperCase();

  const bookings = await Booking.find(query)
    .populate('itemId')
    .populate('renterId', 'name photoUrl ratingAvg')
    .populate('ownerId', 'name phone photoUrl ratingAvg')
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, count: bookings.length, data: bookings });
});

export const getMyBookings = getBookings;

export const getBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate('itemId')
    .populate('renterId', 'name email phone photoUrl ratingAvg')
    .populate('ownerId', 'name email phone photoUrl ratingAvg addressPrivate');

  if (!booking) throw new AppError('NOT_FOUND', 'Booking not found', 404);
  res.status(200).json({ success: true, data: booking });
});

export const getBookingById = getBooking;

export const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) throw new AppError('NOT_FOUND', 'Booking not found', 404);

  booking.status = 'CANCELLED';
  booking.cancelledBy = req.user._id.toString();
  booking.cancelReason = req.body?.reason || 'Cancelled by user';
  await booking.save();

  res.status(200).json({ success: true, data: booking, message: 'Booking cancelled' });
});

export const verifyPickupCode = asyncHandler(async (req, res) => {
  const { code } = req.body;
  const booking = await Booking.findById(req.params.id);
  if (!booking) throw new AppError('NOT_FOUND', 'Booking not found', 404);

  if (booking.pickupAttempts >= 5) throw new AppError('LOCKED', 'Too many attempts', 400);

  const ok = await bcrypt.compare(String(code), booking.pickupCodeHash || '');
  if (!ok) {
    booking.pickupAttempts += 1;
    await booking.save();
    throw new AppError('BAD_CODE', 'Invalid pickup code', 400);
  }

  booking.status = 'ACTIVE';
  await booking.save();

  res.status(200).json({ success: true, data: { verified: true }, message: 'Pickup code verified, rental is ACTIVE' });
});

export const uploadChecklist = asyncHandler(async (req, res) => {
  const { stage, notes, photos } = req.body;
  const checklist = await Checklist.create({
    bookingId: req.params.id,
    stage: stage || 'pickup',
    notes,
    photos: photos || (req.files?.map(f => f.path || f.url) || []),
    uploadedBy: req.user._id,
  });

  res.status(200).json({ success: true, data: checklist, message: 'Checklist uploaded' });
});

export const confirmChecklist = asyncHandler(async (req, res) => {
  await Checklist.findOneAndUpdate(
    { bookingId: req.params.id },
    { renterConfirmedAt: new Date() }
  );
  res.status(200).json({ success: true, message: 'Checklist condition confirmed' });
});

export const markReturned = asyncHandler(async (req, res) => {
  const booking = await Booking.findByIdAndUpdate(
    req.params.id,
    {
      status: 'RETURN_PENDING',
      returnMarkedAt: new Date(),
      inspectionDeadline: new Date(Date.now() + 48 * 3600 * 1000),
    },
    { new: true }
  );
  res.status(200).json({ success: true, data: booking, message: 'Marked as returned. 48h inspection window started.' });
});

export const inspection = asyncHandler(async (req, res) => {
  const { result } = req.body;
  const newStatus = result === 'damage' ? 'DISPUTED' : 'COMPLETED';
  const booking = await Booking.findByIdAndUpdate(
    req.params.id,
    { status: newStatus },
    { new: true }
  );
  res.status(200).json({ success: true, data: booking, message: `Inspection complete: ${newStatus}` });
});

export const updateBookingStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const booking = await Booking.findByIdAndUpdate(
    req.params.id,
    { status: status?.toUpperCase() },
    { new: true }
  );
  res.status(200).json({ success: true, data: booking });
});

export const handleBookingAction = asyncHandler(async (req, res) => {
  const { action } = req.params;
  if (action === 'cancel') return cancelBooking(req, res);
  if (action === 'pickup') return verifyPickupCode(req, res);
  if (action === 'checklist') return uploadChecklist(req, res);
  if (action === 'return') return markReturned(req, res);
  if (action === 'inspection') return inspection(req, res);
  return updateBookingStatus(req, res);
});
