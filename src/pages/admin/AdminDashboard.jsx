import { Link } from 'react-router-dom';

import AdminLayout from '../../layouts/AdminLayout';

import {
  useAdminDashboardSummary,
} from '../../hooks/useAdminApplications';

export default function AdminDashboard() {
  const {
    data: summary,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useAdminDashboardSummary();

  if (isLoading) {
    return (
      <AdminLayout
        title="Admissions Dashboard"
        description="Monitor applications, endorsements and admitted students."
      >
        <PageNotice message="Loading admissions dashboard..." />
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout
        title="Admissions Dashboard"
        description="Monitor applications, endorsements and admitted students."
      >
        <PageNotice
          error
          message={
            error.message ||
            'Unable to load the dashboard.'
          }
        />
      </AdminLayout>
    );
  }

  const recentApplications =
    summary?.recentApplications || [];

  const actionRequired =
    (summary?.pendingLtcReview || 0) +
    (summary?.correctionRequired || 0);

  return (
    <AdminLayout
      title="Admissions Dashboard"
      description="Monitor applications, endorsements and admitted students."
    >
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="rounded-lg border border-blue-900 px-5 py-3 text-sm font-semibold text-blue-900 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isFetching
            ? 'Refreshing...'
            : 'Refresh Dashboard'}
        </button>
      </div>

      <section className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-6">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">
              Admissions Overview
            </p>

            <h2 className="mt-2 text-2xl font-bold text-blue-900">
              {summary?.total || 0}{' '}
              Submitted Application
              {summary?.total === 1
                ? ''
                : 's'}
            </h2>

            <p className="mt-2 text-sm text-slate-600">
              {actionRequired > 0
                ? `${actionRequired} application${
                    actionRequired === 1
                      ? ''
                      : 's'
                  } currently require attention.`
                : 'There are no applications requiring immediate LTC Admin action.'}
            </p>
          </div>

          <Link
            to="/admin/applications"
            className="inline-flex items-center justify-center rounded-lg bg-blue-900 px-6 py-3 font-semibold text-white transition hover:bg-blue-800"
          >
            Open Applications
          </Link>
        </div>
      </section>

      <section className="mt-6">
        <SectionHeading
          title="Action Required"
          description="Applications currently requiring LTC Admin attention."
        />

        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <DashboardCard
            label="Pending LTC Review"
            value={
              summary?.pendingLtcReview ||
              0
            }
            description="Submitted applications waiting for review"
            color="amber"
            path="/admin/applications"
          />

          <DashboardCard
            label="Correction Required"
            value={
              summary?.correctionRequired ||
              0
            }
            description="Applications returned to candidates"
            color="red"
            path="/admin/applications"
          />

          <DashboardCard
            label="Admission Completed"
            value={
              summary?.admissionCompleted ||
              0
            }
            description="Ready for room processing"
            color="green"
            path="/admin/applications"
          />

          <DashboardCard
            label="Awaiting Room"
            value={
              summary?.awaitingRoom || 0
            }
            description="Admitted students without rooms"
            color="cyan"
            path="/admin/applications"
          />
        </div>
      </section>

      <section className="mt-8">
        <SectionHeading
          title="Endorsement Progress"
          description="Monitor applications currently with Church leaders."
        />

        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <DashboardCard
            label="Pending Local Endorsement"
            value={
              summary
                ?.pendingLocalEndorsement ||
              0
            }
            description="Waiting for Bishop or Branch President"
            color="blue"
            path="/admin/applications"
          />

          <DashboardCard
            label="Pending Final Endorsement"
            value={
              summary
                ?.pendingFinalEndorsement ||
              0
            }
            description="Waiting for Stake or District President"
            color="purple"
            path="/admin/applications"
          />

          <DashboardCard
            label="Admitted Students"
            value={
              summary?.admittedStudents ||
              0
            }
            description="Completed admission process"
            color="green"
            path="/admin/applications"
          />

          <DashboardCard
            label="Rooms Allocated"
            value={
              summary?.roomAllocated || 0
            }
            description="Students with assigned rooms"
            color="cyan"
            path="/admin/applications"
          />
        </div>
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <RecentApplications
          applications={
            recentApplications
          }
        />

        <QuickActions />
      </section>
    </AdminLayout>
  );
}

function DashboardCard({
  label,
  value,
  description,
  color,
  path,
}) {
  const colors = {
    amber: {
      border: 'border-amber-200',
      background: 'bg-amber-50',
      value: 'text-amber-800',
    },

    red: {
      border: 'border-red-200',
      background: 'bg-red-50',
      value: 'text-red-700',
    },

    blue: {
      border: 'border-blue-200',
      background: 'bg-blue-50',
      value: 'text-blue-800',
    },

    purple: {
      border: 'border-purple-200',
      background: 'bg-purple-50',
      value: 'text-purple-800',
    },

    green: {
      border: 'border-emerald-200',
      background: 'bg-emerald-50',
      value: 'text-emerald-800',
    },

    cyan: {
      border: 'border-cyan-200',
      background: 'bg-cyan-50',
      value: 'text-cyan-800',
    },
  };

  const selectedColor =
    colors[color] || colors.blue;

  return (
    <Link
      to={path}
      className={`rounded-xl border p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${selectedColor.border} ${selectedColor.background}`}
    >
      <p className="text-sm font-semibold text-slate-700">
        {label}
      </p>

      <p
        className={`mt-3 text-3xl font-bold ${selectedColor.value}`}
      >
        {value}
      </p>

      <p className="mt-3 text-xs leading-5 text-slate-600">
        {description}
      </p>
    </Link>
  );
}

