import {
  useMemo,
  useState,
} from 'react';

import {
  Link,
} from 'react-router-dom';

import AdminLayout from '../../layouts/AdminLayout';

import {
  useAdminEndorsementTracking,
} from '../../hooks/useAdminEndorsements';

const statusOptions = [
  {
    value: 'all',
    label: 'All Endorsement Stages',
  },
  {
    value: 'pending_local_endorsement',
    label: 'Waiting for Local Leader',
  },
  {
    value: 'pending_final_endorsement',
    label: 'Waiting for Area President',
  },
  {
    value: 'correction_required',
    label: 'Returned for Correction',
  },
  {
    value: 'rejected',
    label: 'Rejected',
  },
  {
    value: 'admission_completed',
    label: 'Admission Completed',
  },
  {
    value: 'awaiting_room',
    label: 'Awaiting Room',
  },
  {
    value: 'room_allocated',
    label: 'Room Allocated',
  },
];

export default function AdminEndorsementsPage() {
  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useAdminEndorsementTracking();

  const [search, setSearch] =
    useState('');

  const [
    statusFilter,
    setStatusFilter,
  ] = useState('all');

  const [
    warningFilter,
    setWarningFilter,
  ] = useState('all');

  const applications =
    data?.applications || [];

  const filteredApplications =
    useMemo(() => {
      const searchValue =
        search.trim().toLowerCase();

      return applications.filter(
        (application) => {
          const searchableText = [
            application.candidate_name,
            application.candidate_email,
            application.application_number,
            application.local_unit_name,
            application.area_name,
            application.local_leader_name,
            application.area_leader_name,
            application.intake_name,
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();

          const matchesSearch =
            !searchValue ||
            searchableText.includes(
              searchValue
            );

          const matchesStatus =
            statusFilter === 'all' ||
            application.application_status ===
              statusFilter;

          const matchesWarning =
            warningFilter === 'all' ||
            (warningFilter === 'warnings'
              ? Boolean(
                  application.warning
                )
              : !application.warning);

          return (
            matchesSearch &&
            matchesStatus &&
            matchesWarning
          );
        }
      );
    }, [
      applications,
      search,
      statusFilter,
      warningFilter,
    ]);

  return (
    <AdminLayout
      title="Endorsement Tracking"
      description="Monitor local and final endorsement progress across candidate applications."
    >
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Waiting for Local Leader"
          value={data?.pendingLocal || 0}
          color="blue"
        />

        <SummaryCard
          label="Waiting for Area President"
          value={data?.pendingFinal || 0}
          color="purple"
        />

        <SummaryCard
          label="Final Endorsements Completed"
          value={data?.completed || 0}
          color="green"
        />

        <SummaryCard
          label="Requires Attention"
          value={data?.warnings || 0}
          color="red"
        />
      </section>

      <section className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-5">
          <div className="flex flex-col justify-between gap-5">
            <div>
              <h2 className="text-xl font-bold text-blue-900">
                Candidate Endorsement Progress
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                This page is for tracking only.
                Endorsement decisions remain
                with the assigned Church
                leaders.
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(260px,1fr)_240px_210px_auto]">
              <label>
                <span className="sr-only">
                  Search endorsements
                </span>

                <input
                  type="search"
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  placeholder="Search candidate, unit or leader..."
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
                />
              </label>

              <label>
                <span className="sr-only">
                  Filter by stage
                </span>

                <select
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(
                      event.target.value
                    )
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm"
                >
                  {statusOptions.map(
                    (option) => (
                      <option
                        key={option.value}
                        value={option.value}
                      >
                        {option.label}
                      </option>
                    )
                  )}
                </select>
              </label>

              <label>
                <span className="sr-only">
                  Filter warnings
                </span>

                <select
                  value={warningFilter}
                  onChange={(event) =>
                    setWarningFilter(
                      event.target.value
                    )
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm"
                >
                  <option value="all">
                    All Records
                  </option>

                  <option value="warnings">
                    Requires Attention
                  </option>

                  <option value="clear">
                    No Warning
                  </option>
                </select>
              </label>

              <button
                type="button"
                onClick={() => refetch()}
                disabled={isFetching}
                className="rounded-lg border border-blue-900 px-5 py-3 text-sm font-semibold text-blue-900 hover:bg-blue-50 disabled:opacity-50"
              >
                {isFetching
                  ? 'Refreshing...'
                  : 'Refresh'}
              </button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <PageNotice message="Loading endorsement tracking..." />
        ) : error ? (
          <PageNotice
            error
            message={error.message}
          />
        ) : filteredApplications.length ===
          0 ? (
          <PageNotice message="No endorsement records match the selected filters." />
        ) : (
          <>
            <div className="space-y-4 p-4 lg:hidden">
              {filteredApplications.map(
                (application) => (
                  <MobileCard
                    key={application.id}
                    application={
                      application
                    }
                  />
                )
              )}
            </div>

            <div className="hidden overflow-x-auto lg:block">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <Heading>
                      Candidate
                    </Heading>

                    <Heading>
                      Church Unit
                    </Heading>

                    <Heading>
                      Local Endorsement
                    </Heading>

                    <Heading>
                      Final Endorsement
                    </Heading>

                    <Heading>
                      Current Stage
                    </Heading>

                    <Heading>
                      Action
                    </Heading>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredApplications.map(
                    (application) => (
                      <EndorsementRow
                        key={
                          application.id
                        }
                        application={
                          application
                        }
                      />
                    )
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        <div className="border-t border-slate-200 px-5 py-4 text-sm text-slate-500">
          Showing{' '}
          {filteredApplications.length} of{' '}
          {applications.length} records
        </div>
      </section>
    </AdminLayout>
  );
}

function EndorsementRow({
  application,
}) {
  return (
    <tr className="hover:bg-slate-50">
      <td className="px-5 py-4 align-top">
        <p className="font-semibold text-slate-900">
          {application.candidate_name ||
            'Unknown candidate'}
        </p>

        <p className="mt-1 text-sm text-slate-500">
          {application.application_number ||
            'Number pending'}
        </p>

        <p className="mt-1 text-xs text-slate-400">
          {application.intake_name}
        </p>
      </td>

      <td className="px-5 py-4 align-top">
        <p className="text-sm font-medium text-slate-800">
          {application.local_unit_name ||
            'No local unit'}
        </p>

        <p className="mt-1 text-xs text-slate-500">
          {application.area_name ||
            'No assigned area'}
        </p>
      </td>

      <td className="px-5 py-4 align-top">
        <DecisionBadge
          value={
            application.local_endorsement_decision
          }
        />

        <p className="mt-2 text-xs text-slate-500">
          {application.local_leader_name ||
            'No active local leader'}
        </p>

        <p className="mt-1 text-xs text-slate-400">
          {formatDate(
            application.local_endorsed_at
          )}
        </p>
      </td>

      <td className="px-5 py-4 align-top">
        <DecisionBadge
          value={
            application.final_endorsement_decision
          }
        />

        <p className="mt-2 text-xs text-slate-500">
          {application.area_leader_name ||
            'No active area president'}
        </p>

        <p className="mt-1 text-xs text-slate-400">
          {formatDate(
            application.final_endorsed_at
          )}
        </p>
      </td>

      <td className="px-5 py-4 align-top">
        <StatusBadge
          status={
            application.application_status
          }
        />

        {isWaitingStatus(
          application.application_status
        ) && (
          <p className="mt-2 text-xs text-slate-500">
            {application.days_waiting || 0}{' '}
            day
            {application.days_waiting === 1
              ? ''
              : 's'}{' '}
            waiting
          </p>
        )}

        {application.warning && (
          <WarningBadgeBadge
            warning={
              application.warning
            }
          />
        )}
      </td>

      <td className="px-5 py-4 align-top">
        <Link
          to={`/admin/applications/${application.id}`}
          className="text-sm font-semibold text-blue-800 hover:underline"
        >
          View Application
        </Link>
      </td>
    </tr>
  );
}

function MobileCard({
  application,
}) {
  return (
    <article className="rounded-xl border border-slate-200 p-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <h3 className="font-bold text-slate-900">
            {application.candidate_name ||
              'Unknown candidate'}
          </h3>

          <p className="mt-1 text-sm text-slate-500">
Less number of candidates are being endorsed. If there is a page that says final endorsements, it means that the system is managing the process. A page that says final endorsements is not responsible for every endorsement. Keep the language consistent.

# Endorsement tracking: a label indicating that the admin is viewing the process.

# Final endorsement page: a page that allows a church leader to make a decision. 

# Candidate status: A record of where the application is in the process.

# Application status: a record of the state of the application.

# Endorsement status: a record of the decision made at the endorsement stage.
          </p>

          <p className="mt-1 text-xs text-slate-400">
            {application.application_number}
          </p>
        </div>

        <StatusBadge
          status={
            application.application_status
          }
        />
      </div>

      <dl className="mt-5 space-y-4">
        <MobileDetail
          label="Local Unit"
          value={
            application.local_unit_name
          }
        />

        <MobileDetail
          label="Stake or District"
          value={application.area_name}
        />

        <MobileDetail
          label="Local Leader"
          value={
            application.local_leader_name ||
            'Not assigned'
          }
        />

        <MobileDetail
          label="Local Decision"
          value={formatDecision(
            application.local_endorsement_decision
          )}
        />

        <MobileDetail
          label="Area President"
          value={
            application.area_leader_name ||
            'Not assigned'
          }
        />

        <MobileDetail
          label="Final Decision"
          value={formatDecision(
            application.final_endorsement_decision
          )}
        />
      </dl>

      {application.warning && (
        <WarningBadge
          warning={
            application.warning
          }
        />
      )}

      <Link
        to={`/admin/applications/${application.id}`}
        className="mt-5 block rounded-lg bg-blue-900 px-5 py-3 text-center text-sm font-semibold text-white hover:bg-blue-800"
      >
        View Application
      </Link>
    </article>
  );
}

function SummaryCard({
  label,
  value,
  color,
}) {
  const colors = {
    blue:
      'border-blue-200 bg-blue-50 text-blue-800',

    purple:
      'border-purple-200 bg-purple-50 text-purple-800',

    green:
      'border-emerald-200 bg-emerald-50 text-emerald-800',

    red:
      'border-red-200 bg-red-50 text-red-700',
  };

  return (
    <article
      className={`rounded-xl border p-5 ${
        colors[color] || colors.blue
      }`}
    >
      <p className="text-sm font-semibold">
        {label}
      </p>

      <p className="mt-3 text-3xl font-bold">
        {value}
      </p>
    </article>
  );
}

function Heading({
  children,
}) {
  return (
    <th
      scope="col"
      className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
    >
      {children}
    </th>
  );
}

function MobileDetail({
  label,
  value,
}) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-sm text-slate-500">
        {label}
      </dt>

      <dd className="text-right text-sm font-semibold text-slate-800">
        {value || 'Not available'}
      </dd>
    </div>
  );
}

