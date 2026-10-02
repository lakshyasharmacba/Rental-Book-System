import mongoose from 'mongoose';
const otpSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  target: String,
  channel: { type: String, enum: ['email', 'phone'] },
  codeHash: String,
  expiresAt: Date,
  attempts: { type: Number, default: 0 },
  usedAt: Date,
}, { timestamps: true });
export default mongoose.model('OtpCode', otpSchema);
