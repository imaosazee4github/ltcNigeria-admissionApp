import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getDashboardRoute } from '../../utils/permissions';
import LoadingScreen from './LoadingScreen';

export default function RoleRoute({
  allowedRoles,
  children,
}) {
  const { session, profile, role, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!session) {
    return <Navigate to="/" replace />;
  }

  if (!profile || !role) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (!allowedRoles.includes(role)) {
    return (
      <Navigate
        to={getDashboardRoute(role)}
        replace
      />
    );
  }

  return children;
}