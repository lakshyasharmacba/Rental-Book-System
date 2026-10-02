import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '@/app/providers';
import { Spinner } from '../ui/Spinner';
import { Camera, ArrowRight } from 'lucide-react';

/**
 * ProtectedRoute — agar user login nahi hai to signup page dikhao
 * (sirf redirect nahi, ek attractive "Please sign up" page dikhao)
 */
export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuthContext();
  const location = useLocation();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <AuthPromptPage from={location} />;
  }

  return children;
};

// ── Auth Prompt Page ──────────────────────────────────────────────────────────
const AuthPromptPage = ({ from }) => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-gradient-to-br from-teal-50 to-blue-50">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        
        {/* Top banner */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-500 px-8 py-10 text-center text-white">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Camera className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Join RentLens</h1>
          <p className="text-teal-100 text-sm">
            Sign up to access this feature and start renting gear
          </p>
        </div>

        {/* Buttons */}
        <div className="px-8 py-8 space-y-3">
          <a
            href={`/signup`}
            className="flex items-center justify-center gap-2 w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded-xl transition"
          >
            Create Free Account
            <ArrowRight className="w-4 h-4" />
          </a>
          <a
            href={`/login`}
            className="flex items-center justify-center gap-2 w-full border-2 border-teal-600 text-teal-600 font-semibold py-3 rounded-xl hover:bg-teal-50 transition"
          >
            Already have an account? Sign In
          </a>

          {/* Benefits */}
          <div className="pt-4 border-t border-gray-100 mt-4">
            <p className="text-xs text-gray-400 text-center mb-3">Why join RentLens?</p>
            <div className="space-y-2">
              {[
                '📷 Access 5,000+ cameras & lenses',
                '🛡️ Insured & verified gear owners',
                '⚡ Book in under 2 minutes',
                '💰 Earn by listing your own gear',
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm text-gray-600">
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
