import {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  Link,
  Navigate,
} from 'react-router-dom';

import { useAuth } from '../../hooks/useAuth';

import {
  acceptLeaderInvitation,
  getPendingInvitationToken,
} from '../../services/invitationRegistrationService';

import {
  getDashboardRoute,
} from '../../utils/permissions';

import LoadingScreen from '../../components/common/LoadingScreen';

export default function AuthRedirectPage() {
  const {
    session,
    role,
    loading,
    profileLoading,
    profileError,
  } = useAuth();

  const invitationStarted =
    useRef(false);

  const [
    processingInvitation,
    setProcessingInvitation,
  ] = useState(true);

  const [
    invitationError,
    setInvitationError,
  ] = useState('');

  const [
    retryCount,
    setRetryCount,
  ] = useState(0);

  useEffect(() => {
    /*
     * Wait until Supabase has finished
     * loading the authenticated session.
     */
    if (loading) {
      return;
    }

    /*
     * A signed-out user has no invitation
     * acceptance work to complete.
     */
    if (!session) {
      setProcessingInvitation(false);
      return;
    }

    const pendingToken =
      getPendingInvitationToken();

    /*
     * No pending leader invitation means
     * normal role-based redirection can run.
     */
    if (!pendingToken) {
      setProcessingInvitation(false);
      return;
    }

    /*
     * Prevent React Strict Mode from calling
     * the acceptance function twice.
     */
    if (invitationStarted.current) {
      return;
    }

    invitationStarted.current = true;

    async function completePendingInvitation() {
      setProcessingInvitation(true);
      setInvitationError('');

      try {
        await acceptLeaderInvitation(
          pendingToken
        );

        /*
         * Reload the page so AuthContext fetches
         * the new role assigned by the database.
         *
         * acceptLeaderInvitation removes the
         * pending token after it succeeds, so
         * this will not create a reload loop.
         */
        window.location.replace(
          '/auth/redirect'
        );
      } catch (error) {
        invitationStarted.current = false;

        setInvitationError(
          error.message ||
            'Unable to complete the leadership invitation.'
        );

        setProcessingInvitation(false);
      }
    }

    completePendingInvitation();
  }, [
    loading,
    session,
    retryCount,
  ]);

  function handleRetryInvitation() {
    invitationStarted.current = false;
    setInvitationError('');
    setProcessingInvitation(true);

    setRetryCount(
      (currentCount) =>
        currentCount + 1
    );
  }

  /*
   * Wait for the Supabase session first.
   */
  if (loading) {
    return <LoadingScreen />;
  }

  /*
   * A user must have a session before
   * processing an invitation.
   */
  if (!session) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  /*
   * Complete a pending invitation before
   * using the role to choose a dashboard.
   */
  if (processingInvitation) {
    return (
      <LoadingScreen message="Completing your leadership invitation..." />
    );
  }

  if (invitationError) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-lg rounded-xl border border-red-200 bg-white p-7 shadow">
          <h1 className="text-2xl font-bold text-red-700">
            Invitation Could Not Be Completed
          </h1>

          <p className="mt-3 text-slate-600">
            {invitationError}
          </p>

          <p className="mt-3 text-sm text-slate-500">
            Make sure you signed in with the
            same email address used in the
            invitation.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={
                handleRetryInvitation
              }
              className="rounded-md bg-blue-900 px-5 py-3 font-semibold text-white"
            >
              Try Again
            </button>

            <Link
              to="/"
              className="rounded-md border border-blue-900 px-5 py-3 font-semibold text-blue-900"
            >
              Return to Login
            </Link>
          </div>
        </div>
      </main>
    );
  }

  /*
   * Once invitation processing is finished,
   * wait for the profile and role.
   */
  if (profileLoading) {
    return <LoadingScreen />;
  }

  if (profileError) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-lg rounded-xl bg-white p-7 shadow">
          <h1 className="text-2xl font-bold text-red-700">
            Unable to Load Your Profile
          </h1>

          <p className="mt-3 text-slate-600">
            {typeof profileError === 'string'
              ? profileError
              : profileError.message}
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
    return (
      <Navigate
        to="/unauthorized"
        replace
      />
    );
  }

  return (
    <Navigate
      to={getDashboardRoute(role)}
      replace
    />
  );
}