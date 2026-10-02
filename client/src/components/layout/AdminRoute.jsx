import { Navigate } from 'react-router-dom';
import { useAuthContext } from '@/app/providers';
import { Spinner } from '../ui/Spinner';

export const AdminRoute = ({ children }) => {
  const { user, loading } = useAuthContext();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
};
