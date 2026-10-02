import { asyncHandler } from '../utils/asyncHandler.js';
import Dispute from '../models/Dispute.js';
import DisputeMessage from '../models/DisputeMessage.js';
import Booking from '../models/Booking.js';
import Checklist from '../models/Checklist.js';
import { resolveDispute } from '../services/dispute.service.js';
import { AppError } from '../utils/AppError.js';

export const createDispute = asyncHandler(async (req, res) => {
  const { bookingId, rentalId, reason, description, claimedAmount, photos } = req.body;
  const bId = bookingId || rentalId;
  const booking = await Booking.findById(bId);
  if (!booking) throw new AppError('NOT_FOUND', 'Booking not found', 404);

  const dispute = await Dispute.create({
    bookingId: booking._id,
    raisedBy: req.user._id,
    claimedAmount: claimedAmount || booking.priceSnapshot?.deposit || 10000,
    description: description || reason || 'Damage reported',
    photos: photos || [],
    status: 'OPEN',
    responseDeadline: new Date(Date.now() + 72 * 3600 * 1000),
  });

  booking.status = 'DISPUTED';
  await booking.save();

  res.status(201).json({ success: true, data: dispute, message: 'Dispute created' });
});

export const getDispute = asyncHandler(async (req, res) => {
  const dispute = await Dispute.findById(req.params.id)
    .populate('raisedBy', 'name email photoUrl')
    .populate('resolvedBy', 'name');

  if (!dispute) throw new AppError('NOT_FOUND', 'Dispute not found', 404);

  const booking = await Booking.findById(dispute.bookingId)
    .populate('itemId')
    .populate('renterId', 'name email phone photoUrl ratingAvg')
    .populate('ownerId', 'name email phone photoUrl ratingAvg');

  const checklists = await Checklist.find({ bookingId: dispute.bookingId });
  const messages = await DisputeMessage.find({ disputeId: dispute._id })
    .populate('senderId', 'name photoUrl')
    .sort({ createdAt: 1 });

  res.status(200).json({
    success: true,
    data: {
      ...dispute.toObject(),
      booking,
      checklists,
      messages,
    },
  });
});

export const getDisputeById = getDispute;

export const getMyDisputes = asyncHandler(async (req, res) => {
  const disputes = await Dispute.find()
    .populate('bookingId')
    .sort({ createdAt: -1 });
  res.status(200).json({ success: true, data: disputes });
});

export const getMessages = asyncHandler(async (req, res) => {
  const messages = await DisputeMessage.find({ disputeId: req.params.id || req.params.disputeId })
    .populate('senderId', 'name photoUrl')
    .sort({ createdAt: 1 });
  res.status(200).json({ success: true, data: messages });
});

export const postMessage = asyncHandler(async (req, res) => {
  const { text, message } = req.body;
  const disputeId = req.params.id || req.params.disputeId;

  const msg = await DisputeMessage.create({
    disputeId,
    senderId: req.user._id,
    senderRole: req.user.role === 'admin' ? 'admin' : 'renter',
    text: text || message || '',
    attachments: req.files?.map(f => f.path || f.url) || [],
  });

  const populated = await DisputeMessage.findById(msg._id).populate('senderId', 'name photoUrl');
  res.status(201).json({ success: true, data: populated });
});

export const addDisputeMessage = postMessage;

export const renterAction = asyncHandler(async (req, res) => {
  const { action, counterAmount } = req.body;
  const dispute = await Dispute.findById(req.params.id);
  if (!dispute) throw new AppError('NOT_FOUND', 'Dispute not found', 404);

  if (action === 'accept') {
    dispute.renterResponseType = 'ACCEPTED';
    dispute.status = 'UNDER_REVIEW';
  } else if (action === 'deny') {
    dispute.renterResponseType = 'DENIED';
    dispute.status = 'UNDER_REVIEW';
  } else if (action === 'counter') {
    dispute.renterResponseType = 'COUNTERED';
    dispute.counterAmount = counterAmount;
    dispute.status = 'UNDER_REVIEW';
  }
  await dispute.save();

  res.status(200).json({ success: true, data: dispute, message: 'Response recorded' });
});

export const respond = renterAction;

export const resolve = asyncHandler(async (req, res) => {
  const { finalAmount, adminReason, action } = req.body;
  const dispute = await Dispute.findById(req.params.id);
  if (!dispute) throw new AppError('NOT_FOUND', 'Dispute not found', 404);

  let amount = finalAmount;
  if (amount === undefined) {
    if (action === 'favor_owner') amount = dispute.claimedAmount;
    else if (action === 'favor_renter') amount = 0;
    else amount = Math.round((dispute.claimedAmount || 0) / 2);
  }

  await resolveDispute(dispute._id, amount, adminReason || `Resolved via ${action || 'admin decision'}`, req.user._id);

  const updated = await Dispute.findById(dispute._id);
  res.status(200).json({ success: true, data: updated, message: 'Dispute resolved successfully' });
});

export const resolveDisputeAction = resolve;
