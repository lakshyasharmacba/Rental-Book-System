import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  eventId: { type: String, unique: true },
  type: String,
  payloadHash: String,
  processedAt: Date,
  status: { type: String, enum: ['processed', 'failed'], default: 'processed' },
}, { timestamps: true });
export default mongoose.model('WebhookEvent', schema);
