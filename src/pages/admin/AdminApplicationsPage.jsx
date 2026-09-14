import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import { Link } from 'react-router-dom';

import AdminLayout from '../../layouts/AdminLayout';

import {
  useAdminApplicationQueue,
} from '../../hooks/useAdminApplications';

const statusOptions = [
  {
    value: 'all',
    label: 'All Statuses',
  },
  {
    value: 'pending_ltc_review',
    label: 'Pending LTC Review',
  },
  {
    value: 'correction_required',
    label: 'Correction Required',
  },
  {
    value: 'pending_local_endorsement',
    label: 'Pending Local Endorsement',
  },
  {
    value: 'pending_final_endorsement',
    label: 'Pending Final Endorsement',
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
  {
    value: 'rejected',
    label: 'Rejected',
  },
  {
    value: 'withdrawn',
    label: 'Withdrawn',
  },
];

export default function AdminApplicationsPage() {
  const {
    data: applications = [],
    isLoading,
    isFetching,
    error,
    refetch,
  } = useAdminApplicationQueue();

  const [search, setSearch] =
    useState('');

  const [
    statusFilter,
    setStatusFilter,
  ] = useState('all');

  const [
    selectedApplicationId,
    setSelectedApplicationId,
  ] = useState(null);

  const filteredApplications =
    useMemo(() => {
      const searchValue =
        search.trim().toLowerCase();

      return applications.filter(
        (application) => {
          const candidate =
            application.candidate_profiles;

          const profile =
            candidate?.profiles;

          const searchableText = [
            profile?.full_name,
            profile?.email,
            application.application_number,
            candidate?.local_unit_name,
            candidate?.ecclesiastical_area_name,
            application.admission_intakes
              ?.name,
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
            application.status ===
              statusFilter;

          return (
            matchesSearch &&
            matchesStatus
          );
        }
      );
    }, [
      applications,
      search,
      statusFilter,
    ]);

  useEffect(() => {
    if (
      filteredApplications.length === 0
    ) {
      setSelectedApplicationId(null);
      return;
    }

    const selectedStillExists =
      filteredApplications.some(
        (application) =>
          application.id ===
          selectedApplicationId
      );

    if (!selectedStillExists) {
      setSelectedApplicationId(
        filteredApplications[0].id
      );
    }
  }, [
    filteredApplications,
    selectedApplicationId,
  ]);

  const selectedApplication =
    filteredApplications.find(
      (application) =>
        application.id ===
        selectedApplicationId
    ) || null;

  return (
    <AdminLayout
      title="Applications"
      description="Review applications and monitor each candidate’s admission progress."
    >
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-5">
          <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
            <div>
              <h2 className="text-xl font-bold text-blue-900">
                Application Queue
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Search, filter and select an
                application for review.
              </p>
            </div>

            <div className="flex flex-col gap-3 md:flex-row">
              <label>
                <span className="sr-only">
                  Search applications
                </span>

                <input
                  type="search"
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  placeholder="Search candidate..."
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100 md:w-72"
                />
              </label>

              <label>
                <span className="sr-only">
                  Filter by status
                </span>

                <select
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(
                      event.target.value
                    )
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm md:w-64"
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

        <div className="grid min-h-[500px] xl:grid-cols-[minmax(0,1fr)_400px]">
          <div className="border-slate-200 xl:border-r">
            {isLoading && (
              <PageNotice message="Loading applications..." />
            )}

            {error && (
              <PageNotice
                error
                message={error.message}
              />
            )}

            {!isLoading &&
              !error &&
              filteredApplications.length ===
                0 && (
                <PageNotice message="No applications match the selected filter." />
              )}

            {!isLoading &&
              !error &&
              filteredApplications.length >
                0 && (
                <div className="divide-y divide-slate-200">
                  {filteredApplications.map(
                    (application) => (
                      <ApplicationRow
                        key={application.id}
                        application={
                          application
                        }
                        selected={
                          application.id ===
                          selectedApplicationId
                        }
                        onSelect={() =>
                          setSelectedApplicationId(
                            application.id
                          )
                        }
                      />
                    )
                  )}
                </div>
              )}
          </div>

          <ApplicationSummaryPanel
            application={
              selectedApplication
            }
          />
        </div>

        <div className="border-t border-slate-200 px-5 py-4 text-sm text-slate-500">
          Showing{' '}
          {filteredApplications.length} of{' '}
          {applications.length} applications
        </div>
      </section>
    </AdminLayout>
  );
}

function ApplicationRow({
  application,
  selected,
  onSelect,
}) {
  const candidate =
    application.candidate_profiles;

  const profile =
    candidate?.profiles;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full p-5 text-left transition ${
        selected
          ? 'bg-blue-50'
          : 'bg-white hover:bg-slate-50'
      }`}
    >
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="font-bold text-slate-900">
            {profile?.full_name ||
              'Unknown candidate'}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            {application.application_number ||
              'Application number pending'}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {candidate?.local_unit_name ||
              'Church unit not provided'}
            {candidate
              ?.ecclesiastical_area_name
              ? ` · ${candidate.ecclesiastical_area_name}`
              : ''}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Submitted:{' '}
            {formatDate(
              application.submitted_at
            )}
          </p>
        </div>

        <StatusBadge
          status={application.status}
        />
      </div>
    </button>
  );
}

function ApplicationSummaryPanel({
  application,
}) {
  if (!application) {
    return (
      <aside className="bg-slate-50 p-6">
        <h2 className="text-xl font-bold text-blue-900">
          Application Summary
        </h2>

        <p className="mt-4 text-sm text-slate-500">
          Select an application from the
          queue.
        </p>
      </aside>
    );
  }

  const candidate =
    application.candidate_profiles;

  const profile =
    candidate?.profiles;

  return (
    <aside className="bg-slate-50 p-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
        Selected Application
      </p>

      <h2 className="mt-2 text-xl font-bold text-blue-900">
        {profile?.full_name ||
          'Unknown candidate'}
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        {application.application_number ||
          'Number pending'}
      </p>

      <div className="mt-5 space-y-4">
        <SummaryItem
          label="Email"
          value={profile?.email}
        />

        <SummaryItem
          label="Phone"
          value={profile?.phone}
        />

        <SummaryItem
          label="Intake"
          value={
            application
              .admission_intakes?.name
          }
        />

        <SummaryItem
          label="Stake or District"
          value={
            candidate
              ?.ecclesiastical_area_name
          }
        />

        <SummaryItem
          label="Ward or Branch"
          value={
            candidate?.local_unit_name
          }
        />

        <SummaryItem
          label="Progress"
          value={`${
            application.completion_percentage ??
            0
          }%`}
        />

        <SummaryItem
          label="Status"
          value={getStatusLabel(
            application.status
          )}
        />
      </div>

      <Link
        to={`/admin/applications/${application.id}`}
        className="mt-6 block rounded-lg bg-blue-900 px-5 py-3 text-center font-semibold text-white hover:bg-blue-800"
      >
        {application.status ===
        'pending_ltc_review'
          ? 'Review Application'
          : 'View Application'}
      </Link>
    </aside>
  );
}

function SummaryItem({
  label,
  value,
}) {
  return (
    <div className="border-b border-slate-200 pb-3 last:border-0">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-sm font-medium text-slate-800">
        {value || 'Not provided'}
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
      className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${
        colors[status] ||
        'bg-slate-100 text-slate-700'
      }`}
    >
      {getStatusLabel(status)}
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
      (item) => item.value === status
    );

  return (
    option?.label ||
    status ||
    'Unknown'
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