import Dispute from '../models/Dispute.js';
import Booking from '../models/Booking.js';
import { addLedgerEntry } from './ledger.service.js';
import { safeRefund } from './refund.service.js';
import { applyTrustEvent } from './trust.service.js';
import { notifyUser } from './notification.service.js';
import User from '../models/User.js';

export const resolveDispute = async (disputeId, finalAmount, adminReason, adminId) => {
  const session = await Dispute.startSession();
  session.startTransaction();
  try {
    const dispute = await Dispute.findById(disputeId).session(session);
    const booking = await Booking.findById(dispute.bookingId).session(session);
    const depositHeld = booking.priceSnapshot.deposit;
    const ownerAmount = Math.min(finalAmount, depositHeld);
    const renterRefund = depositHeld - ownerAmount;

    dispute.finalAmount = ownerAmount;
    dispute.adminReason = adminReason;
    dispute.status = 'RESOLVED';
    dispute.resolvedBy = adminId;
    dispute.resolvedAt = new Date();
    await dispute.save({ session });

    booking.status = 'RESOLVED';
    await booking.save({ session });

    if (ownerAmount > 0) await addLedgerEntry({ bookingId: booking._id, type: 'DEPOSIT_DEDUCTED', amount: ownerAmount, direction: 'out', party: 'owner' }, session);
    if (renterRefund > 0) await addLedgerEntry({ bookingId: booking._id, type: 'DEPOSIT_REFUND_REQUESTED', amount: renterRefund, direction: 'out', party: 'renter' }, session);

    await session.commitTransaction();

    if (renterRefund > 0) await safeRefund(booking, 'dispute_renter_refund', renterRefund);

    const renter = await User.findById(booking.renterId);
    const owner = await User.findById(booking.ownerId);
    await notifyUser(renter, { type: 'DISPUTE_RESOLVED', message: `Dispute resolved. Refund: ₹${renterRefund/100}`, link: `/dispute/${dispute._id}` });
    await notifyUser(owner, { type: 'DISPUTE_RESOLVED', message: `Dispute resolved. You receive: ₹${ownerAmount/100}`, link: `/dispute/${dispute._id}` });

    if (finalAmount > 0) await applyTrustEvent(booking.renterId, booking._id, 'DAMAGE_CLAIM_UPHELD');
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

