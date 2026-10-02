import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Camera, CheckCircle, XCircle } from 'lucide-react';
import api from '@/lib/api';
import { setAccessToken } from '@/lib/auth';
import { useAuthContext } from '@/app/providers';

/**
 * Google OAuth Callback Page
 * Handles the redirect from Google with access_token in the URL hash.
 * It sends the Google token to our backend, logs in, and redirects.
 */
export const GoogleCallbackPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshUser } = useAuthContext();
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Google returns the access_token in URL hash for implicit flow
        const hash = location.hash;
        const params = new URLSearchParams(hash.replace('#', '?'));
        const googleAccessToken = params.get('access_token');

        // Also check query params (for code flow)
        const queryParams = new URLSearchParams(location.search);
        const code = queryParams.get('code');
        const errorParam = queryParams.get('error');

        if (errorParam) {
          setStatus('error');
          setMessage(errorParam === 'access_denied' ? 'Google sign-in was cancelled.' : 'Google sign-in failed.');
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        if (!googleAccessToken && !code) {
          setStatus('error');
          setMessage('No authentication data received from Google.');
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        // If we have a Google access token, fetch user info from Google
        if (googleAccessToken) {
          const googleRes = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo`, {
            headers: { Authorization: `Bearer ${googleAccessToken}` },
          });
          const googleUser = await googleRes.json();

          if (!googleUser.email) {
            throw new Error('Could not get email from Google');
          }

          // Send to our backend
          const res = await api.post('/auth/google', {
            email: googleUser.email,
            name: googleUser.name,
            googleId: googleUser.sub,
            photoUrl: googleUser.picture,
          });

          const token = res.data.data?.accessToken || res.data.data?.token;
          if (token) {
            setAccessToken(token);
            await refreshUser();
            setStatus('success');
            setMessage(`Welcome, ${googleUser.name}!`);
            setTimeout(() => navigate('/'), 1500);
          }
        }
      } catch (err) {
        console.error('Google callback error:', err);
        setStatus('error');
        setMessage(err.response?.data?.message || 'Google sign-in failed. Please try again.');
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    handleCallback();
  }, [location, navigate, refreshUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-blue-50 px-4">
      <div className="max-w-sm w-full bg-white rounded-2xl p-8 shadow-lg border border-gray-100 text-center">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center">
            <Camera className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-teal-700">RentLens</span>
        </div>

        {status === 'loading' && (
          <>
            <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">Signing you in with Google...</h2>
            <p className="text-gray-500 text-sm mt-2">Please wait a moment</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-800">Signed in successfully!</h2>
            <p className="text-gray-500 text-sm mt-2">{message}</p>
            <p className="text-gray-400 text-xs mt-1">Redirecting to home...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-800">Sign-in failed</h2>
            <p className="text-gray-500 text-sm mt-2">{message}</p>
            <p className="text-gray-400 text-xs mt-1">Redirecting to login...</p>
          </>
        )}
      </div>
    </div>
  );
};

export default GoogleCallbackPage;
