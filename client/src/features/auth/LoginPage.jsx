import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Camera } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { OTPForm } from '@/components/forms/OTPForm';
import { useAuthContext } from '@/app/providers';
import api from '@/lib/api';
import { setAccessToken } from '@/lib/auth';

export const LoginPage = () => {
  const [step, setStep] = useState('login'); // 'login' | 'otp'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [pendingToken, setPendingToken] = useState(null);
  const { login, refreshUser } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      // Step 1: Login → get token
      const res = await api.post('/auth/login', {
        email: email.toLowerCase().trim(),
        password,
      });
      const token = res.data.data?.accessToken || res.data.data?.token;
      setPendingToken(token);

      // Step 2: Send OTP to email
      if (token) {
        setAccessToken(token); // temporarily set so next call is authenticated
        await api.post('/auth/otp/send', { target: email.toLowerCase().trim(), channel: 'email' });
      }

      // Start countdown
      let count = 60;
      setCountdown(count);
      const timer = setInterval(() => {
        count -= 1;
        setCountdown(count);
        if (count <= 0) clearInterval(timer);
      }, 1000);

      setStep('otp');
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error?.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPVerify = async (otp) => {
    setOtpError('');
    setOtpLoading(true);
    try {
      // Verify OTP
      await api.post('/auth/otp/verify', { code: otp, channel: 'email' });
      // Fetch user and redirect
      const user = await refreshUser();
      // navigate based on role
      const me = await api.get('/auth/me');
      const u = me.data.data;
      if (u?.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      setOtpError(err.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;
    setOtpError('');
    try {
      await api.post('/auth/otp/send', { target: email.toLowerCase().trim(), channel: 'email' });
      let count = 60;
      setCountdown(count);
      const timer = setInterval(() => {
        count -= 1;
        setCountdown(count);
        if (count <= 0) clearInterval(timer);
      }, 1000);
    } catch (err) {
      setOtpError(err.response?.data?.message || 'Failed to resend OTP');
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
  };

  // ── OTP Step ──────────────────────────────────────────────
  if (step === 'otp') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-blue-50 px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 shadow-lg border border-gray-100 text-center">
          {/* Icon */}
          <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-teal-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h1>
          <p className="text-gray-500 mb-1">We've sent a 6-digit verification code to</p>
          <p className="font-semibold text-teal-700 mb-6">{email}</p>

          {otpError && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-6 border border-red-100">
              {otpError}
            </div>
          )}

          <div className="mb-6">
            <OTPForm onComplete={handleOTPVerify} isLoading={otpLoading} />
          </div>

          <div className="text-sm text-gray-500 mt-4">
            Didn't receive the code?{' '}
            {countdown > 0 ? (
              <span className="text-gray-400">Resend in {countdown}s</span>
            ) : (
              <button
                onClick={handleResendOTP}
                className="text-teal-600 font-semibold hover:underline"
              >
                Resend now
              </button>
            )}
          </div>

          <button
            onClick={() => { setStep('login'); setOtpError(''); }}
            className="mt-4 text-sm text-gray-400 hover:text-gray-600 underline"
          >
            ← Back to login
          </button>
        </div>
      </div>
    );
  }

  // ── Login Step ────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-blue-50 px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center">
              <Camera className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-teal-700">RentLens</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900">Welcome back!</h1>
          <p className="text-gray-500 mt-1 text-sm">Sign in to your account</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-6 border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="on">
          {/* Email */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="username"
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none text-sm transition"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="Your password"
                className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none text-sm transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end">
            <Link to="/forgot-password" className="text-sm text-teal-600 hover:underline">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded-xl transition disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : null}
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 flex items-center gap-3">
          <div className="flex-1 border-t border-gray-200" />
          <span className="text-sm text-gray-400">OR</span>
          <div className="flex-1 border-t border-gray-200" />
        </div>

        <button
          onClick={handleGoogleLogin}
          type="button"
          className="w-full mt-4 flex items-center justify-center gap-3 border border-gray-200 rounded-xl py-3 hover:bg-gray-50 transition text-sm font-medium text-gray-700"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Continue with Google
        </button>

        <p className="mt-6 text-center text-sm text-gray-500">
          Don't have an account?{' '}
          <Link to="/signup" className="font-semibold text-teal-600 hover:underline">
            Sign up free
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
