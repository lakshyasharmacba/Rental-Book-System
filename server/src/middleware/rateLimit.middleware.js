import rateLimit from 'express-rate-limit';
export const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });
export const otpLimiter = rateLimit({ windowMs: 10 * 60 * 1000, max: 3 });
export const codeLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });
export const generalLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
