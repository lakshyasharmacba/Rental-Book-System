import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import api from '@/lib/api';

export const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const email = searchParams.get('email');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token || !email) {
      setError('Invalid or expired reset link. Please request a new one.');
    }
  }, [token, email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setIsLoading(true);
    try {
      const res = await api.post('/auth/reset-password', { token, email, newPassword: password });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error?.message || 'Reset failed. The link may have expired.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-alt px-4 py-12">
        <div className="max-w-md w-full bg-surface rounded-card p-8 shadow-sm border border-border text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-2">Password Reset!</h2>
          <p className="text-text-muted">Redirecting you to login...</p>
          <Link to="/login" className="mt-4 block text-primary hover:underline">Go to login now</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-alt px-4 py-12">
      <div className="max-w-md w-full bg-surface rounded-card p-8 shadow-sm border border-border">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-text-main">Set new password</h1>
          <p className="text-text-muted mt-2">Choose a strong password for your account</p>
        </div>

        {error && (
          <div className="bg-red-50 text-danger p-3 rounded-card text-sm mb-6 border border-red-100">
            {error}
            {(!token || !email) && (
              <><br /><Link to="/forgot-password" className="underline">Request a new link</Link></>
            )}
          </div>
        )}

        {token && email && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="New Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              placeholder="Minimum 8 characters"
            />
            <Input
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Repeat your password"
            />
            <Button type="submit" className="w-full mt-6" isLoading={isLoading} disabled={!token || !email}>
              Reset Password
            </Button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-text-muted">
          <Link to="/login" className="text-primary hover:underline">Back to login</Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
