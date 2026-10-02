import express from 'express';
import * as disputesController from '../controllers/disputes.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import upload from '../middleware/upload.middleware.js';

const router = express.Router();

router.use(authenticate);

router.get('/', disputesController.getMyDisputes);
router.post('/', upload.array('photos', 5), disputesController.createDispute);
router.get('/:id', disputesController.getDispute);
router.get('/:id/messages', disputesController.getMessages);
router.post('/:id/messages', upload.array('attachments', 3), disputesController.postMessage);
router.post('/:id/respond', disputesController.respond);
router.post('/:id/renter-action', disputesController.renterAction);
router.post('/:id/resolve', disputesController.resolve);
router.put('/:id/resolve', disputesController.resolve);
router.post('/:id/admin-resolve', disputesController.resolve);

export default router;
