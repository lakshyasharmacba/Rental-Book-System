import Review from '../models/Review.js';
import { logger } from '../utils/logger.js';

export const reviewWindow = async () => {
  try {
    const now = new Date();

    // Reveal reviews whose visibleAt has passed
    const result = await Review.updateMany(
      { visibleAt: { $lte: now }, hidden: false },
      { $set: { visibleAt: now } } // no-op but confirms they're visible
    );

    if (result.modifiedCount > 0)
      logger.info(`reviewWindow: ${result.modifiedCount} reviews now visible`);
  } catch (err) {
    logger.error('reviewWindow error:', err.message);
  }
};
