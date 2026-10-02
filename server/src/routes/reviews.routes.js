import express from 'express';
import * as reviewsController from '../controllers/reviews.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', reviewsController.getReviews);
router.get('/:id', reviewsController.getReviewById);
router.post('/', authenticate, reviewsController.createReview);
router.put('/:id', authenticate, reviewsController.updateReview);
router.delete('/:id', authenticate, reviewsController.deleteReview);
router.post('/:id/report', authenticate, reviewsController.reportReview);

export default router;
