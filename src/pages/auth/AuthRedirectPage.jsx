import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getDashboardRoute } from '../../utils/permissions';
import LoadingScreen from '../../components/common/LoadingScreen';

export default function AuthRedirectPage() {
  const {
    session,
    role,
    loading,
    profileLoading,
    profileError,
  } = useAuth();

  if (loading || profileLoading) {
    return <LoadingScreen />;
  }

  if (!session) {
    return <Navigate to="/" replace />;
  }

  if (profileError) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-lg rounded-xl bg-white p-7 shadow">
          <h1 className="text-2xl font-bold text-red-700">
            Unable to Load Your Profile
          </h1>

          <p className="mt-3 text-slate-600">
            {profileError}
          </p>

          <Link
            to="/"
            className="mt-6 inline-block rounded-md bg-blue-900 px-5 py-3 font-semibold text-white"
          >
            Return to Login
          </Link>
        </div>
      </main>
    );
  }

  if (!role) {
    return <Navigate to="/unauthorized" replace />;
  }

  return (
    <Navigate
      to={getDashboardRoute(role)}
      replace
    />
  );
}