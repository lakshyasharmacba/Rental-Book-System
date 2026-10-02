import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  disputeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Dispute', required: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  senderRole: { type: String, enum: ['owner', 'renter', 'admin'] },
  text: String,
  attachments: [String],
}, { timestamps: true });
export default mongoose.model('DisputeMessage', schema);
