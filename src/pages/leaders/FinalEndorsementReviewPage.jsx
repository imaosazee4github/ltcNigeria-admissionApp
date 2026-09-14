import {
  useState,
} from 'react';

import {
  Link,
  useNavigate,
  useParams,
} from 'react-router-dom';

import {
  useFinalEndorsementApplication,
  useSubmitFinalEndorsement,
} from '../../hooks/useFinalEndorsements';

import LeaderLayout from '../../layouts/LeaderLayout';

export default function FinalEndorsementReviewPage() {
  const { applicationId } =
    useParams();

  const navigate =
    useNavigate();

  const {
    data: application,
    isLoading,
    error,
  } = useFinalEndorsementApplication(
    applicationId
  );

  const {
    submitFinalEndorsement,
    submitting,
    submissionError,
  } = useSubmitFinalEndorsement(
    applicationId
  );

  const [decision, setDecision] =
    useState('');

  const [comments, setComments] =
    useState('');

  const [
    leaderDeclaration,
    setLeaderDeclaration,
  ] = useState(false);

  const [formError, setFormError] =
    useState('');

  if (isLoading) {
    return (
      <LeaderLayout>
        <PageMessage message="Loading candidate application..." />
      </LeaderLayout>
    );
  }

  if (error) {
    return (
      <LeaderLayout>
        <PageMessage
          error
          message={error.message}
        />
      </LeaderLayout>
    );
  }

  if (!application) {
    return (
      <LeaderLayout>
        <PageMessage
          error
          message="Application not found."
        />
      </LeaderLayout>
    );
  }

  const localEndorsement =
    application.local_endorsement;

  async function handleSubmit(event) {
    event.preventDefault();

    setFormError('');

    if (!decision) {
      setFormError(
        'Select Endorse, Return, or Reject.'
      );

      return;
    }

    if (!leaderDeclaration) {
      setFormError(
        'Confirm the final endorsement declaration.'
      );

      return;
    }

    if (
      [
        'correction_required',
        'rejected',
      ].includes(decision) &&
      !comments.trim()
    ) {
      setFormError(
        'Comments are required when returning or rejecting an application.'
      );

      return;
    }

    const confirmed =
      window.confirm(
        getConfirmationMessage(decision)
      );

    if (!confirmed) {
      return;
    }

    try {
      await submitFinalEndorsement({
        decision,

        comments,

        responses: {
          leader_declaration:
            leaderDeclaration,

          reviewed_local_endorsement:
            true,

          reviewed_candidate_information:
            true,
        },
      });

      navigate(
        '/president/endorsements',
        {
          replace: true,

          state: {
            message:
              getSuccessMessage(
                decision
              ),
          },
        }
      );
    } catch (submitError) {
      setFormError(
        submitError.message ||
          'Unable to submit final endorsement.'
      );
    }
  }

  return (
    <LeaderLayout>
      <main className="p-5 md:p-8">
        <div className="mx-auto max-w-5xl">
          <Link
            to="/president/endorsements"
            className="text-sm font-semibold text-blue-800 hover:text-blue-950"
          >
            ← Return to final endorsements
          </Link>

          <header className="mt-5">
            <p className="text-sm font-semibold uppercase tracking-wider text-amber-600">
              Final Endorsement Review
            </p>

            <h1 className="mt-2 text-3xl font-bold text-blue-900">
              {application.candidate_name ||
                'Candidate Application'}
            </h1>

            <p className="mt-2 text-slate-600">
              Review the candidate and the
              earlier local leader endorsement
              before making your final decision.
            </p>
          </header>

          <AreaNotice
            areaName={
              application.areaName
            }
            leaderRole={
              application.leaderRole
            }
          />

          <section className="mt-7 grid gap-6 lg:grid-cols-2">
            <InformationCard title="Candidate Information">
              <Detail
                label="Full name"
                value={
                  application.candidate_name
                }
              />

              <Detail
                label="Email"
                value={
                  application.candidate_email
                }
              />

              <Detail
                label="Phone"
                value={
                  application.candidate_phone
                }
              />

              <Detail
                label="Application number"
                value={
                  application.application_number
                }
              />

              <Detail
                label="Intake"
                value={
                  application.intake_name
                }
              />

              <Detail
                label="Membership record number"
                value={
                  application.membership_record_number
                }
              />

              <Detail
                label="Application status"
                value={formatText(
                  application.status
                )}
              />

              <Detail
                label="Submitted"
                value={formatDate(
                  application.submitted_at
                )}
              />
            </InformationCard>

            <InformationCard title="Church Unit">
              <Detail
                label="Stake or District"
                value={
                  application.areaName
                }
              />

              <Detail
                label="Ward or Branch"
                value={
                  application.local_unit_name
                }
              />

              <Detail
                label="Unit type"
                value={formatText(
                  application.local_unit_type
                )}
              />

              <Detail
                label="Completion"
                value={`${
                  application.completion_percentage ||
                  0
                }%`}
              />
            </InformationCard>
          </section>

          <section className="mt-7 overflow-hidden rounded-xl border border-emerald-200 bg-white shadow-sm">
            <div className="border-b border-emerald-200 bg-emerald-50 px-6 py-5">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-xl font-bold text-emerald-900">
                    Earlier Unit Endorsement
                  </h2>

                  <p className="mt-1 text-sm text-emerald-700">
                    Submitted by the candidate’s
                    Bishop or Branch President.
                  </p>
                </div>

                <span className="w-fit rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-800">
                  Endorsed
                </span>
              </div>
            </div>

            {localEndorsement ? (
              <div className="p-6">
                <div className="grid gap-5 md:grid-cols-2">
                  <Detail
                    label="Local leader"
                    value={
                      localEndorsement.endorser_name
                    }
                  />

                  <Detail
                    label="Leadership role"
                    value={formatRole(
                      localEndorsement.endorser_role
                    )}
                  />

                  <Detail
                    label="Decision"
                    value={formatText(
                      localEndorsement.decision
                    )}
                  />

                  <Detail
                    label="Endorsed on"
                    value={formatDate(
                      localEndorsement.created_at
                    )}
                  />
                </div>

                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-slate-700">
                    Unit leader comments
                  </h3>

                  <div className="mt-2 rounded-lg bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                    {localEndorsement.comments ||
                      'No additional comments were provided.'}
                  </div>
                </div>

                <LocalResponses
                  responses={
                    localEndorsement.responses
                  }
                />
              </div>
            ) : (
              <div className="p-6 text-red-700">
                The earlier local endorsement
                could not be found.
              </div>
            )}
          </section>

          <form
            onSubmit={handleSubmit}
            className="mt-7 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h2 className="text-xl font-bold text-blue-900">
              Final Decision
            </h2>

            <p className="mt-2 text-sm text-slate-600">
              Select the appropriate decision
              after completing your review.
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <DecisionOption
                checked={
                  decision === 'endorsed'
                }
                name="decision"
                value="endorsed"
                title="Final Endorse"
                description="Approve the candidate and complete the admission endorsement."
                color="emerald"
                onChange={setDecision}
              />

              <DecisionOption
                checked={
                  decision ===
                  'correction_required'
                }
                name="decision"
                value="correction_required"
                title="Return"
                description="Return the application to the candidate for correction."
                color="amber"
                onChange={setDecision}
              />

              <DecisionOption
                checked={
                  decision === 'rejected'
                }
                name="decision"
                value="rejected"
                title="Reject"
                description="Reject the candidate's application."
                color="red"
                onChange={setDecision}
              />
            </div>

            <div className="mt-6">
              <label
                htmlFor="final-comments"
                className="block text-sm font-semibold text-slate-800"
              >
                Comments
                {decision !== 'endorsed' &&
                  decision && (
                    <span className="text-red-600">
                      {' '}
                      *
                    </span>
                  )}
              </label>

              <textarea
                id="final-comments"
                rows="5"
                value={comments}
                onChange={(event) =>
                  setComments(
                    event.target.value
                  )
                }
                placeholder={
                  decision ===
                    'correction_required'
                    ? 'Explain the corrections the candidate must make.'
                    : decision ===
                        'rejected'
                      ? 'Explain the reason for rejection.'
                      : 'Add optional final endorsement comments.'
                }
                className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
              <input
                type="checkbox"
                checked={leaderDeclaration}
                onChange={(event) =>
                  setLeaderDeclaration(
                    event.target.checked
                  )
                }
                className="mt-1 h-4 w-4 accent-blue-900"
              />

              <span className="text-sm leading-6 text-slate-700">
                I confirm that I have reviewed
                this application and the earlier
                Bishop or Branch President
                endorsement. I certify that my
                final decision is accurate.
              </span>
            </label>

            {(formError ||
              submissionError) && (
              <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {formError ||
                  submissionError?.message}
              </div>
            )}

            <div className="mt-7 flex flex-col-reverse justify-end gap-3 sm:flex-row">
              <Link
                to="/president/endorsements"
                className="rounded-lg border border-slate-300 px-6 py-3 text-center font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={
                  submitting ||
                  !decision ||
                  !leaderDeclaration
                }
                className="rounded-lg bg-blue-900 px-6 py-3 font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {submitting
                  ? 'Submitting Decision...'
                  : 'Submit Final Decision'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </LeaderLayout>
  );
}

