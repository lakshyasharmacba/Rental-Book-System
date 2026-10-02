import express from 'express';
import * as paymentsController from '../controllers/payments.controller.js';

const router = express.Router();

// Razorpay webhook — raw body required (set in app.js before express.json())
router.post('/razorpay', express.raw({ type: 'application/json' }), paymentsController.webhookHandler);

export default router;
