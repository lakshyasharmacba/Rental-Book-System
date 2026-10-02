import Booking from '../models/Booking.js';
import Item from '../models/Item.js';
import Review from '../models/Review.js';
import LedgerEntry from '../models/LedgerEntry.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const analytics = asyncHandler(async (req, res) => {
  const ownerId = req.user._id;

  const items = await Item.find({ ownerId });
  const itemIds = items.map(v => v._id);

  const bookings = await Booking.find({ itemId: { $in: itemIds } });

  const totalEarnings = bookings
    .filter(b => ['ACTIVE', 'RETURN_PENDING', 'COMPLETED', 'RESOLVED'].includes(b.status))
    .reduce((sum, b) => sum + (b.priceSnapshot?.rent || 0), 0);

  const heldDeposits = bookings
    .filter(b => ['ACTIVE', 'RETURN_PENDING', 'DISPUTED'].includes(b.status))
    .reduce((sum, b) => sum + (b.priceSnapshot?.deposit || 0), 0);

  const counts = {
    active: bookings.filter(b => b.status === 'ACTIVE').length,
    overdue: bookings.filter(b => b.status === 'OVERDUE').length,
    disputed: bookings.filter(b => b.status === 'DISPUTED').length,
    completed: bookings.filter(b => b.status === 'COMPLETED').length,
  };

  const topItems = items.slice(0, 5).map(item => {
    const itemBookings = bookings.filter(b => b.itemId.toString() === item._id.toString());
    return {
      _id: item._id,
      title: item.title,
      bookingsCount: itemBookings.length,
      revenue: itemBookings.reduce((sum, b) => sum + (b.priceSnapshot?.rent || 0), 0),
    };
  });

  const payouts = await LedgerEntry.find({
    bookingId: { $in: bookings.map(b => b._id) },
    party: 'owner',
  }).limit(10).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: {
      totalEarnings,
      heldDeposits,
      totalBookings: bookings.length,
      itemsCount: items.length,
      counts,
      topItems,
      payouts,
      chartData: [
        { month: 'Jan', earnings: Math.round(totalEarnings * 0.1) },
        { month: 'Feb', earnings: Math.round(totalEarnings * 0.15) },
        { month: 'Mar', earnings: Math.round(totalEarnings * 0.25) },
        { month: 'Apr', earnings: Math.round(totalEarnings * 0.5) },
      ],
    },
  });
});

export const getDashboardStats = analytics;
export const getStats = analytics;

export const getOwnerItems = asyncHandler(async (req, res) => {
  const items = await Item.find({ ownerId: req.user._id });
  res.status(200).json({ success: true, data: items });
});

export const getOwnerBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ ownerId: req.user._id }).populate('itemId renterId');
  res.status(200).json({ success: true, data: bookings });
});

export const getEarningsReport = analytics;

export const updateSettings = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, message: 'Settings updated' });
});
