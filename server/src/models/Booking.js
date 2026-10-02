import mongoose from 'mongoose';
const bookingSchema = new mongoose.Schema({
  bookingCode: { type: String, unique: true },
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  renterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  days: Number,
  status: {
    type: String,
    enum: ['PENDING_PAYMENT','CONFIRMED','EXPIRED','CANCELLED','ACTIVE','OVERDUE','RETURN_PENDING','LOST','COMPLETED','DISPUTED','RESOLVED','NO_SHOW'],
    default: 'PENDING_PAYMENT'
  },
  priceSnapshot: {
    rent: Number,
    fee: Number,
    deposit: Number,
    total: Number,
    feePercent: Number,
    durationFactor: Number,
    trustFactor: Number,
  },
  razorpayOrderId: String,
  razorpayPaymentId: String,
  pickupCodeHash: String,
  pickupAttempts: { type: Number, default: 0 },
  holdExpiresAt: Date,
  pickupWindowEnd: Date,
  returnMarkedAt: Date,
  inspectionDeadline: Date,
  cancelledBy: String,
  cancelReason: String,
  distanceKmAtBooking: Number,
}, { timestamps: true });
bookingSchema.index({ itemId: 1, startDate: 1, endDate: 1, status: 1 });
bookingSchema.index({ renterId: 1 });
bookingSchema.index({ ownerId: 1 });
export default mongoose.model('Booking', bookingSchema);
