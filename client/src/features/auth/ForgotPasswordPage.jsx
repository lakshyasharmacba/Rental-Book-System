import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import api from '@/lib/api';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | sent | error
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await api.post('/auth/forgot-password', { email: email.toLowerCase().trim() });
      setMessage(res.data.message || 'Reset link sent! Check your email.');
      setStatus('sent');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to send reset email. Please try again.');
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-alt px-4 py-12">
      <div className="max-w-md w-full bg-surface rounded-card p-8 shadow-sm border border-border">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-text-main">Reset your password</h1>
          <p className="text-text-muted mt-2">Enter your email and we'll send you a reset link</p>
        </div>

        {status === 'sent' ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-text-main font-medium mb-2">Check your email</p>
            <p className="text-text-muted text-sm">{message}</p>
            <Link to="/login" className="mt-6 block text-primary hover:underline text-sm">Back to login</Link>
          </div>
        ) : (
          <>
            {status === 'error' && (
              <div className="bg-red-50 text-danger p-3 rounded-card text-sm mb-6 border border-red-100">
                {message}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
              />
              <Button type="submit" className="w-full mt-6" isLoading={status === 'loading'}>
                Send Reset Link
              </Button>
            </form>
            <p className="mt-6 text-center text-sm text-text-muted">
              <Link to="/login" className="text-primary hover:underline">Back to login</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
