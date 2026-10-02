import express from 'express';
import * as ownerController from '../controllers/owner.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(authenticate);

router.get('/analytics', ownerController.analytics);
router.get('/stats', ownerController.analytics);
router.get('/dashboard', ownerController.getDashboardStats);
router.get('/items', ownerController.getOwnerItems);
router.get('/bookings', ownerController.getOwnerBookings);
router.get('/earnings', ownerController.getEarningsReport);
router.put('/settings', ownerController.updateSettings);

export default router;
