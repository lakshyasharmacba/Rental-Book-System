import Dispute from '../models/Dispute.js';
import Notification from '../models/Notification.js';
import { logger } from '../utils/logger.js';

export const disputeDeadlines = async () => {
  try {
    const now = new Date();

    // 1. Auto-escalate: renter silent for 72h
    const escalate = await Dispute.find({
      status: 'OPEN',
      responseDeadline: { $lt: now },
      autoEscalated: false,
    });
    for (const dispute of escalate) {
      dispute.status = 'UNDER_REVIEW';
      dispute.autoEscalated = true;
      await dispute.save();
      await Notification.create({
        userId: dispute.raisedBy,
        type: 'DISPUTE_ESCALATED',
        message: 'Renter did not respond. Dispute escalated to admin.',
        link: `/dispute/${dispute._id}`,
        channels: ['in_app'],
      });
      logger.info(`disputeDeadlines: escalated dispute ${dispute._id}`);
    }

    // 2. Day-7 fallback: admin has not resolved
    const day7 = new Date(now.getTime() - 7 * 24 * 3600 * 1000);
    const fallback = await Dispute.find({
      status: 'UNDER_REVIEW',
      createdAt: { $lt: day7 },
    });
    for (const dispute of fallback) {
      const capAmount = Math.round((dispute.claimedAmount || 0) * 0.5);
      dispute.finalAmount = capAmount;
      dispute.adminReason = 'Auto-resolved after 7-day admin SLA (50% cap applied).';
      dispute.status = 'RESOLVED';
      dispute.resolvedAt = now;
      await dispute.save();
      logger.info(`disputeDeadlines: day-7 fallback resolved dispute ${dispute._id} at ₹${capAmount / 100}`);
    }
  } catch (err) {
    logger.error('disputeDeadlines error:', err.message);
  }
};