function AreaNotice({
  areaName,
  leaderRole,
}) {
  return (
    <section className="mt-7 rounded-xl border border-blue-100 bg-blue-50 p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">
        Assigned Church Area
      </p>

      <h2 className="mt-2 text-xl font-bold text-blue-900">
        {areaName || 'Assigned area'}
      </h2>

      <p className="mt-1 text-sm text-slate-600">
        Final review by{' '}
        {formatRole(leaderRole)}
      </p>
    </section>
  );
}

function InformationCard({
  title,
  children,
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-6 py-4">
        <h2 className="text-lg font-bold text-blue-900">
          {title}
        </h2>
      </div>

      <dl className="divide-y divide-slate-100 px-6">
        {children}
      </dl>
    </section>
  );
}

function Detail({ label, value }) {
  return (
    <div className="py-4">
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </dt>

      <dd className="mt-1 text-sm font-medium text-slate-900">
        {value || 'Not provided'}
      </dd>
    </div>
  );
}

function LocalResponses({
  responses,
}) {
  if (
    !responses ||
    typeof responses !== 'object' ||
    Object.keys(responses).length === 0
  ) {
    return null;
  }

  return (
    <div className="mt-6">
      <h3 className="text-sm font-semibold text-slate-700">
        Unit endorsement responses
      </h3>

      <dl className="mt-3 divide-y divide-slate-200 rounded-lg border border-slate-200">
        {Object.entries(responses).map(
          ([key, value]) => (
            <div
              key={key}
              className="flex flex-col justify-between gap-2 px-4 py-3 sm:flex-row"
            >
              <dt className="text-sm text-slate-600">
                {formatText(key)}
              </dt>

              <dd className="text-sm font-semibold text-slate-900">
                {formatResponse(value)}
              </dd>
            </div>
          )
        )}
      </dl>
    </div>
  );
}

