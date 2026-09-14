import { Link } from 'react-router-dom';

import { useFinalEndorsementQueue } from '../../hooks/useFinalEndorsements';

import LeaderLayout from '../../layouts/LeaderLayout';

export default function FinalEndorsementsPage() {
  const {
    data: queue,
    isLoading,
    error,
    refetch,
  } = useFinalEndorsementQueue();

  if (isLoading) {
    return (
      <LeaderLayout>
        <PageMessage message="Loading final endorsements..." />
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
            'Unable to load final endorsements.'
          }
        />
      </LeaderLayout>
    );
  }

  const applications =
    queue?.applications || [];

  return (
    <LeaderLayout>
      <main className="p-5 md:p-8">
        <div className="mx-auto max-w-7xl">
          <header className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-amber-600">
                Church Leadership
              </p>

              <h1 className="mt-2 text-3xl font-bold text-blue-900">
                Final Endorsements
              </h1>

              <p className="mt-2 text-slate-600">
                Review candidates who have
                received their Bishop or Branch
                President endorsement.
              </p>
            </div>

            <button
              type="button"
              onClick={() => refetch()}
              className="rounded-lg border border-blue-900 px-5 py-3 text-sm font-semibold text-blue-900 transition hover:bg-blue-50"
            >
              Refresh Queue
            </button>
          </header>

          <section className="mt-7 rounded-xl border border-blue-100 bg-blue-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">
              Assigned Church Area
            </p>

            <div className="mt-2 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-xl font-bold text-blue-900">
                  {queue?.areaName ||
                    'Assigned area'}
                </h2>

                <p className="mt-1 text-sm capitalize text-slate-600">
                  {formatRole(
                    queue?.leaderRole
                  )}
                </p>
              </div>

              <div className="rounded-lg bg-white px-5 py-3 text-center shadow-sm">
                <p className="text-2xl font-bold text-blue-900">
                  {queue?.total || 0}
                </p>

                <p className="text-xs text-slate-500">
                  Awaiting final endorsement
                </p>
              </div>
            </div>
          </section>

          <section className="mt-7 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="text-lg font-bold text-blue-900">
                Candidate Queue
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Only candidates belonging to{' '}
                {queue?.areaName ||
                  'your assigned area'}{' '}
                are displayed.
              </p>
            </div>

            {applications.length === 0 ? (
              <EmptyQueue />
            ) : (
              <>
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

                <div className="hidden overflow-x-auto md:block">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                      <tr>
                        <TableHeading>
                          Candidate
                        </TableHeading>

                        <TableHeading>
                          Local Unit
                        </TableHeading>

                        <TableHeading>
                          Local Endorsement
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

function CandidateRow({ application }) {
  const localEndorsement =
    application.local_endorsement;

  return (
    <tr className="hover:bg-slate-50">
      <td className="px-5 py-4">
        <p className="font-semibold text-slate-900">
          {application.candidate_name ||
            'Candidate'}
        </p>

        <p className="mt-1 text-sm text-slate-500">
          {application.candidate_email ||
            'No email'}
        </p>

        <p className="mt-1 text-xs text-slate-400">
          {application.application_number ||
            'Application number pending'}
        </p>
      </td>

      <td className="px-5 py-4">
        <p className="font-medium text-slate-800">
          {application.local_unit_name ||
            'Not provided'}
        </p>

        <p className="mt-1 text-sm capitalize text-slate-500">
          {formatText(
            application.local_unit_type
          )}
        </p>
      </td>

      <td className="px-5 py-4">
        {localEndorsement ? (
          <>
            <StatusBadge text="Endorsed" />

            <p className="mt-2 text-sm text-slate-600">
              By{' '}
              {localEndorsement.endorser_name ||
                'Local leader'}
            </p>

            <p className="mt-1 text-xs capitalize text-slate-400">
              {formatRole(
                localEndorsement.endorser_role
              )}
            </p>
          </>
        ) : (
          <span className="text-sm text-slate-500">
            Not available
          </span>
        )}
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

function CandidateCard({ application }) {
  return (
    <article className="rounded-lg border border-slate-200 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-bold text-slate-900">
            {application.candidate_name ||
              'Candidate'}
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            {application.candidate_email}
          </p>
        </div>

        <StatusBadge text="Pending" />
      </div>

      <dl className="mt-4 space-y-3 text-sm">
        <MobileDetail
          label="Application"
          value={
            application.application_number ||
            'Pending'
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
          label="Local endorser"
          value={
            application.local_endorsement
              ?.endorser_name ||
            'Not available'
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
      to={`/president/endorsements/${applicationId}`}
      className={`inline-flex items-center justify-center rounded-lg bg-blue-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800 ${
        fullWidth ? 'w-full' : ''
      }`}
    >
      Review Application
    </Link>
  );
}

function TableHeading({ children }) {
  return (
    <th
      scope="col"
      className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
    >
      {children}
    </th>
  );
}

function MobileDetail({ label, value }) {
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

function StatusBadge({ text }) {
  return (
    <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
      {text}
    </span>
  );
}

function EmptyQueue() {
  return (
    <div className="px-5 py-16 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-2xl text-blue-900">
        ✓
      </div>

      <h3 className="mt-4 text-lg font-bold text-slate-900">
        No pending final endorsements
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
        Applications will appear here after
        they have been endorsed by a Bishop
        or Branch President in your assigned
        area.
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

function formatRole(value) {
  const roles = {
    stake_president:
      'Stake President',

    district_president:
      'District President',

    bishop:
      'Bishop',

    branch_president:
      'Branch President',
  };

  return roles[value] || formatText(value);
}

function formatText(value) {
  if (!value) {
    return '';
  }

  return value
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}