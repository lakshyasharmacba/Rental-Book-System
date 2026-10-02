import mongoose from 'mongoose';
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  emailVerified: { type: Boolean, default: false },
  phone: { type: String, sparse: true, unique: true },
  phoneVerified: { type: Boolean, default: false },
  passwordHash: String,
  googleId: String,
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  photoUrl: String,
  city: String,
  bio: String,
  status: { type: String, enum: ['pending_verification', 'active', 'blocked', 'deleted'], default: 'pending_verification' },
  blockedReason: String,
  trustScore: { type: Number, default: 50 },
  completedRentals: { type: Number, default: 0 },
  ratingAvg: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },
}, { timestamps: true });
export default mongoose.model('User', userSchema);