function DecisionOption({
  checked,
  name,
  value,
  title,
  description,
  color,
  onChange,
}) {
  const colors = {
    emerald: checked
      ? 'border-emerald-500 bg-emerald-50'
      : 'border-slate-200 hover:border-emerald-300',

    amber: checked
      ? 'border-amber-500 bg-amber-50'
      : 'border-slate-200 hover:border-amber-300',

    red: checked
      ? 'border-red-500 bg-red-50'
      : 'border-slate-200 hover:border-red-300',
  };

  return (
    <label
      className={`cursor-pointer rounded-xl border-2 p-5 transition ${colors[color]}`}
    >
      <div className="flex items-center gap-3">
        <input
          type="radio"
          name={name}
          value={value}
          checked={checked}
          onChange={(event) =>
            onChange(event.target.value)
          }
          className="h-4 w-4 accent-blue-900"
        />

        <span className="font-bold text-slate-900">
          {title}
        </span>
      </div>

      <p className="mt-3 text-sm leading-5 text-slate-600">
        {description}
      </p>
    </label>
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

        {error && (
          <div className="mt-4">
            <Link
              to="/president/endorsements"
              className="font-semibold underline"
            >
              Return to final endorsements
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}

function getConfirmationMessage(
  decision
) {
  const messages = {
    endorsed:
      'Are you sure you want to give final endorsement to this candidate?',

    correction_required:
      'Are you sure you want to return this application for correction?',

    rejected:
      'Are you sure you want to reject this application?',
  };

  return messages[decision];
}

function getSuccessMessage(decision) {
  const messages = {
    endorsed:
      'The candidate received final endorsement.',

    correction_required:
      'The application was returned for correction.',

    rejected:
      'The application was rejected.',
  };

  return messages[decision];
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

  return String(value)
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}

function formatResponse(value) {
  if (value === true) {
    return 'Yes';
  }

  if (value === false) {
    return 'No';
  }

  if (value === null || value === '') {
    return 'Not provided';
  }

  if (typeof value === 'object') {
    return JSON.stringify(value);
  }

  return String(value);
}