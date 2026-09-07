import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useDocuments } from '../../hooks/useDocuments';

export default function ReviewSubmissionStep({
  profile,
  candidateProfile,
  application,
  latestReview,
  isCorrection = false,
  submitCandidateApplication,
  submittingApplication,
  resubmitCandidateApplication,
  resubmittingApplication,
}) {
  const navigate = useNavigate();

  const {
    documents,
    loading: documentsLoading,
    error: documentsError,
  } = useDocuments(application.id);

  const [
    acceptDeclaration,
    setAcceptDeclaration,
  ] = useState(false);

  const [
    acceptPrivacy,
    setAcceptPrivacy,
  ] = useState(false);

  const [message, setMessage] = useState('');

  const applicationRequiresCorrection =
    isCorrection ||
    application.status ===
      'correction_required';

  const alreadySubmitted =
    ![
      'draft',
      'correction_required',
    ].includes(application.status);

  const processing =
    submittingApplication ||
    resubmittingApplication;

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage('');

    /*
     * A corrected application uses the secure
     * resubmission function.
     */
    if (applicationRequiresCorrection) {
      const confirmed = window.confirm(
        'Resubmit your corrected application for LTC Admin review?'
      );

      if (!confirmed) {
        return;
      }

      try {
        await resubmitCandidateApplication({
          applicationId: application.id,
        });

        navigate('/candidate/dashboard', {
          replace: true,
        });
      } catch (resubmitError) {
        setMessage(resubmitError.message);
      }

      return;
    }

    /*
     * The declaration and privacy consent are
     * required for the first submission.
     */
    if (!acceptDeclaration) {
      setMessage(
        'Confirm that your application information is correct.'
      );

      return;
    }

    if (!acceptPrivacy) {
      setMessage(
        'Accept the privacy and document-processing declaration.'
      );

      return;
    }

    const confirmed = window.confirm(
      'Submit this application? Ordinary editing will be locked after submission.'
    );

    if (!confirmed) {
      return;
    }

    try {
      await submitCandidateApplication({
        applicationId: application.id,
        acceptDeclaration,
        acceptPrivacy,
      });

      navigate('/candidate/dashboard', {
        replace: true,
      });
    } catch (submissionError) {
      setMessage(submissionError.message);
    }
  }

  if (documentsLoading) {
    return (
      <PageMessage message="Loading your application..." />
    );
  }

  if (documentsError) {
    return (
      <PageMessage
        error
        message={documentsError.message}
      />
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-5 md:p-8">
      <div className="mx-auto max-w-5xl">
        <button
          type="button"
          onClick={() =>
            navigate('/candidate/dashboard')
          }
          className="font-medium text-blue-900"
        >
          ← Return to dashboard
        </button>

        <header className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <p className="text-sm font-semibold text-blue-700">
            Step 7 of 7
          </p>

          <h1 className="mt-2 text-3xl font-bold text-blue-900">
            {applicationRequiresCorrection
              ? 'Review and Resubmit Corrections'
              : 'Review, Declaration and Submission'}
          </h1>

          <p className="mt-2 text-slate-600">
            {applicationRequiresCorrection
              ? 'Confirm that you have made the requested correction before resubmitting.'
              : 'Review your information carefully before submitting the application.'}
          </p>
        </header>

        {applicationRequiresCorrection && (
          <section className="mt-6 rounded-xl border border-amber-300 bg-amber-50 p-6">
            <p className="font-bold text-amber-900">
              LTC Admin correction request
            </p>

            <p className="mt-2 whitespace-pre-wrap text-amber-900">
              {latestReview?.comments ||
                'Please review and correct your application.'}
            </p>

            {latestReview?.reviewed_at && (
              <p className="mt-3 text-xs text-amber-700">
                Reviewed:{' '}
                {formatDateTime(
                  latestReview.reviewed_at
                )}
              </p>
            )}
          </section>
        )}

        {message && (
          <div className="mt-6 rounded-md border border-red-200 bg-red-50 p-4 text-red-700">
            {message}
          </div>
        )}

        <div className="mt-6 space-y-6">
          <ReviewSection title="Personal Information">
            <ReviewItem
              label="Full Name"
              value={profile?.full_name}
            />

            <ReviewItem
              label="Email"
              value={profile?.email}
            />

            <ReviewItem
              label="Phone"
              value={profile?.phone}
            />

            <ReviewItem
              label="Date of Birth"
              value={formatDate(
                candidateProfile.date_of_birth
              )}
            />

            <ReviewItem
              label="Gender"
              value={formatValue(
                candidateProfile.gender
              )}
            />

            <ReviewItem
              label="Marital Status"
              value={formatValue(
                candidateProfile.marital_status
              )}
            />

            <ReviewItem
              label="Residential Address"
              value={
                candidateProfile.residential_address
              }
            />

            <ReviewItem
              label="City and State"
              value={[
                candidateProfile.city,
                candidateProfile.state,
              ]
                .filter(Boolean)
                .join(', ')}
            />

            <ReviewItem
              label="Country"
              value={candidateProfile.country}
            />
          </ReviewSection>

          <ReviewSection title="Ecclesiastical Information">
            <ReviewItem
              label="Stake or District"
              value={
                candidateProfile
                  .ecclesiastical_area_name
              }
            />

            <ReviewItem
              label="Area Type"
              value={formatValue(
                candidateProfile
                  .ecclesiastical_area_type
              )}
            />

            <ReviewItem
              label="Ward or Branch"
              value={
                candidateProfile.local_unit_name
              }
            />

            <ReviewItem
              label="Local Unit Type"
              value={formatValue(
                candidateProfile.local_unit_type
              )}
            />

            <ReviewItem
              label="Membership Record Number"
              value={
                candidateProfile
                  .membership_record_number
              }
            />

            <ReviewItem
              label="Bishop or Branch President"
              value={
                candidateProfile.local_leader_name
              }
            />

            <ReviewItem
              label="Stake or District President"
              value={
                candidateProfile.area_leader_name
              }
            />
          </ReviewSection>

          <ReviewSection title="Mission Information">
            <ReviewItem
              label="Missionary Status"
              value={formatValue(
                candidateProfile.missionary_status
              )}
            />

            <ReviewItem
              label="Mission Name"
              value={candidateProfile.mission_name}
            />

            <ReviewItem
              label="Mission Country"
              value={
                candidateProfile.mission_country
              }
            />

            <ReviewItem
              label="Mission Start Date"
              value={formatDate(
                candidateProfile
                  .mission_start_date
              )}
            />

            <ReviewItem
              label="Mission Completion Date"
              value={formatDate(
                candidateProfile.mission_end_date
              )}
            />
          </ReviewSection>

          <ReviewSection title="Contact and Emergency Information">
            <ReviewItem
              label="Alternative Phone"
              value={
                candidateProfile.alternate_phone
              }
            />

            <ReviewItem
              label="Emergency Contact"
              value={
                candidateProfile
                  .emergency_contact_name
              }
            />

            <ReviewItem
              label="Relationship"
              value={formatValue(
                candidateProfile
                  .emergency_contact_relationship
              )}
            />

            <ReviewItem
              label="Emergency Phone"
              value={
                candidateProfile
                  .emergency_contact_phone
              }
            />

            <ReviewItem
              label="Emergency Address"
              value={
                candidateProfile
                  .emergency_contact_address
              }
            />
          </ReviewSection>

          <ReviewSection title="Education and Programme">
            <ReviewItem
              label="Highest Qualification"
              value={formatValue(
                candidateProfile
                  .highest_qualification
              )}
            />

            <ReviewItem
              label="Institution"
              value={
                candidateProfile.institution_name
              }
            />

            <ReviewItem
              label="Field of Study"
              value={
                candidateProfile.field_of_study
              }
            />

            <ReviewItem
              label="Graduation Year"
              value={
                candidateProfile.graduation_year
              }
            />

            <ReviewItem
              label="Skills and Experience"
              value={
                candidateProfile.skills_experience
              }
            />

            <ReviewItem
              label="Preferred LTC Programme"
              value={
                candidateProfile.preferred_programme
              }
            />
          </ReviewSection>

          <ReviewSection title="Uploaded Documents">
            {documents.length === 0 ? (
              <p className="text-red-700 md:col-span-2">
                No documents have been uploaded.
              </p>
            ) : (
              documents.map((document) => (
                <ReviewItem
                  key={document.id}
                  label={
                    document.document_types?.name ||
                    'Document'
                  }
                  value={`${document.original_filename} — ${formatValue(
                    document.verification_status
                  )}`}
                />
              ))
            )}
          </ReviewSection>
        </div>

        {alreadySubmitted ? (
          <section className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-6">
            <h2 className="text-xl font-bold text-blue-900">
              Application Submitted
            </h2>

            <p className="mt-2 text-blue-800">
              Your application has already been
              submitted and is currently{' '}
              <span className="font-semibold">
                {formatValue(application.status)}
              </span>
              .
            </p>
          </section>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:p-8"
          >
            <h2 className="text-xl font-bold text-blue-900">
              {applicationRequiresCorrection
                ? 'Correction Confirmation'
                : 'Candidate Declaration'}
            </h2>

            {applicationRequiresCorrection ? (
              <div className="mt-5 rounded-md border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
                By resubmitting, you confirm that you
                have reviewed the LTC Admin’s comment
                and corrected the requested
                information.
              </div>
            ) : (
              <div className="mt-5 space-y-5">
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={acceptDeclaration}
                    onChange={(event) =>
                      setAcceptDeclaration(
                        event.target.checked
                      )
                    }
                    disabled={processing}
                    className="mt-1 h-4 w-4"
                  />

                  <span className="text-sm text-slate-700">
                    I declare that the information
                    provided in this application is
                    complete and accurate.
                  </span>
                </label>

                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={acceptPrivacy}
                    onChange={(event) =>
                      setAcceptPrivacy(
                        event.target.checked
                      )
                    }
                    disabled={processing}
                    className="mt-1 h-4 w-4"
                  />

                  <span className="text-sm text-slate-700">
                    I consent to LTC Nigeria processing
                    my personal information and
                    documents for admission purposes.
                  </span>
                </label>
              </div>
            )}

            <div className="mt-7 flex flex-col-reverse justify-between gap-3 sm:flex-row">
              {applicationRequiresCorrection && (
                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      '/candidate/application'
                    )
                  }
                  disabled={processing}
                  className="rounded-md border border-slate-300 px-6 py-3 font-semibold text-slate-700 disabled:opacity-60"
                >
                  Return to Corrections
                </button>
              )}

              <button
                type="submit"
                disabled={
                  processing ||
                  (
                    !applicationRequiresCorrection &&
                    (
                      !acceptDeclaration ||
                      !acceptPrivacy
                    )
                  )
                }
                className="ml-auto rounded-md bg-blue-900 px-6 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {applicationRequiresCorrection
                  ? resubmittingApplication
                    ? 'Resubmitting...'
                    : 'Resubmit Corrected Application'
                  : submittingApplication
                    ? 'Submitting...'
                    : 'Submit Application'}
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}

function ReviewSection({
  title,
  children,
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="border-b border-slate-200 pb-3 text-xl font-bold text-blue-900">
        {title}
      </h2>

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        {children}
      </div>
    </section>
  );
}

function ReviewItem({
  label,
  value,
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-slate-800">
        {value || 'Not provided'}
      </p>
    </div>
  );
}

function formatValue(value) {
  if (!value) {
    return '';
  }

  return String(value)
    .split('_')
    .map((word) => {
      return (
        word.charAt(0).toUpperCase() +
        word.slice(1)
      );
    })
    .join(' ');
}

function formatDate(value) {
  if (!value) {
    return '';
  }

  return new Intl.DateTimeFormat(
    'en-NG',
    {
      dateStyle: 'medium',
    }
  ).format(new Date(value));
}

function formatDateTime(value) {
  if (!value) {
    return '';
  }

  return new Intl.DateTimeFormat(
    'en-NG',
    {
      dateStyle: 'medium',
      timeStyle: 'short',
    }
  ).format(new Date(value));
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
            ? 'rounded-lg bg-red-50 p-5 text-red-700'
            : 'rounded-lg bg-white p-5 text-slate-600 shadow'
        }
      >
        {message}
      </div>
    </main>
  );
}