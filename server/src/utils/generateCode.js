import crypto from 'crypto';
export const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();
export const generatePickupCode = () => Math.floor(100000 + Math.random() * 900000).toString();
export const generateToken = (bytes = 32) => crypto.randomBytes(bytes).toString('hex');
