import mongoose from 'mongoose';
const itemSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  category: String,
  brand: String,
  model: String,
  description: String,
  photos: [String],
  itemValue: Number,
  pricePerDay: { type: Number, required: true },
  baseDeposit: { type: Number, required: true },
  pickupHours: { start: String, end: String },
  minDays: { type: Number, default: 1 },
  maxDays: { type: Number, default: 60 },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: [Number],
  },
  publicLocationOffset: { type: [Number], default: [0, 0] },
  addressPrivate: String,
  city: String,
  status: { type: String, enum: ['draft', 'active', 'paused', 'blocked_by_admin'], default: 'draft' },
  ratingAvg: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },
}, { timestamps: true });
itemSchema.index({ location: '2dsphere' });
itemSchema.index({ city: 1, status: 1 });
export default mongoose.model('Item', itemSchema);
