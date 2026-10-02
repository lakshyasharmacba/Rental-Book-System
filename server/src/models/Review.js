import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetRole: { type: String, enum: ['owner', 'renter'] },
  rating: { type: Number, min: 1, max: 5 },
  tags: [String],
  comment: { type: String, maxlength: 500 },
  visibleAt: Date,
  hidden: { type: Boolean, default: false },
}, { timestamps: true });
schema.index({ bookingId: 1, authorId: 1 }, { unique: true });
export default mongoose.model('Review', schema);
