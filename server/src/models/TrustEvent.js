import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  type: String,
  delta: Number,
  scoreAfter: Number,
}, { timestamps: true });
export default mongoose.model('TrustEvent', schema);
