import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: String,
  message: String,
  link: String,
  channels: [String],
  readAt: Date,
}, { timestamps: true });
export default mongoose.model('Notification', schema);
