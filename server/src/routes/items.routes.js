import express from 'express';
import * as itemsController from '../controllers/items.controller.js';
import { authenticate, optionalAuth } from '../middleware/auth.middleware.js';
import upload from '../middleware/upload.middleware.js';

const router = express.Router();

router.get('/', optionalAuth, itemsController.search);
router.get('/count', itemsController.count);
router.get('/cities', itemsController.cities);
router.get('/favorites', authenticate, itemsController.getFavorites);
router.post('/favorites/:itemId', authenticate, itemsController.addFavorite);
router.delete('/favorites/:itemId', authenticate, itemsController.removeFavorite);
router.get('/:id', optionalAuth, itemsController.getOne);
router.get('/:id/availability', itemsController.getAvailability);
router.post('/', authenticate, upload.array('images', 12), itemsController.create);
router.patch('/:id', authenticate, itemsController.update);
router.put('/:id', authenticate, itemsController.update);
router.delete('/:id', authenticate, itemsController.deleteItem);
router.post('/:id/photos', authenticate, upload.array('photos', 12), itemsController.uploadPhotos);
router.patch('/:id/status', authenticate, itemsController.updateStatus);
router.post('/:id/blocks', authenticate, itemsController.blockDates);

export default router;
