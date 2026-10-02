import express from 'express';
import * as bookingsController from '../controllers/bookings.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(authenticate);

router.post('/quote', bookingsController.quote);
router.get('/', bookingsController.getBookings);
router.post('/', bookingsController.createBooking);
router.get('/:id', bookingsController.getBooking);
router.delete('/:id', bookingsController.cancelBooking);
router.post('/:id/cancel', bookingsController.cancelBooking);
router.post('/:id/pickup', bookingsController.verifyPickupCode);
router.post('/:id/checklist', bookingsController.uploadChecklist);
router.post('/:id/checklist/confirm', bookingsController.confirmChecklist);
router.post('/:id/return', bookingsController.markReturned);
router.post('/:id/inspection', bookingsController.inspection);
router.put('/:id/status', bookingsController.updateBookingStatus);
router.post('/:id/:action', bookingsController.handleBookingAction);

export default router;
