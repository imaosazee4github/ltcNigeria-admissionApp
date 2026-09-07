import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import LoadingScreen from './LoadingScreen';

export default function ProtectedRoute({ children }) {
  const { session, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!session) {
    return (
      <Navigate
        to="/"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return children;
}