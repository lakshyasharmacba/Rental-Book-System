import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  purpose: String,
  amount: Number,
  idempotencyKey: { type: String, unique: true },
  razorpayRefundId: String,
  status: { type: String, enum: ['PENDING','REQUESTED','REFUNDED','FAILED'], default: 'PENDING' },
  attempts: { type: Number, default: 0 },
}, { timestamps: true });
export default mongoose.model('RefundRequest', schema);
