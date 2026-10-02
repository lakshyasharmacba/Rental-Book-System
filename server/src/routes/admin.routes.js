import express from 'express';
import * as adminController from '../controllers/admin.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(authenticate);

router.get('/overview', adminController.overview);
router.get('/dashboard', adminController.overview);
router.get('/stats', adminController.overview);
router.get('/disputes', adminController.getDisputes);
router.get('/bookings', adminController.getBookings);
router.patch('/bookings/:id/status', adminController.overrideBookingStatus);
router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUserById);
router.patch('/users/:id/block', adminController.blockUser);
router.put('/users/:id/status', adminController.blockUser);
router.patch('/reviews/:id/hide', adminController.hideReview);
router.get('/config', adminController.getConfig);
router.patch('/config', adminController.updateConfig);
router.put('/config', adminController.updateConfig);
router.get('/ledger', adminController.getLedger);
router.get('/reports', adminController.getLedger);
router.get('/audit', adminController.getAuditLog);
router.get('/system-logs', adminController.getAuditLog);

export default router;
