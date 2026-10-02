import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  raisedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  claimedAmount: Number,
  finalAmount: Number,
  adminReason: String,
  status: { type: String, enum: ['OPEN','AWAITING_RENTER','UNDER_REVIEW','RESOLVED','AUTO_ESCALATED'], default: 'OPEN' },
  responseDeadline: Date,
  renterResponseType: { type: String, enum: ['ACCEPTED','DENIED','COUNTERED'] },
  counterAmount: Number,
  autoEscalated: { type: Boolean, default: false },
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  resolvedAt: Date,
  photos: [String],
  description: String,
}, { timestamps: true });
export default mongoose.model('Dispute', schema);
