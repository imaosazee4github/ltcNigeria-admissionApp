import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../hooks/useAuth';

import {
  useLocalEndorsementQueue,
} from '../../hooks/useLocalEndorsements';

export default function LocalLeaderDashboard() {
  const navigate = useNavigate();

  const {
    profile,
    signOut,
  } = useAuth();

  const {
    data,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useLocalEndorsementQueue();

  async function handleSignOut() {
    const result = await signOut();

    if (result?.error) {
      console.error(
        result.error.message
      );

      return;
    }

    navigate('/', {
      replace: true,
    });
  }

  if (isLoading) {
    return (
      <PageMessage message="Loading endorsement queue..." />
    );
  }

  if (error) {
    return (
      <PageMessage
        error
        message={error.message}
      />
    );
  }

  const applications =
    data?.applications || [];

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-5 p-6 md:flex-row md:items-center md:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-amber-600">
              Church Leadership
            </p>

            <h1 className="mt-2 text-3xl font-bold text-blue-900">
              {getDashboardTitle(
                data?.leaderRole
              )}
            </h1>

            <p className="mt-2 text-slate-600">
              Welcome,{' '}
              {profile?.full_name ||
                'Church Leader'}
            </p>
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            className="w-fit rounded-md border border-blue-900 px-5 py-3 font-semibold text-blue-900 transition hover:bg-blue-50"
          >
            Sign Out
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl p-6 md:p-8">
        <section className="rounded-xl border border-blue-200 bg-blue-50 p-6">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-700">
            Assigned Local Unit
          </p>

          <h2 className="mt-2 text-2xl font-bold text-blue-900">
            {data?.localUnitName ||
              'Unit not assigned'}
          </h2>

          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-700">
            <p>
              Unit type:{' '}
              <strong>
                {formatValue(
                  data?.localUnitType
                )}
              </strong>
            </p>

            <p>
              Area:{' '}
              <strong>
                {data?.areaName ||
                  'Not available'}
              </strong>
            </p>

            <p>
              Calling:{' '}
              <strong>
                {formatValue(
                  data?.leaderRole
                )}
              </strong>
            </p>
          </div>
        </section>

        <section className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <SummaryCard
            label="Waiting for Endorsement"
            value={data?.total || 0}
            description="LTC-approved candidates assigned to your unit"
            colour="amber"
          />

          <SummaryCard
            label="Assigned Unit"
            value={
              data?.localUnitType === 'ward'
                ? 'Ward'
                : data?.localUnitType ===
                    'branch'
                  ? 'Branch'
                  : 'Unknown'
            }
            description={
              data?.localUnitName ||
              'No local unit assigned'
            }
            colour="blue"
          />

          <SummaryCard
            label="Leader Role"
            value={formatValue(
              data?.leaderRole
            )}
            description="Your active endorsement responsibility"
            colour="green"
          />
        </section>

        <section className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-4 border-b border-slate-200 p-6 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl font-bold text-blue-900">
                Candidate Endorsement Queue
              </h2>

              <p className="mt-1 text-sm text-slate-600">
                Review candidates from your
                assigned ward or branch.
              </p>
            </div>

            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="w-fit rounded-md border border-blue-900 px-4 py-2 text-sm font-semibold text-blue-900 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isFetching
                ? 'Refreshing...'
                : 'Refresh Queue'}
            </button>
          </div>

          {applications.length === 0 ? (
            <div className="p-10 text-center">
              <h3 className="font-bold text-slate-800">
                No candidates waiting
              </h3>

              <p className="mt-2 text-sm text-slate-600">
                There are currently no
                LTC-approved applications assigned
                to your ward or branch.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {applications.map(
                (application) => (
                  <CandidateQueueItem
                    key={application.id}
                    application={
                      application
                    }
                  />
                )
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function CandidateQueueItem({
  application,
}) {
  return (
    <article className="flex flex-col justify-between gap-5 p-6 lg:flex-row lg:items-center">
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="text-lg font-bold text-slate-900">
            {application.candidate_name ||
              'Unknown candidate'}
          </h3>

          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
            Pending Local Endorsement
          </span>
        </div>

        <div className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2 lg:grid-cols-3">
          <p>
            Application:{' '}
            <strong className="text-slate-800">
              {application.application_number ||
                'Not assigned'}
            </strong>
          </p>

          <p>
            Intake:{' '}
            <strong className="text-slate-800">
              {application.intake_name ||
                'Not available'}
            </strong>
          </p>

          <p>
            Submitted:{' '}
            <strong className="text-slate-800">
              {formatDate(
                application.submitted_at
              )}
            </strong>
          </p>

          <p>
            Email:{' '}
            <strong className="text-slate-800">
              {application.candidate_email ||
                'Not available'}
            </strong>
          </p>

          <p>
            Phone:{' '}
            <strong className="text-slate-800">
              {application.candidate_phone ||
                'Not available'}
            </strong>
          </p>

          <p>
            Membership number:{' '}
            <strong className="text-slate-800">
              {
                application.membership_record_number ||
                'Not provided'
              }
            </strong>
          </p>
        </div>
      </div>

      <button
        type="button"
        disabled
        title="The review page is added in the next step"
        className="w-fit cursor-not-allowed rounded-md bg-blue-300 px-5 py-3 font-semibold text-white"
      >
        Review Candidate
      </button>
    </article>
  );
}

function SummaryCard({
  label,
  value,
  description,
  colour,
}) {
  const colours = {
    amber:
      'bg-amber-100 text-amber-800',
    blue:
      'bg-blue-100 text-blue-800',
    green:
      'bg-green-100 text-green-800',
  };

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">
        {label}
      </p>

      <p
        className={`mt-3 inline-flex rounded-lg px-3 py-1 text-2xl font-bold ${
          colours[colour]
        }`}
      >
        {value}
      </p>

      <p className="mt-3 text-sm text-slate-600">
        {description}
      </p>
    </article>
  );
}

function PageMessage({
  message,
  error = false,
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div
        className={
          error
            ? 'rounded-lg border border-red-200 bg-red-50 p-5 text-red-700'
            : 'rounded-lg bg-white p-5 text-slate-600 shadow'
        }
      >
        {message}
      </div>
    </main>
  );
}

function getDashboardTitle(role) {
  if (role === 'bishop') {
    return 'Bishop Dashboard';
  }

  if (role === 'branch_president') {
    return 'Branch President Dashboard';
  }

  return 'Local Leader Dashboard';
}

function formatValue(value) {
  if (!value) {
    return 'Not available';
  }

  return String(value)
    .split('_')
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1)
    )
    .join(' ');
}

function formatDate(value) {
  if (!value) {
    return 'Not available';
  }

  return new Intl.DateTimeFormat(
    'en-NG',
    {
      dateStyle: 'medium',
      timeStyle: 'short',
    }
  ).format(new Date(value));
}