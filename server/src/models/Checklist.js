import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  stage: { type: String, enum: ['pickup', 'return'] },
  photos: [String],
  notes: String,
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  renterConfirmedAt: Date,
  renterDisagreement: { reason: String, photo: String },
}, { timestamps: true });
export default mongoose.model('Checklist', schema);
