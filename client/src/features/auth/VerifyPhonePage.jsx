import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { OTPForm } from '@/components/forms/OTPForm';
import api from '@/lib/api';
import { useAuthContext } from '@/app/providers';

export const VerifyPhonePage = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  
  const [phone, setPhone] = useState(user?.phone || '');
  const [step, setStep] = useState(user?.phone ? 'verify' : 'input'); // input | verify
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleSendOTP = async (e) => {
    e?.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await api.post('/auth/send-phone-otp', { phone });
      setStep('verify');
      setCountdown(60);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = async (otp) => {
    setError('');
    setIsLoading(true);
    try {
      await api.post('/auth/verify-phone', { phone, code: otp });
      navigate('/profile');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid verification code');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-alt px-4 py-12">
      <div className="max-w-md w-full bg-surface rounded-card p-8 shadow-sm border border-border text-center">
        <h1 className="text-2xl font-bold text-text-main mb-2">Verify Phone Number</h1>
        
        {error && (
          <div className="bg-red-50 text-danger p-3 rounded-card text-sm mb-6 border border-red-100 text-left mt-4">
            {error}
          </div>
        )}

        {step === 'input' ? (
          <>
            <p className="text-text-muted mb-6">Enter your phone number to receive a verification code.</p>
            <form onSubmit={handleSendOTP} className="space-y-4 text-left">
              <Input
                label="Phone Number"
                type="tel"
                placeholder="+91 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
              <Button type="submit" className="w-full mt-2" isLoading={isLoading}>
                Send Code
              </Button>
            </form>
          </>
        ) : (
          <>
            <p className="text-text-muted mb-6">
              We've sent a 6-digit code to <strong>{phone}</strong>
              <button 
                onClick={() => setStep('input')} 
                className="text-primary text-sm ml-2 hover:underline"
              >
                (Change)
              </button>
            </p>
            <div className="mb-6">
              <OTPForm onComplete={handleComplete} isLoading={isLoading} />
            </div>
            <div className="text-sm text-text-muted mt-6">
              Didn't receive the code?{' '}
              {countdown > 0 ? (
                <span>Resend in {countdown}s</span>
              ) : (
                <button 
                  onClick={() => handleSendOTP()}
                  className="text-primary font-medium hover:underline"
                >
                  Resend now
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyPhonePage;
