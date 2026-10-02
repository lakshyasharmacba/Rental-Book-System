import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  bookingDraft: mongoose.Schema.Types.Mixed,
  status: { type: String, enum: ['pending','approved','rejected'], default: 'pending' },
  decidedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });
export default mongoose.model('LongTermRequest', schema);
