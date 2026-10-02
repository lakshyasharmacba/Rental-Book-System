import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { OTPForm } from '@/components/forms/OTPForm';
import api from '@/lib/api';
import { useAuthContext } from '@/app/providers';

export const VerifyEmailPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const email = location.state?.email || user?.email;
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    if (!email) {
      navigate('/login');
      return;
    }
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [email, navigate]);

  const handleComplete = async (otp) => {
    setError('');
    setIsLoading(true);
    try {
      await api.post('/auth/verify-email', { email, code: otp });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setError('');
    try {
      await api.post('/auth/resend-email-verification', { email });
      setCountdown(60);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend code');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-alt px-4 py-12">
      <div className="max-w-md w-full bg-surface rounded-card p-8 shadow-sm border border-border text-center">
        <h1 className="text-2xl font-bold text-text-main mb-2">Verify your email</h1>
        <p className="text-text-muted mb-6">
          We've sent a 6-digit code to <strong>{email}</strong>
        </p>

        {error && (
          <div className="bg-red-50 text-danger p-3 rounded-card text-sm mb-6 border border-red-100 text-left">
            {error}
          </div>
        )}

        <div className="mb-6">
          <OTPForm onComplete={handleComplete} isLoading={isLoading} />
        </div>

        <div className="text-sm text-text-muted mt-6">
          Didn't receive the code?{' '}
          {countdown > 0 ? (
            <span>Resend in {countdown}s</span>
          ) : (
            <button 
              onClick={handleResend}
              className="text-primary font-medium hover:underline"
            >
              Resend now
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
