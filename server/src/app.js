import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { generalLimiter } from './middleware/rateLimit.middleware.js';
import { errorHandler } from './middleware/errors.middleware.js';
import { env } from './config/env.js';

import authRoutes from './routes/auth.routes.js';
import itemRoutes from './routes/items.routes.js';
import bookingRoutes from './routes/bookings.routes.js';
import paymentRoutes from './routes/payments.routes.js';
import disputeRoutes from './routes/disputes.routes.js';
import reviewRoutes from './routes/reviews.routes.js';
import notificationRoutes from './routes/notifications.routes.js';
import ownerRoutes from './routes/owner.routes.js';
import adminRoutes from './routes/admin.routes.js';
import webhookRoutes from './routes/webhooks.routes.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(generalLimiter);

app.use('/api/v1/webhooks', express.raw({ type: 'application/json' }), webhookRoutes);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/items', itemRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/disputes', disputeRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/owner', ownerRoutes);
app.use('/api/v1/admin', adminRoutes);

app.use(errorHandler);
export default app;
