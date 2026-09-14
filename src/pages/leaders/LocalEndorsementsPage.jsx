import {
  Link,
} from 'react-router-dom';

import LeaderLayout from '../../layouts/LeaderLayout';

import {
  useLocalEndorsementQueue,
} from '../../hooks/useLocalEndorsements';

export default function LocalEndorsementsPage() {
  const {
    data: queue,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useLocalEndorsementQueue();

  const applications =
    queue?.applications || [];

  if (isLoading) {
    return (
      <LeaderLayout>
        <PageMessage message="Loading candidate endorsements..." />
      </LeaderLayout>
    );
  }

  if (error) {
    return (
      <LeaderLayout>
        <PageMessage
          error
          message={
            error.message ||
            'Unable to load candidate endorsements.'
          }
        />
      </LeaderLayout>
    );
  }

  return (
    <LeaderLayout>
      <main className="p-5 md:p-8">
        <div className="mx-auto max-w-7xl">
          <header className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-amber-600">
                Local Church Leadership
              </p>

              <h1 className="mt-2 text-3xl font-bold text-blue-900">
                Candidate Endorsements
              </h1>

              <p className="mt-2 text-slate-600">
                Review candidates who are
                waiting for your local
                ecclesiastical endorsement.
              </p>
            </div>

            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="rounded-lg border border-blue-900 px-5 py-3 text-sm font-semibold text-blue-900 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isFetching
                ? 'Refreshing...'
                : 'Refresh Queue'}
            </button>
          </header>

          <section className="mt-7 rounded-xl border border-blue-100 bg-blue-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">
              Assigned Ward or Branch
            </p>

            <div className="mt-2 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-xl font-bold text-blue-900">
                  {queue?.localUnitName ||
                    'Assigned local unit'}
                </h2>

                <p className="mt-1 text-sm text-slate-600">
                  {queue?.areaName ||
                    'Assigned Church area'}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {formatRole(
                    queue?.leaderRole
                  )}
                </p>
              </div>

              <div className="w-fit rounded-lg bg-white px-6 py-4 text-center shadow-sm">
                <p className="text-3xl font-bold text-blue-900">
                  {queue?.total || 0}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Awaiting endorsement
                </p>
              </div>
            </div>
          </section>

          <section className="mt-7 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="text-lg font-bold text-blue-900">
                Pending Endorsements
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Only LTC-approved candidates
                assigned to your ward or branch
                will appear here.
              </p>
            </div>

            {applications.length === 0 ? (
              <EmptyQueue />
            ) : (
              <>
                {/* Mobile cards */}
                <div className="space-y-4 p-4 md:hidden">
                  {applications.map(
                    (application) => (
                      <CandidateCard
                        key={application.id}
                        application={
                          application
                        }
                      />
                    )
                  )}
                </div>

                {/* Desktop table */}
                <div className="hidden overflow-x-auto md:block">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                      <tr>
                        <TableHeading>
                          Candidate
                        </TableHeading>

                        <TableHeading>
                          Application
                        </TableHeading>

                        <TableHeading>
                          Local Unit
                        </TableHeading>

                        <TableHeading>
                          Submitted
                        </TableHeading>

                        <TableHeading>
                          Action
                        </TableHeading>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100 bg-white">
                      {applications.map(
                        (application) => (
                          <CandidateRow
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
          </section>
        </div>
      </main>
    </LeaderLayout>
  );
}

function CandidateRow({
  application,
}) {
  return (
    <tr className="hover:bg-slate-50">
      <td className="px-5 py-4">
        <p className="font-semibold text-slate-900">
          {application.candidate_name ||
            'Candidate'}
        </p>

        <p className="mt-1 text-sm text-slate-500">
          {application.candidate_email ||
            'No email provided'}
        </p>

        <p className="mt-1 text-sm text-slate-500">
          {application.candidate_phone ||
            'No phone provided'}
        </p>
      </td>

      <td className="px-5 py-4">
        <p className="font-medium text-slate-800">
          {application.application_number ||
            'Number pending'}
        </p>

        <p className="mt-1 text-sm text-slate-500">
          {application.intake_name ||
            'Current intake'}
        </p>

        <StatusBadge />
      </td>

      <td className="px-5 py-4">
        <p className="font-medium text-slate-800">
          {application.local_unit_name ||
            'Not provided'}
        </p>

        <p className="mt-1 text-sm text-slate-500">
          Membership:{' '}
          {application.membership_record_number ||
            'Not provided'}
        </p>
      </td>

      <td className="px-5 py-4 text-sm text-slate-600">
        {formatDate(
          application.submitted_at
        )}
      </td>

      <td className="px-5 py-4">
        <ReviewLink
          applicationId={application.id}
        />
      </td>
    </tr>
  );
}

function CandidateCard({
  application,
}) {
  return (
    <article className="rounded-xl border border-slate-200 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-bold text-slate-900">
            {application.candidate_name ||
              'Candidate'}
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            {application.candidate_email ||
              'No email provided'}
          </p>
        </div>

        <StatusBadge />
      </div>

      <dl className="mt-5 space-y-3 text-sm">
        <MobileDetail
          label="Application"
          value={
            application.application_number ||
            'Number pending'
          }
        />

        <MobileDetail
          label="Intake"
          value={
            application.intake_name ||
            'Current intake'
          }
        />

        <MobileDetail
          label="Local unit"
          value={
            application.local_unit_name ||
            'Not provided'
          }
        />

        <MobileDetail
          label="Membership"
          value={
            application.membership_record_number ||
            'Not provided'
          }
        />

        <MobileDetail
          label="Submitted"
          value={formatDate(
            application.submitted_at
          )}
        />
      </dl>

      <div className="mt-5">
        <ReviewLink
          applicationId={application.id}
          fullWidth
        />
      </div>
    </article>
  );
}

function ReviewLink({
  applicationId,
  fullWidth = false,
}) {
  return (
    <Link
      to={`/leader/endorsements/${applicationId}`}
      className={`inline-flex items-center justify-center rounded-lg bg-blue-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 ${
        fullWidth ? 'w-full' : ''
      }`}
    >
      Review Application
    </Link>
  );
}

function StatusBadge() {
  return (
    <span className="mt-2 inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
      Awaiting Endorsement
    </span>
  );
}

function TableHeading({
  children,
}) {
  return (
    <th
      scope="col"
      className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
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
      <dt className="text-slate-500">
        {label}
      </dt>

      <dd className="text-right font-medium text-slate-800">
        {value}
      </dd>
    </div>
  );
}

function EmptyQueue() {
  return (
    <div className="px-5 py-16 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-2xl text-emerald-700">
        ✓
      </div>

      <h3 className="mt-4 text-lg font-bold text-slate-900">
        No pending endorsements
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        Candidates will appear here after
        their applications have been approved
        by the LTC Admin and sent to your ward
        or branch for endorsement.
      </p>
    </div>
  );
}

function PageMessage({
  message,
  error = false,
}) {
  return (
    <main className="p-5 md:p-8">
      <div
        role={error ? 'alert' : 'status'}
        className={`mx-auto max-w-3xl rounded-xl border p-6 ${
          error
            ? 'border-red-200 bg-red-50 text-red-700'
            : 'border-blue-200 bg-blue-50 text-blue-900'
        }`}
      >
        {message}
      </div>
    </main>
  );
}

function formatRole(value) {
  const roles = {
    bishop: 'Bishop',
    branch_president:
      'Branch President',
  };

  return roles[value] || 'Local Leader';
}

function formatDate(value) {
  if (!value) {
    return 'Not available';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Not available';
  }

  return new Intl.DateTimeFormat(
    'en-NG',
    {
      dateStyle: 'medium',
      timeStyle: 'short',
    }
  ).format(date);
}