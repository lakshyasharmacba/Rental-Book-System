import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  type: {
    type: String,
    enum: ['RENT_RECEIVED','FEE_EARNED','DEPOSIT_HELD','LATE_FEE_DEDUCTED','DEPOSIT_DEDUCTED','DEPOSIT_FORFEITED','DEPOSIT_REFUND_REQUESTED','DEPOSIT_REFUNDED','RENT_REFUND_REQUESTED','RENT_REFUNDED','OWNER_PAYOUT_PENDING','OWNER_PAYOUT_PAID'],
    required: true
  },
  amount: { type: Number, required: true },
  direction: { type: String, enum: ['in', 'out'] },
  party: String,
  refs: mongoose.Schema.Types.Mixed,
  idempotencyKey: { type: String, unique: true },
}, { timestamps: true });
export default mongoose.model('LedgerEntry', schema);
