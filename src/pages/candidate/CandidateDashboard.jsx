import {
  Link,
  useNavigate,
} from 'react-router-dom';

import { useAuth } from '../../hooks/useAuth';
import { useApplication } from '../../hooks/useApplication';

export default function CandidateDashboard() {
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();

  const {
    data,
    isLoading,
    error,
  } = useApplication(profile?.id);

  async function handleSignOut() {
    const { error: signOutError } =
      await signOut();

    if (signOutError) {
      console.error(signOutError.message);
      return;
    }

    navigate('/', {
      replace: true,
    });
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-slate-600">
          Loading your application...
        </p>
      </main>
    );
  }

  const application = data?.application;
  const latestReview = data?.latestReview;

  const localUnitType =
    data?.candidateProfile?.local_unit_type;

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div>
            <p className="text-sm text-slate-500">
              Candidate Dashboard
            </p>

            <h1 className="mt-1 text-3xl font-bold text-blue-900">
              Welcome,{' '}
              {profile?.full_name ||
                'Candidate'}
            </h1>
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            className="rounded-md border border-blue-900 px-4 py-2 font-semibold text-blue-900"
          >
            Sign Out
          </button>
        </header>

        {error && (
          <div className="mt-8 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            {error.message}
          </div>
        )}

        {!error && !data?.intake && (
          <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-6">
            <h2 className="font-semibold text-amber-900">
              Applications are currently closed
            </h2>

            <p className="mt-2 text-sm text-amber-800">
              There is no open admission intake
              at this time.
            </p>
          </div>
        )}

        {application?.status ===
          'correction_required' && (
          <section className="mt-8 rounded-xl border border-amber-300 bg-amber-50 p-6">
            <h2 className="text-xl font-bold text-amber-900">
              Correction Required
            </h2>

            <p className="mt-2 text-amber-800">
              Your application was reviewed and
              some changes were requested.
            </p>

            <div className="mt-4 rounded-md border border-amber-200 bg-white p-4">
              <p className="text-sm font-semibold text-slate-700">
                Reviewer comment
              </p>

              <p className="mt-2 whitespace-pre-wrap text-slate-800">
                {latestReview?.comments ||
                  'Please review your application and correct the requested information.'}
              </p>

              {latestReview?.reviewed_at && (
                <p className="mt-3 text-xs text-slate-500">
                  Reviewed:{' '}
                  {formatDateTime(
                    latestReview.reviewed_at
                  )}
                </p>
              )}
            </div>
          </section>
        )}

        {application && (
          <section className="mt-8 grid gap-6 lg:grid-cols-3">
            <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Current Admission
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-blue-900">
                    {data?.intake?.name ||
                      'Current Intake'}
                  </h2>
                </div>

                <ApplicationStatus
                  status={application.status}
                  localUnitType={
                    localUnitType
                  }
                />
              </div>

              <div className="mt-7">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-slate-700">
                    Application progress
                  </span>

                  <span className="font-semibold text-blue-900">
                    {
                      application.completion_percentage
                    }
                    %
                  </span>
                </div>

                <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-blue-900 transition-all"
                    style={{
                      width: `${application.completion_percentage}%`,
                    }}
                  />
                </div>
              </div>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  to="/candidate/application"
                  className="rounded-md bg-blue-900 px-5 py-3 font-semibold text-white"
                >
                  {getApplicationButtonLabel(
                    application
                  )}
                </Link>
              </div>
            </article>

            <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-slate-500">
                Current step
              </p>

              <p className="mt-2 text-3xl font-bold text-blue-900">
                {application.current_step} of 7
              </p>

              <p className="mt-4 text-sm text-slate-600">
                {getStepMessage(
                  application.status,
                  localUnitType
                )}
              </p>
            </article>
          </section>
        )}
      </div>
    </main>
  );
}

function getApplicationButtonLabel(application) {
  if (
    application.status ===
    'correction_required'
  ) {
    return 'Correct Application';
  }

  if (application.status === 'draft') {
    return application.completion_percentage > 0
      ? 'Continue Application'
      : 'Start Application';
  }

  return 'View Application';
}

function getStepMessage(
  status,
  localUnitType
) {
  if (status === 'correction_required') {
    return 'Review the comment, make the requested correction and resubmit your application.';
  }

  if (status === 'pending_ltc_review') {
    return 'Your application is waiting for LTC Admin review.';
  }

  if (
    status ===
    'pending_local_endorsement'
  ) {
    if (localUnitType === 'ward') {
      return 'Your application is waiting for your Bishop’s endorsement.';
    }

    if (localUnitType === 'branch') {
      return 'Your application is waiting for your Branch President’s endorsement.';
    }

    return 'Your application is waiting for your local Church leader’s endorsement.';
  }

  if (
    status ===
    'pending_final_endorsement'
  ) {
    return 'Your application is waiting for final endorsement from your Stake or District President.';
  }

  if (
    status ===
    'admission_completed'
  ) {
    return 'Your admission review and Church endorsements have been completed.';
  }

  if (status === 'awaiting_room') {
    return 'Your admission is complete and you are waiting for room allocation.';
  }

  if (status === 'room_allocated') {
    return 'Your room has been allocated.';
  }

  if (status === 'rejected') {
    return 'Your application was not approved.';
  }

  if (status === 'withdrawn') {
    return 'This application has been withdrawn.';
  }

  return 'Your progress is saved after completing each section.';
}

function ApplicationStatus({
  status,
  localUnitType,
}) {
  const localEndorsementLabel =
    localUnitType === 'ward'
      ? 'Pending Bishop Endorsement'
      : localUnitType === 'branch'
        ? 'Pending Branch President Endorsement'
        : 'Pending Local Leader Endorsement';

  const labels = {
    draft: 'Draft',

    pending_ltc_review:
      'Pending LTC Review',

    correction_required:
      'Correction Required',

    rejected:
      'Rejected',

    pending_local_endorsement:
      localEndorsementLabel,

    pending_final_endorsement:
      'Pending Final Endorsement',

    admission_completed:
      'Admission Completed',

    awaiting_room:
      'Awaiting Room',

    room_allocated:
      'Room Allocated',

    withdrawn:
      'Withdrawn',
  };

  const colorClasses = {
    draft:
      'bg-slate-100 text-slate-700',

    pending_ltc_review:
      'bg-amber-100 text-amber-800',

    pending_local_endorsement:
      'bg-blue-100 text-blue-800',

    pending_final_endorsement:
      'bg-purple-100 text-purple-800',

    correction_required:
      'bg-amber-100 text-amber-800',

    rejected:
      'bg-red-100 text-red-700',

    admission_completed:
      'bg-green-100 text-green-700',

    awaiting_room:
      'bg-cyan-100 text-cyan-800',

    room_allocated:
      'bg-green-100 text-green-700',

    withdrawn:
      'bg-slate-200 text-slate-700',
  };

  const classes =
    colorClasses[status] ||
    'bg-blue-100 text-blue-800';

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${classes}`}
    >
      {labels[status] || status}
    </span>
  );
}

function formatDateTime(value) {
  if (!value) {
    return '';
  }

  return new Intl.DateTimeFormat('en-NG', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}