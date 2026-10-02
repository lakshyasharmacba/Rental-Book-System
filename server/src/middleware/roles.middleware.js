import { AppError } from '../utils/AppError.js';
export const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') throw new AppError('FORBIDDEN', 'Admin only', 403);
  next();
};
export const requireVerified = (req, res, next) => {
  if (!req.user?.emailVerified || !req.user?.phoneVerified) throw new AppError('NOT_VERIFIED', 'Verify email and phone first', 403);
  next();
};
