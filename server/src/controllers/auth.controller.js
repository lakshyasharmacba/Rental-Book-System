import bcrypt from 'bcrypt';
import { asyncHandler } from '../utils/asyncHandler.js';
import User from '../models/User.js';
import { generateTokens, verifyRefreshToken, sendOTP as sendOtpService, verifyOTP as verifyOtpService } from '../services/auth.service.js';
import { AppError } from '../utils/AppError.js';
import OtpCode from '../models/OtpCode.js';
export const signup = asyncHandler(async (req, res) => {
  const { name, email, password, phone, city } = req.body;
  if (!email || !password) throw new AppError('VALIDATION_ERROR', 'Email and password required', 400);

  const existing = await User.findOne({ email: email.toLowerCase() });

  // If user exists and email is verified → true duplicate
  if (existing && existing.emailVerified) {
    throw new AppError('USER_EXISTS', 'Email already registered. Please log in.', 400);
  }

  // If user exists but NOT verified → resend OTP (don't block them)
  if (existing && !existing.emailVerified) {
    const { accessToken, refreshToken: token } = await generateTokens(existing._id);
    res.cookie('refreshToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 3600 * 1000,
    });
    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: existing._id,
          _id: existing._id,
          name: existing.name,
          email: existing.email,
          role: existing.role,
          status: existing.status,
        },
        accessToken,
        token: accessToken,
        resent: true,
      },
      message: 'Account exists but not verified. OTP will be resent.',
    });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    name: name || email.split('@')[0],
    email: email.toLowerCase(),
    passwordHash,
    phone,
    city,
    status: 'active',
  });

  const { accessToken, refreshToken: token } = await generateTokens(user._id);

  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 3600 * 1000,
  });

  res.status(201).json({
    success: true,
    data: {
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
      accessToken,
      token: accessToken,
    },
    message: 'Signup successful',
  });
});

export const register = signup;

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new AppError('VALIDATION_ERROR', 'Email and password required', 400);

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user || !user.passwordHash) {
    throw new AppError('INVALID_CREDENTIALS', 'Invalid email or password', 401);
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new AppError('INVALID_CREDENTIALS', 'Invalid email or password', 401);
  }

  if (user.status === 'blocked') throw new AppError('BLOCKED', 'Account is blocked', 403);

  const { accessToken, refreshToken: token } = await generateTokens(user._id);

  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 3600 * 1000,
  });

  res.status(200).json({
    success: true,
    data: {
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        trustScore: user.trustScore,
      },
      accessToken,
      token: accessToken,
    },
    message: 'Login successful',
  });
});

