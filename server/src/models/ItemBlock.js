import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  startDate: Date,
  endDate: Date,
  reason: String,
}, { timestamps: true });
export default mongoose.model('ItemBlock', schema);