function RecentApplications({
  applications,
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <div>
          <h2 className="text-xl font-bold text-blue-900">
            Recent Applications
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Most recently submitted
            applications.
          </p>
        </div>

        <Link
          to="/admin/applications"
          className="text-sm font-semibold text-blue-800 hover:underline"
        >
          View all
        </Link>
      </div>

      {applications.length === 0 ? (
        <div className="p-10 text-center text-sm text-slate-500">
          No submitted applications are
          available.
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {applications.map(
            (application) => {
              const candidate =
                application
                  .candidate_profiles;

              const profile =
                candidate?.profiles;

              return (
                <article
                  key={application.id}
                  className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center"
                >
                  <div>
                    <p className="font-bold text-slate-900">
                      {profile?.full_name ||
                        'Unknown candidate'}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {application.application_number ||
                        'Application number pending'}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {application
                        .admission_intakes
                        ?.name ||
                        'Current intake'}
                      {' · '}
                      {formatDate(
                        application.submitted_at
                      )}
                    </p>
                  </div>

                  <div className="flex flex-col items-start gap-2 sm:items-end">
                    <StatusBadge
                      status={
                        application.status
                      }
                    />

                    <Link
                      to={`/admin/applications/${application.id}`}
                      className="text-sm font-semibold text-blue-800 hover:underline"
                    >
                      View application
                    </Link>
                  </div>
                </article>
              );
            }
          )}
        </div>
      )}
    </section>
  );
}

function QuickActions() {
  return (
    <section className="h-fit rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-blue-900">
        Quick Actions
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        Common admission-management tasks.
      </p>

      <div className="mt-6 space-y-3">
        <QuickAction
          title="Review Applications"
          description="Open the processing queue"
          path="/admin/applications"
          primary
        />

        <QuickAction
          title="Invite Area Leader"
          description="Invite a Stake or District President"
          path="/admin/leader-invitations"
        />

        <ComingSoonAction
          title="Track Endorsements"
          description="Monitor Church leader decisions"
        />

        <ComingSoonAction
          title="Manage Rooms"
          description="Allocate student accommodation"
        />
      </div>
    </section>
  );
}

function QuickAction({
  title,
  description,
  path,
  primary = false,
}) {
  return (
    <Link
      to={path}
      className={`block rounded-lg border p-4 transition ${
        primary
          ? 'border-blue-900 bg-blue-900 text-white hover:bg-blue-800'
          : 'border-slate-200 text-slate-800 hover:border-blue-300 hover:bg-blue-50'
      }`}
    >
      <p className="font-semibold">
        {title}
      </p>

      <p
        className={`mt-1 text-xs ${
          primary
            ? 'text-blue-100'
            : 'text-slate-500'
        }`}
      >
        {description}
      </p>
    </Link>
  );
}

function ComingSoonAction({
  title,
  description,
}) {
  return (
    <div className="cursor-not-allowed rounded-lg border border-slate-200 bg-slate-50 p-4 text-slate-400">
      <div className="flex justify-between gap-3">
        <p className="font-semibold">
          {title}
        </p>

        <span className="text-[10px] font-bold uppercase">
          Updating Soon
        </span>
      </div>

      <p className="mt-1 text-xs">
        {description}
      </p>
    </div>
  );
}

function SectionHeading({
  title,
  description,
}) {
  return (
    <div>
      <h2 className="text-xl font-bold text-blue-900">
        {title}
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        {description}
      </p>
    </div>
  );
}

function StatusBadge({
  status,
}) {
  const colors = {
    pending_ltc_review:
      'bg-amber-100 text-amber-800',

    correction_required:
      'bg-red-100 text-red-700',

    pending_local_endorsement:
      'bg-blue-100 text-blue-800',

    pending_final_endorsement:
      'bg-purple-100 text-purple-800',

    admission_completed:
      'bg-emerald-100 text-emerald-800',

    awaiting_room:
      'bg-cyan-100 text-cyan-800',

    room_allocated:
      'bg-green-100 text-green-800',

    rejected:
      'bg-red-100 text-red-700',

    withdrawn:
      'bg-slate-200 text-slate-700',
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
        colors[status] ||
        'bg-slate-100 text-slate-700'
      }`}
    >
      {formatStatus(status)}
    </span>
  );
}

function PageNotice({
  message,
  error = false,
}) {
  return (
    <div
      role={error ? 'alert' : 'status'}
      className={`rounded-xl border p-6 ${
        error
          ? 'border-red-200 bg-red-50 text-red-700'
          : 'border-blue-200 bg-blue-50 text-blue-900'
      }`}
    >
      {message}
    </div>
  );
}

function formatStatus(status) {
  if (!status) {
    return 'Unknown';
  }

  return status
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}

function formatDate(value) {
  if (!value) {
    return 'Not submitted';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Not available';
  }

  return new Intl.DateTimeFormat(
    'en-NG',
    {
      dateStyle: 'medium',
    }
  ).format(date);
}