import express from 'express';
import * as paymentsController from '../controllers/payments.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/create-order', authenticate, paymentsController.createOrder);
router.post('/create-intent', authenticate, paymentsController.createOrder);
router.post('/verify', authenticate, paymentsController.verifyPayment);
router.post('/process', authenticate, paymentsController.verifyPayment);
router.get('/:id', authenticate, paymentsController.getPaymentDetails);
router.get('/history/me', authenticate, paymentsController.getMyPaymentHistory);

export default router;