function DecisionBadge({
  value,
}) {
  if (!value) {
    return (
      <span className="text-sm text-slate-400">
        Not recorded
      </span>
    );
  }

  const colors = {
    endorsed:
      'bg-emerald-100 text-emerald-800',

    correction_required:
      'bg-amber-100 text-amber-800',

    rejected:
      'bg-red-100 text-red-700',
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
        colors[value] ||
        'bg-slate-100 text-slate-700'
      }`}
    >
      {formatDecision(value)}
    </span>
  );
}

function StatusBadge({
  status,
}) {
  const colors = {
    pending_local_endorsement:
      'bg-blue-100 text-blue-800',

    pending_final_endorsement:
      'bg-purple-100 text-purple-800',

    correction_required:
      'bg-amber-100 text-amber-800',

    rejected:
      'bg-red-100 text-red-700',

    admission_completed:
      'bg-emerald-100 text-emerald-800',

    awaiting_room:
      'bg-cyan-100 text-cyan-800',

    room_allocated:
      'bg-green-100 text-green-800',
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
        colors[status] ||
        'bg-slate-100 text-slate-700'
      }`}
    >
      {getStatusLabel(status)}
    </span>
  );
}

function WarningBadge({
  warning,
}) {
  const labels = {
    missing_local_unit:
      'Missing Local Unit',

    missing_local_leader:
      'No Active Local Leader',

    missing_area_president:
      'No Active Area President',

    delayed:
      'Endorsement Delayed',
  };

  return (
    <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
      {labels[warning] ||
        'Requires Attention'}
    </p>
  );
}

function PageNotice({
  message,
  error = false,
}) {
  return (
    <div
      role={error ? 'alert' : 'status'}
      className={`p-10 text-center ${
        error
          ? 'bg-red-50 text-red-700'
          : 'text-slate-500'
      }`}
    >
      {message}
    </div>
  );
}

function getStatusLabel(status) {
  const option =
    statusOptions.find(
      (item) =>
        item.value === status
    );

  return (
    option?.label ||
    formatText(status)
  );
}

function formatDecision(value) {
  if (!value) {
    return 'Not recorded';
  }

  const labels = {
    approved: 'Approved',
    endorsed: 'Endorsed',
    correction_required:
      'Correction Required',
    rejected: 'Rejected',
  };

  return (
    labels[value] ||
    formatText(value)
  );
}

function formatText(value) {
  if (!value) {
    return 'Not available';
  }

  return String(value)
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}

function formatDate(value) {
  if (!value) {
    return 'Not completed';
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

function isWaitingStatus(status) {
  return [
    'pending_local_endorsement',
    'pending_final_endorsement',
  ].includes(status);
}