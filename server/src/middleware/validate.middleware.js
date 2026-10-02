import * as authValidators from '../validators/auth.validators.js';
import * as itemsValidators from '../validators/items.validators.js';
import * as bookingsValidators from '../validators/bookings.validators.js';
import * as disputesValidators from '../validators/disputes.validators.js';
import * as reviewsValidators from '../validators/reviews.validators.js';
import * as adminValidators from '../validators/admin.validators.js';

const schemas = {
  register: authValidators.registerSchema,
  login: authValidators.loginSchema,
  createItem: itemsValidators.createItemSchema,
  updateItem: itemsValidators.updateItemSchema,
  createBooking: bookingsValidators.createBookingSchema,
  updateBookingStatus: bookingsValidators.updateBookingStatusSchema,
  createDispute: disputesValidators.createDisputeSchema,
  resolveDispute: adminValidators.resolveDisputeSchema,
  addDisputeMessage: disputesValidators.addDisputeMessageSchema,
  createReview: reviewsValidators.createReviewSchema,
  updateReview: reviewsValidators.updateReviewSchema,
  updateUserStatus: adminValidators.banUserSchema,
  updateOwnerSettings: adminValidators.updatePlatformConfigSchema,
};

export const validate = (schemaOrName) => (req, res, next) => {
  const schema = typeof schemaOrName === 'string' ? schemas[schemaOrName] : schemaOrName;
  if (!schema) {
    return next();
  }
  
  const target = schema.shape?.body ? { body: req.body, params: req.params, query: req.query } : req.body;
  const result = schema.safeParse(target);
  if (!result.success) {
    const message = result.error.errors?.[0]?.message || 'Validation failed';
    return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message } });
  }
  if (result.data?.body) {
    req.body = result.data.body;
  } else if (!schema.shape?.body) {
    req.body = result.data;
  }
  next();
};

export default validate;
