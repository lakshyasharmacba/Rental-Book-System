import express from 'express';
import * as authController from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/register', authController.signup);
router.post('/login', authController.login);
router.get('/google', authController.googleRedirect);
router.post('/google', authController.googleAuth);
router.post('/refresh', authController.refreshToken);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.getMe);
router.patch('/me', authenticate, authController.updateMe);
router.put('/me', authenticate, authController.updateMe);
router.put('/update-password', authenticate, authController.updatePassword);
router.post('/me/photo', authenticate, authController.uploadPhoto);
router.delete('/me', authenticate, authController.deleteAccount);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/reset-password/:token', authController.resetPassword);
router.post('/verify-email', authController.verifyEmail);
router.post('/resend-email-verification', authController.resendEmailVerification);
router.post('/send-phone-otp', authController.sendPhoneOTP);
router.post('/verify-phone', authController.verifyPhone);
router.post('/otp/send', authenticate, authController.sendOTP);
router.post('/otp/verify', authenticate, authController.verifyOTP);
router.get('/users/:id/public', authController.getPublicProfile);

export default router;
