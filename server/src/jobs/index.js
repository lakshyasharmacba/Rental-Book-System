import cron from 'node-cron';
import { logger } from '../utils/logger.js';

import { expireHolds } from './expireHolds.job.js';
import { reconcilePayments } from './reconcilePayments.job.js';
import { noShowCheck } from './noShowCheck.job.js';
import { returnReminders } from './returnReminders.job.js';
import { overdueCheck } from './overdueCheck.job.js';
import { lostCheck } from './lostCheck.job.js';
import { autoReleaseDeposit } from './autoReleaseDeposit.job.js';
import { disputeDeadlines } from './disputeDeadlines.job.js';
import { reviewWindow } from './reviewWindow.job.js';
import { retryFailedRefunds } from './retryFailedRefunds.job.js';

export const startJobs = () => {
    logger.info('Starting background jobs...');

    // Run every 15 minutes
    cron.schedule('*/15 * * * *', expireHolds);
    
    // Run every hour
    cron.schedule('0 * * * *', reconcilePayments);
    cron.schedule('0 * * * *', noShowCheck);
    cron.schedule('0 * * * *', overdueCheck);
    
    // Run daily at midnight
    cron.schedule('0 0 * * *', returnReminders);
    cron.schedule('0 0 * * *', lostCheck);
    cron.schedule('0 0 * * *', autoReleaseDeposit);
    cron.schedule('0 0 * * *', disputeDeadlines);
    cron.schedule('0 0 * * *', reviewWindow);
    cron.schedule('0 0 * * *', retryFailedRefunds);
    
    logger.info('Background jobs scheduled successfully.');
};
