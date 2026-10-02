import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';
import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const authenticate = asyncHandler(async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) throw new AppError('UNAUTHORIZED', 'No token', 401);
  const payload = jwt.verify(token, env.JWT_ACCESS_SECRET);
  const user = await User.findById(payload.userId).select('-passwordHash');
  if (!user || user.status === 'deleted' || user.status === 'blocked') throw new AppError('UNAUTHORIZED', 'User not found or blocked', 401);
  req.user = user;
  next();
});

export const optionalAuth = asyncHandler(async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    try {
      const payload = jwt.verify(token, env.JWT_ACCESS_SECRET);
      req.user = await User.findById(payload.userId).select('-passwordHash');
    } catch {}
  }
  next();
});

export const authorize = (...roles) => (req, res, next) => {
  if (!req.user || (roles.length && !roles.includes(req.user.role))) {
    throw new AppError('FORBIDDEN', 'Access denied', 403);
  }
  next();
};

export default { authenticate, optionalAuth, authorize };
