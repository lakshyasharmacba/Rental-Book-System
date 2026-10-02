import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { env } from '../config/env.js';
import RefreshToken from '../models/RefreshToken.js';
import OtpCode from '../models/OtpCode.js';
import User from '../models/User.js';
import { generateOTP, generateToken } from '../utils/generateCode.js';
import { sendMail } from '../config/mailer.js';
import { AppError } from '../utils/AppError.js';

export const generateTokens = async (userId, device = '') => {
  const accessToken = jwt.sign({ userId }, env.JWT_ACCESS_SECRET, { expiresIn: '15m' });
  const refreshToken = generateToken();
  const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
  const expiresAt = new Date(Date.now() + 30 * 24 * 3600 * 1000);
  await RefreshToken.create({ userId, tokenHash, expiresAt, device });
  return { accessToken, refreshToken };
};

export const verifyRefreshToken = async (token) => {
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const record = await RefreshToken.findOne({ tokenHash, revokedAt: null });
  if (!record || record.expiresAt < new Date()) throw new AppError('INVALID_TOKEN', 'Invalid or expired token', 401);
  await RefreshToken.findByIdAndUpdate(record._id, { revokedAt: new Date() });
  return record.userId;
};

export const sendOTP = async (userId, target, channel) => {
  const recentCount = await OtpCode.countDocuments({
    userId, channel, createdAt: { $gt: new Date(Date.now() - 10 * 60 * 1000) }
  });
  if (recentCount >= 3) throw new AppError('OTP_LIMIT', 'Too many OTPs. Try again later.', 429);
  
  const code = generateOTP();
  const codeHash = await bcrypt.hash(code, 10);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
  await OtpCode.create({ userId, target, channel, codeHash, expiresAt });

  // Always print OTP to console for easy testing/debugging
  console.log(`\n🔐 OTP [${channel.toUpperCase()}] → ${target} : ${code}\n`);

  if (channel === 'email') {
    await sendMail({
      to: target,
      subject: 'Your RentLens OTP Code',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;background:#f9fafb;border-radius:12px;">
          <div style="text-align:center;margin-bottom:24px;">
            <h2 style="color:#0F766E;margin:0;">RentLens</h2>
          </div>
          <div style="background:white;padding:24px;border-radius:8px;border:1px solid #e5e7eb;">
            <h3 style="margin:0 0 8px;color:#111827;">Your Verification Code</h3>
            <p style="color:#6B7280;margin:0 0 24px;font-size:14px;">Use this code to verify your identity. Valid for 5 minutes.</p>
            <div style="text-align:center;background:#f0fdf4;border:2px dashed #0F766E;border-radius:8px;padding:20px;margin-bottom:24px;">
              <span style="font-size:36px;font-weight:bold;letter-spacing:12px;color:#0F766E;">${code}</span>
            </div>
            <p style="color:#9CA3AF;font-size:12px;text-align:center;margin:0;">If you didn't request this, ignore this email.</p>
          </div>
          <p style="text-align:center;color:#9CA3AF;font-size:12px;margin-top:16px;">Sent from support@rentlens.in</p>
        </div>
      `,
    });
  }
  return { sent: true };
};

export const verifyOTP = async (userId, code, channel) => {
  const otp = await OtpCode.findOne({ userId, channel, usedAt: null, expiresAt: { $gt: new Date() } }).sort({ createdAt: -1 });
  if (!otp) throw new AppError('OTP_EXPIRED', 'OTP expired or not found', 400);
  if (otp.attempts >= 5) throw new AppError('OTP_LOCKED', 'Too many wrong attempts', 400);
  const ok = await bcrypt.compare(code, otp.codeHash);
  if (!ok) { otp.attempts++; await otp.save(); throw new AppError('OTP_WRONG', 'Wrong OTP', 400); }
  otp.usedAt = new Date();
  await otp.save();
  return true;
};

