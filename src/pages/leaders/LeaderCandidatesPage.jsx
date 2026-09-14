import { useState } from 'react';

import LeaderLayout from '../../layouts/LeaderLayout';

import { useAuth } from '../../hooks/useAuth';
import { useLeaderCandidates } from '../../hooks/useLeaderCandidates';

const statusLabels = {
  draft: 'Draft',
  pending_ltc_review: 'Pending LTC Review',
  correction_required: 'Correction Required',
  rejected: 'Rejected',
  pending_local_endorsement: 'Pending Local Endorsement',
  pending_final_endorsement: 'Pending Final Endorsement',
  admission_completed: 'Admission Completed',
  awaiting_room: 'Awaiting Room Assignment',
  room_allocated: 'Room Assigned',
  withdrawn: 'Withdrawn',
};

export default function LeaderCandidatesPage() {
  const { profile } = useAuth();

  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useLeaderCandidates(profile?.id);

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');

  const applications = data?.applications || [];

  const searchTerm = search.trim().toLowerCase();

  const filteredApplications = applications.filter(
    (application) => {
      const matchesStatus =
        status === 'all' ||
        application.status === status;

      const searchableText = [
        application.candidate_name,
        application.candidate_email,
        application.application_number,
        application.local_unit_name,
        application.intake_name,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return (
        matchesStatus &&
        searchableText.includes(searchTerm)
      );
    }
  );

  const pendingLocal = applications.filter(
    (application) =>
      application.status === 'pending_local_endorsement'
  ).length;

  const pendingFinal = applications.filter(
    (application) =>
      application.status === 'pending_final_endorsement'
  ).length;

  const admitted = applications.filter(
    (application) =>
      [
        'admission_completed',
        'awaiting_room',
        'room_allocated',
      ].includes(application.status)
  ).length;

  return (
    <LeaderLayout>
      <main className="p-5 md:p-8">
        <div className="mx-auto max-w-7xl">
          <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-amber-600">
                Church Leadership
              </p>

              <h1 className="mt-2 text-3xl font-bold text-blue-900">
                Candidates
              </h1>

              <p className="mt-2 text-slate-600">
                View candidate admission progress within
                your assigned Church unit or area.
              </p>
            </div>

            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="rounded-lg border border-blue-900 px-5 py-3 text-sm font-semibold text-blue-900 hover:bg-blue-50 disabled:opacity-50"
            >
              {isFetching ? 'Refreshing...' : 'Refresh'}
            </button>
          </header>

          {isLoading ? (
            <Notice message="Loading candidates..." />
          ) : error ? (
            <Notice
              error
              message={error.message}
            />
          ) : (
            <>
              <section className="mt-7 rounded-xl border border-blue-100 bg-blue-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">
                  Your Assigned Scope
                </p>

                <h2 className="mt-2 text-xl font-bold text-blue-900">
                  {data?.localUnitName ||
                    data?.areaName ||
                    'Assigned Church unit'}
                </h2>

                {data?.localUnitName && data?.areaName && (
                  <p className="mt-1 text-sm text-slate-600">
                    {data.areaName}
                  </p>
                )}

                <p className="mt-2 text-sm text-slate-600">
                  Read-only application records. Endorsement
                  decisions are made on the endorsement pages.
                </p>
              </section>

              <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <SummaryCard
                  label="Total Applications"
                  value={applications.length}
                />

                <SummaryCard
                  label="Awaiting Local Endorsement"
                  value={pendingLocal}
                />

                <SummaryCard
                  label="Awaiting Final Endorsement"
                  value={pendingFinal}
                />

                <SummaryCard
                  label="Admission Completed"
                  value={admitted}
                />
              </section>

              <section className="mt-7 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 p-5">
                  <h2 className="text-lg font-bold text-blue-900">
                    Candidate Applications
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Each row represents an application for
                    an intake.
                  </p>

                  <div className="mt-5 grid gap-4 md:grid-cols-3">
                    <label className="md:col-span-2">
                      <span className="text-sm font-semibold text-slate-700">
                        Search
                      </span>

                      <input
                        type="search"
                        value={search}
                        onChange={(event) =>
                          setSearch(event.target.value)
                        }
                        placeholder="Name, email, application number or local unit"
                        className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
                      />
                    </label>

                    <label>
                      <span className="text-sm font-semibold text-slate-700">
                        Application Status
                      </span>

                      <select
                        value={status}
                        onChange={(event) =>
                          setStatus(event.target.value)
                        }
                        className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3"
                      >
                        <option value="all">
                          All Statuses
                        </option>

                        {Object.entries(statusLabels).map(
                          ([value, label]) => (
                            <option
                              key={value}
                              value={value}
                            >
                              {label}
                            </option>
                          )
                        )}
                      </select>
                    </label>
                  </div>
                </div>

                {filteredApplications.length === 0 ? (
                  <div className="p-12 text-center">
                    <h3 className="font-bold text-slate-800">
                      No matching applications
                    </h3>

                    <p className="mt-2 text-sm text-slate-500">
                      {applications.length === 0
                        ? 'No applications are currently linked to your assigned scope.'
                        : 'Try another search or status filter.'}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                      <thead className="bg-slate-50">
                        <tr>
                          {[
                            'Candidate',
                            'Local Unit',
                            'Application Status',
                            'LTC Review',
                            'Local Endorsement',
                            'Final Endorsement',
                          ].map((heading) => (
                            <th
                              key={heading}
                              scope="col"
                              className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                            >
                              {heading}
                            </th>
                          ))}
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-slate-100">
                        {filteredApplications.map(
                          (application) => (
                            <tr
                              key={application.id}
                              className="hover:bg-slate-50"
                            >
                              <td className="px-5 py-4">
                                <p className="font-semibold text-slate-900">
                                  {application.candidate_name ||
                                    'Candidate'}
                                </p>

                                <p className="mt-1 text-sm text-slate-500">
                                  {application.candidate_email}
                                </p>

                                <p className="mt-2 text-xs text-slate-500">
                                  {application.application_number ||
                                    'Number pending'}
                                </p>

                                <p className="mt-1 text-xs text-slate-400">
                                  {application.intake_name}
                                </p>
                              </td>

                              <td className="px-5 py-4">
                                <p className="text-sm font-medium text-slate-800">
                                  {application.local_unit_name}
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                  {application.area_name}
                                </p>
                              </td>

                              <td className="px-5 py-4">
                                <Badge value={application.status}>
                                  {statusLabels[application.status] ||
                                    application.status}
                                </Badge>

                                <p className="mt-2 text-xs text-slate-500">
                                  Progress:{' '}
                                  {application.completion_percentage ?? 0}%
                                </p>

                                <p className="mt-1 text-xs text-slate-400">
                                  Submitted:{' '}
                                  {formatDate(application.submitted_at)}
                                </p>
                              </td>

                              <td className="px-5 py-4">
                                <Decision
                                  value={application.ltc_review_decision}
                                />
                              </td>

                              <td className="px-5 py-4">
                                <Decision
                                  value={application.local_endorsement_decision}
                                />
                              </td>

                              <td className="px-5 py-4">
                                <Decision
                                  value={application.final_endorsement_decision}
                                />
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="border-t border-slate-200 px-5 py-4 text-sm text-slate-500">
                  Showing {filteredApplications.length} of{' '}
                  {applications.length} applications
                </div>
              </section>
            </>
          )}
        </div>
      </main>
    </LeaderLayout>
  );
}

function SummaryCard({ label, value }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">
        {label}
      </p>

      <p className="mt-3 text-3xl font-bold text-blue-900">
        {value}
      </p>
    </article>
  );
}

function Decision({ value }) {
  if (!value) {
    return (
      <span className="text-sm text-slate-400">
        Not recorded
      </span>
    );
  }

  return (
    <Badge value={value}>
      {formatText(value)}
    </Badge>
  );
}

function Badge({ value, children }) {
  const positive = [
    'approved',
    'endorsed',
    'admission_completed',
    'room_allocated',
  ].includes(value);

  const negative = value === 'rejected';

  const colors = positive
    ? 'bg-emerald-100 text-emerald-800'
    : negative
      ? 'bg-red-100 text-red-700'
      : 'bg-slate-100 text-slate-700';

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${colors}`}
    >
      {children}
    </span>
  );
}

function Notice({ message, error = false }) {
  return (
    <div
      role={error ? 'alert' : 'status'}
      className={`mt-7 rounded-xl border p-5 ${
        error
          ? 'border-red-200 bg-red-50 text-red-700'
          : 'border-blue-200 bg-blue-50 text-blue-900'
      }`}
    >
      {message}
    </div>
  );
}

function formatText(value) {
  return String(value)
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}

function formatDate(value) {
  if (!value) return 'Not submitted';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Not available';
  }

  return new Intl.DateTimeFormat('en-NG', {
    dateStyle: 'medium',
  }).format(date);
}