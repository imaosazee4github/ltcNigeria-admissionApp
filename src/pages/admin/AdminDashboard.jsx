import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import { Link } from 'react-router-dom';

import AdminLayout from '../../layouts/AdminLayout';
import { useAdminApplicationQueue } from '../../hooks/useAdminApplications';

export default function AdminDashboard() {
  const {
    data: applications = [],
    isLoading,
    error,
  } = useAdminApplicationQueue();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] =
    useState('all');

  const [
    selectedApplicationId,
    setSelectedApplicationId,
  ] = useState(null);

  const filteredApplications = useMemo(() => {
    const searchValue =
      search.trim().toLowerCase();

    return applications.filter(
      (application) => {
        const candidate =
          application.candidate_profiles;

        const profile = candidate?.profiles;

        const matchesSearch =
          !searchValue ||
          profile?.full_name
            ?.toLowerCase()
            .includes(searchValue) ||
          profile?.email
            ?.toLowerCase()
            .includes(searchValue) ||
          application.application_number
            ?.toLowerCase()
            .includes(searchValue);

        const matchesStatus =
          statusFilter === 'all' ||
          application.status ===
            statusFilter;

        return (
          matchesSearch && matchesStatus
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

  const pendingReviewCount =
    applications.filter(
      (application) =>
        application.status ===
        'pending_ltc_review'
    ).length;

  const correctionCount =
    applications.filter(
      (application) =>
        application.status ===
        'correction_required'
    ).length;

  const localEndorsementCount =
    applications.filter(
      (application) =>
        application.status ===
        'pending_local_endorsement'
    ).length;

  return (
    <AdminLayout
      title="Admissions Processing Queue"
      description="Review applications, verify documents and monitor endorsement progress."
    >
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Total Applications"
          value={applications.length}
          color="blue"
        />

        <SummaryCard
          label="Pending LTC Review"
          value={pendingReviewCount}
          color="amber"
        />

        <SummaryCard
          label="Correction Required"
          value={correctionCount}
          color="red"
        />

        <SummaryCard
          label="Local Endorsement"
          value={localEndorsementCount}
          color="green"
        />
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_400px]">
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div>
                <h2 className="text-xl font-bold text-blue-900">
                  Application Queue
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Select an application to view its
                  processing status.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="search"
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  placeholder="Search candidate..."
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
                />

                <select
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(
                      event.target.value
                    )
                  }
                  className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                >
                  <option value="all">
                    All statuses
                  </option>

                  <option value="pending_ltc_review">
                    Pending LTC Review
                  </option>

                  <option value="correction_required">
                    Correction Required
                  </option>

                  <option value="pending_local_endorsement">
                    Local Endorsement
                  </option>

                  <option value="pending_area_endorsement">
                    Final Endorsement
                  </option>

                  <option value="approved">
                    Approved
                  </option>

                  <option value="rejected">
                    Rejected
                  </option>
                </select>
              </div>
            </div>
          </div>

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
          application={selectedApplication}
        />
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

  const profile = candidate?.profiles;

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
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <p className="font-bold text-slate-900">
            {profile?.full_name ||
              'Unknown candidate'}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            {application.application_number ||
              'Application number not assigned'}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {candidate?.local_unit_name ||
              'Church unit not provided'}
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
      <aside className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-blue-900">
          Application Verification
        </h2>

        <p className="mt-4 text-sm text-slate-500">
          Select an application from the queue.
        </p>
      </aside>
    );
  }

  const candidate =
    application.candidate_profiles;

  const profile = candidate?.profiles;

  return (
    <aside className="h-fit rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
        Application Verification
      </p>

      <h2 className="mt-2 text-xl font-bold text-blue-900">
        {profile?.full_name ||
          'Unknown candidate'}
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        {application.application_number}
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
          label="Stake or District"
          value={
            candidate?.ecclesiastical_area_name
          }
        />

        <SummaryItem
          label="Ward or Branch"
          value={candidate?.local_unit_name}
        />

        <SummaryItem
          label="Progress"
          value={`${application.completion_percentage}%`}
        />

        <SummaryItem
          label="Status"
          value={formatStatus(
            application.status
          )}
        />
      </div>

      <Link
        to={`/admin/applications/${application.id}`}
        className="mt-6 block rounded-md bg-blue-900 px-5 py-3 text-center font-semibold text-white hover:bg-blue-800"
      >
        {application.status ===
        'pending_ltc_review'
          ? 'Review Application'
          : 'View Application'}
      </Link>

      {application.status ===
        'pending_local_endorsement' && (
        <div className="mt-4 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800">
          LTC review completed. Church-unit
          verification and local leader assignment
          are next.
        </div>
      )}
    </aside>
  );
}

function SummaryCard({
  label,
  value,
  color,
}) {
  const colors = {
    blue: 'border-blue-200 bg-blue-50 text-blue-900',
    amber:
      'border-amber-200 bg-amber-50 text-amber-800',
    red: 'border-red-200 bg-red-50 text-red-700',
    green:
      'border-green-200 bg-green-50 text-green-700',
  };

  return (
    <article
      className={`rounded-xl border p-5 ${
        colors[color] || colors.blue
      }`}
    >
      <p className="text-sm font-medium">
        {label}
      </p>

      <p className="mt-2 text-3xl font-bold">
        {value}
      </p>
    </article>
  );
}

function SummaryItem({
  label,
  value,
}) {
  return (
    <div className="border-b border-slate-100 pb-3 last:border-0">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-sm font-medium text-slate-800">
        {value || 'Not provided'}
      </p>
    </div>
  );
}

function StatusBadge({ status }) {
  const colors = {
    pending_ltc_review:
      'bg-amber-100 text-amber-800',

    correction_required:
      'bg-red-100 text-red-700',

    pending_local_endorsement:
      'bg-blue-100 text-blue-800',

    pending_area_endorsement:
      'bg-purple-100 text-purple-800',

    approved:
      'bg-green-100 text-green-700',

    admitted:
      'bg-green-100 text-green-700',

    rejected:
      'bg-red-100 text-red-700',
  };

  return (
    <span
      className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${
        colors[status] ||
        'bg-slate-100 text-slate-700'
      }`}
    >
      {formatStatus(status)}
    </span>
  );
}

function formatStatus(status) {
  if (!status) {
    return '';
  }

  return status
    .split('_')
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1)
    )
    .join(' ');
}

function PageNotice({
  message,
  error = false,
}) {
  return (
    <div
      className={`p-8 text-center ${
        error
          ? 'bg-red-50 text-red-700'
          : 'text-slate-500'
      }`}
    >
      {message}
    </div>
  );
}