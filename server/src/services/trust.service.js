import User from '../models/User.js';
import TrustEvent from '../models/TrustEvent.js';

const TRUST_EVENTS = {
  CLEAN_RETURN: 5,
  LATE_RETURN: -15,
  DAMAGE_CLAIM_UPHELD: -30,
  NON_RETURN: -40,
  RENTER_CANCELLED: -10,
  NO_SHOW: -10,
};

export const applyTrustEvent = async (userId, bookingId, type) => {
  const delta = TRUST_EVENTS[type] || 0;
  const user = await User.findByIdAndUpdate(
    userId,
    { $inc: { trustScore: delta } },
    { new: true }
  );
  const scoreAfter = Math.max(0, Math.min(100, user.trustScore));
  await User.findByIdAndUpdate(userId, { trustScore: scoreAfter });
  await TrustEvent.create({ userId, bookingId, type, delta, scoreAfter });
  return scoreAfter;
};