export const googleRedirect = asyncHandler(async (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  if (!clientId || clientId.includes('XXXXX')) {
    return res.redirect(`${clientUrl}/login?error=Google%20Client%20ID%20not%20configured%20in%20server%2F.env`);
  }
  const redirectUri = encodeURIComponent(`${clientUrl}/auth/google/callback`);
  const scope = encodeURIComponent('email profile openid');
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=token&scope=${scope}&prompt=select_account`;
  res.redirect(googleAuthUrl);
});

export const googleAuth = asyncHandler(async (req, res) => {
  const { email, name, googleId, photoUrl } = req.body;
  if (!email) throw new AppError('VALIDATION_ERROR', 'Email required', 400);

  let user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    user = await User.create({
      name: name || 'Google User',
      email: email.toLowerCase(),
      googleId,
      photoUrl: photoUrl || '',
      emailVerified: true,
      status: 'active',
    });
  } else {
    // Update google info if not set
    if (!user.googleId) {
      user.googleId = googleId;
      if (photoUrl && !user.photoUrl) user.photoUrl = photoUrl;
      user.emailVerified = true;
      await user.save();
    }
  }

  const { accessToken, refreshToken: token } = await generateTokens(user._id);

  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 3600 * 1000,
  });

  res.status(200).json({
    success: true,
    data: {
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        photoUrl: user.photoUrl,
      },
      accessToken,
      token: accessToken,
    },
    message: 'Google login successful',
  });
});

export const refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken || req.body?.refreshToken || req.body?.token;
  if (!token) throw new AppError('UNAUTHORIZED', 'No refresh token provided', 401);

  const userId = await verifyRefreshToken(token);
  const { accessToken, refreshToken: newToken } = await generateTokens(userId);

  res.cookie('refreshToken', newToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 3600 * 1000,
  });

  res.status(200).json({
    success: true,
    data: { accessToken, token: accessToken },
    message: 'Token refreshed',
  });
});

export const logout = asyncHandler(async (req, res) => {
  res.clearCookie('refreshToken');
  res.status(200).json({ success: true, message: 'Logged out successfully' });
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-passwordHash');
  res.status(200).json({ success: true, data: user });
});

export const updateMe = asyncHandler(async (req, res) => {
  const { name, bio, city, photoUrl } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: { name, bio, city, photoUrl } },
    { new: true }
  ).select('-passwordHash');

  res.status(200).json({ success: true, data: user, message: 'Profile updated' });
});

export const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id);
  if (!user || !user.passwordHash) throw new AppError('BAD_REQUEST', 'Cannot update password for OAuth account', 400);

  const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isMatch) throw new AppError('BAD_REQUEST', 'Current password incorrect', 400);

  user.passwordHash = await bcrypt.hash(newPassword, 10);
  await user.save();
  res.status(200).json({ success: true, message: 'Password updated successfully' });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) throw new AppError('VALIDATION_ERROR', 'Email is required', 400);

  const user = await User.findOne({ email: email.toLowerCase() });
  // Always return success (don't reveal if email exists)
  if (user) {
    const { generateToken } = await import('../utils/generateCode.js');
    const token = generateToken();
    const tokenHash = await import('crypto').then(c => c.default.createHash('sha256').update(token).digest('hex'));
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 min
    
    await OtpCode.create({
      userId: user._id,
      target: user.email,
      channel: 'password_reset',
      codeHash: tokenHash,
      expiresAt,
    });

    const { sendMail } = await import('../config/mailer.js');
    const { env } = await import('../config/env.js');
    const resetUrl = `${env.CLIENT_URL}/reset-password?token=${token}&email=${encodeURIComponent(user.email)}`;
    
    try {
      await sendMail({
        to: user.email,
        subject: 'Reset your RentLens password',
        html: `<h2>Password Reset</h2><p>Click the link below to reset your password. This link expires in 30 minutes.</p><a href="${resetUrl}" style="background:#0F766E;color:white;padding:12px 24px;text-decoration:none;border-radius:8px;display:inline-block;">Reset Password</a><p>If you did not request this, ignore this email.</p>`,
      });
    } catch (e) {
      console.error('Failed to send reset email:', e.message);
    }
  }

  res.status(200).json({ success: true, message: 'If that email exists, a reset link has been sent.' });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { token, email, newPassword, password } = req.body;
  const pwd = newPassword || password;
  if (!token || !email || !pwd) throw new AppError('VALIDATION_ERROR', 'Token, email and new password required', 400);
  if (pwd.length < 8) throw new AppError('VALIDATION_ERROR', 'Password must be at least 8 characters', 400);

  const crypto = await import('crypto');
  const tokenHash = crypto.default.createHash('sha256').update(token).digest('hex');
  const record = await OtpCode.findOne({
    target: email.toLowerCase(),
    channel: 'password_reset',
    codeHash: tokenHash,
    usedAt: null,
    expiresAt: { $gt: new Date() },
  });

  if (!record) throw new AppError('INVALID_TOKEN', 'Reset link is invalid or expired', 400);

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) throw new AppError('NOT_FOUND', 'User not found', 404);

  user.passwordHash = await bcrypt.hash(pwd, 12);
  await user.save();

  record.usedAt = new Date();
  await record.save();

  res.status(200).json({ success: true, message: 'Password reset successful. You can now log in.' });
});

export const sendOTP = asyncHandler(async (req, res) => {
  const { target, channel } = req.body;
  await sendOtpService(req.user._id, target || req.user.email, channel || 'email');
  res.status(200).json({ success: true, message: 'OTP sent' });
});

export const verifyOTP = asyncHandler(async (req, res) => {
  const { code, channel } = req.body;
  const ok = await verifyOtpService(req.user._id, code, channel || 'email');
  if (channel === 'email') await User.findByIdAndUpdate(req.user._id, { emailVerified: true });
  if (channel === 'phone') await User.findByIdAndUpdate(req.user._id, { phoneVerified: true });
  res.status(200).json({ success: true, data: { verified: ok }, message: 'Verified' });
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const { email, code } = req.body;
  await User.findOneAndUpdate({ email: email?.toLowerCase() }, { emailVerified: true });
  res.status(200).json({ success: true, message: 'Email verified successfully' });
});

export const resendEmailVerification = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) throw new AppError('VALIDATION_ERROR', 'Email required', 400);
  
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    return res.status(200).json({ success: true, message: 'If that email exists, OTP has been sent.' });
  }
  
  try {
    await sendOtpService(user._id, user.email, 'email');
  } catch (e) {
    if (e.statusCode === 429) throw e;
    console.error('OTP send error:', e.message);
  }
  
  res.status(200).json({ success: true, message: 'Verification code sent.' });
});

export const sendPhoneOTP = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, message: 'Phone OTP sent' });
});

export const verifyPhone = asyncHandler(async (req, res) => {
  const { phone, code } = req.body;
  if (req.user) await User.findByIdAndUpdate(req.user._id, { phone, phoneVerified: true });
  res.status(200).json({ success: true, message: 'Phone verified' });
});

export const uploadPhoto = asyncHandler(async (req, res) => {
  const photoUrl = req.file?.path || req.body?.photoUrl || '';
  if (photoUrl && req.user) {
    await User.findByIdAndUpdate(req.user._id, { photoUrl });
  }
  res.status(200).json({ success: true, data: { photoUrl } });
});

export const deleteAccount = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { status: 'deleted' });
  res.status(200).json({ success: true, message: 'Account deleted' });
});

export const getPublicProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('name photoUrl city bio ratingAvg ratingCount completedRentals createdAt');
  if (!user) throw new AppError('NOT_FOUND', 'User not found', 404);
  res.status(200).json({ success: true, data: user });
});
