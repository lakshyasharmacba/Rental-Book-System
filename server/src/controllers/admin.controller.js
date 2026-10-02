import User from '../models/User.js';
import Booking from '../models/Booking.js';
import Dispute from '../models/Dispute.js';
import Review from '../models/Review.js';
import Config from '../models/Config.js';
import LedgerEntry from '../models/LedgerEntry.js';
import AuditLog from '../models/AuditLog.js';
import Item from '../models/Item.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import LongTermRequest from '../models/LongTermRequest.js';

export const overview = asyncHandler(async (req, res) => {
  const [totalUsers, totalBookings, totalItems, activeDisputes] = await Promise.all([
    User.countDocuments({ status: { $ne: 'deleted' } }),
    Booking.countDocuments(),
    Item.countDocuments(),
    Dispute.countDocuments({ status: { $in: ['OPEN', 'UNDER_REVIEW', 'AWAITING_RENTER'] } }),
  ]);

  const overdueBookings = await Booking.countDocuments({ status: 'OVERDUE' });

  // Real revenue this month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  
  const revenueAgg = await LedgerEntry.aggregate([
    { $match: { type: 'FEE_EARNED', createdAt: { $gte: startOfMonth } } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);
  const revenueThisMonth = revenueAgg[0]?.total || 0;

  // Recent open disputes for attention feed
  const recentDisputes = await Dispute.find({ status: { $in: ['OPEN', 'UNDER_REVIEW', 'AWAITING_RENTER'] } })
    .populate('bookingId', 'bookingCode')
    .populate('raisedBy', 'name')
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  const disputesWithSLA = recentDisputes.map(d => ({
    id: d._id,
    bookingId: d.bookingId?.bookingCode || d.bookingId,
    claim: d.claimedAmount,
    status: d.status,
    raisedBy: d.raisedBy?.name || 'Unknown',
    sla: Math.floor((Date.now() - new Date(d.createdAt).getTime()) / (1000 * 60 * 60 * 24)),
    responseDeadline: d.responseDeadline,
  }));

  res.status(200).json({
    success: true,
    data: {
      totalUsers,
      totalBookings,
      totalItems,
      activeDisputes,
      openDisputes: activeDisputes,
      overdueBookings,
      revenueThisMonth,
      activeUsers: await User.countDocuments({ status: 'active' }),
      recentDisputes: disputesWithSLA,
    },
  });
});

export const getDashboardStats = overview;
export const getStats = overview;

export const getDisputes = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = {};
  if (status && status !== 'all') filter.status = status.toUpperCase();

  const disputes = await Dispute.find(filter)
    .populate('bookingId')
    .populate('raisedBy', 'name email')
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, count: disputes.length, data: disputes });
});

export const getBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find()
    .populate('itemId', 'title photos')
    .populate('renterId', 'name email')
    .populate('ownerId', 'name email')
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, count: bookings.length, data: bookings });
});

export const overrideBookingStatus = asyncHandler(async (req, res) => {
  const { status, reason } = req.body;
  const booking = await Booking.findByIdAndUpdate(
    req.params.id,
    { status: status?.toUpperCase() },
    { new: true }
  );

  await AuditLog.create({
    actorId: req.user._id,
    action: `OVERRIDE_STATUS_${status}`,
    entity: 'Booking',
    entityId: req.params.id,
    after: { status, reason },
  }).catch(() => {});

  res.status(200).json({ success: true, data: booking });
});

export const getUsers = asyncHandler(async (req, res) => {
  const { search } = req.query;
  const filter = {};
  if (search) {
    filter.$or = [
      { name: new RegExp(search, 'i') },
      { email: new RegExp(search, 'i') },
    ];
  }

  const users = await User.find(filter).select('-passwordHash').sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: users.length, data: users });
});

export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-passwordHash');
  res.status(200).json({ success: true, data: user });
});

export const blockUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  const newStatus = user.status === 'blocked' ? 'active' : 'blocked';
  user.status = newStatus;
  await user.save();
  res.status(200).json({ success: true, data: user, message: `User status changed to ${newStatus}` });
});

export const updateUserStatus = blockUser;

export const hideReview = asyncHandler(async (req, res) => {
  const review = await Review.findByIdAndUpdate(req.params.id, { hidden: true }, { new: true });
  res.status(200).json({ success: true, data: review });
});

export const getConfig = asyncHandler(async (req, res) => {
  const configs = await Config.find();
  const configMap = {};
  configs.forEach(c => { configMap[c.key] = c.value; });

  const defaults = {
    feePercent: 10,
    pickupWindowHours: 24,
    inspectionWindowHours: 48,
    disputeReplyHours: 72,
    gracePeriodDays: 2,
    maxRentalDays: 60,
    longTermThresholdDays: 31,
    fallbackCapPercent: 50,
  };

  res.status(200).json({ success: true, data: { ...defaults, ...configMap } });
});

export const updateConfig = asyncHandler(async (req, res) => {
  const updates = req.body;
  for (const [key, value] of Object.entries(updates)) {
    await Config.findOneAndUpdate({ key }, { value }, { upsert: true });
  }
  res.status(200).json({ success: true, message: 'Platform configuration updated' });
});

export const getLedger = asyncHandler(async (req, res) => {
  const entries = await LedgerEntry.find().sort({ createdAt: -1 }).limit(100);
  res.status(200).json({ success: true, count: entries.length, data: entries });
});

export const getPlatformReports = getLedger;

export const getAuditLog = asyncHandler(async (req, res) => {
  const logs = await AuditLog.find().populate('actorId', 'name email').sort({ createdAt: -1 }).limit(100);
  res.status(200).json({ success: true, count: logs.length, data: logs });
});

export const getSystemLogs = getAuditLog;

export const getLongTermRequests = asyncHandler(async (req, res) => {
  const requests = await LongTermRequest.find({ status: 'PENDING' })
    .populate('bookingDraft')
    .sort({ createdAt: -1 });
  res.status(200).json({ success: true, data: requests });
});

export const decideLongTermRequest = asyncHandler(async (req, res) => {
  const { status, reason } = req.body;
  const request = await LongTermRequest.findByIdAndUpdate(
    req.params.id,
    { status: status?.toUpperCase(), decidedBy: req.user._id, reason },
    { new: true }
  );
  await AuditLog.create({
    actorId: req.user._id,
    action: `LONG_TERM_REQUEST_${status}`,
    entity: 'LongTermRequest',
    entityId: req.params.id,
    after: { status, reason },
  }).catch(() => {});
  res.status(200).json({ success: true, data: request });
});
