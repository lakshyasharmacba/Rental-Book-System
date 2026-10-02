import { asyncHandler } from '../utils/asyncHandler.js';
import Review from '../models/Review.js';
import Booking from '../models/Booking.js';
import User from '../models/User.js';
import { AppError } from '../utils/AppError.js';

export const createReview = asyncHandler(async (req, res) => {
  const { bookingId, rating, comment, tags, targetRole } = req.body;
  const booking = await Booking.findById(bookingId);
  if (!booking) throw new AppError('NOT_FOUND', 'Booking not found', 404);

  const isRenter = booking.renterId.toString() === req.user._id.toString();
  const targetId = isRenter ? booking.ownerId : booking.renterId;
  const role = targetRole || (isRenter ? 'owner' : 'renter');

  const review = await Review.create({
    bookingId: booking._id,
    authorId: req.user._id,
    targetId,
    targetRole: role,
    rating: Number(rating) || 5,
    comment,
    tags: tags || [],
    visibleAt: new Date(),
  });

  // Update target user's rating
  const allReviews = await Review.find({ targetId, hidden: false });
  const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
  await User.findByIdAndUpdate(targetId, { ratingAvg: Math.round(avg * 10) / 10, ratingCount: allReviews.length });

  res.status(201).json({ success: true, data: review, message: 'Review submitted' });
});

export const getReviews = asyncHandler(async (req, res) => {
  const { targetId, itemId } = req.query;
  const filter = { hidden: false };
  if (targetId) filter.targetId = targetId;

  const reviews = await Review.find(filter)
    .populate('authorId', 'name photoUrl')
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, count: reviews.length, data: reviews });
});

export const getReviewById = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id).populate('authorId', 'name photoUrl');
  if (!review) throw new AppError('NOT_FOUND', 'Review not found', 404);
  res.status(200).json({ success: true, data: review });
});

export const updateReview = asyncHandler(async (req, res) => {
  const review = await Review.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.status(200).json({ success: true, data: review });
});

export const deleteReview = asyncHandler(async (req, res) => {
  await Review.findByIdAndDelete(req.params.id);
  res.status(200).json({ success: true, message: 'Review deleted' });
});

export const reportReview = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, message: 'Review reported' });
});
