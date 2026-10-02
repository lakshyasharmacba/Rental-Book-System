import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
}, { timestamps: true });
schema.index({ userId: 1, itemId: 1 }, { unique: true });
export default mongoose.model('Favorite', schema);
