import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { useAdminApplication } from "../../hooks/useAdminApplications";
import { createDocumentSignedUrl } from "../../services/adminApplicationService";

export default function ApplicationReviewPage() {
  const { applicationId } = useParams();
  const navigate = useNavigate();

  const {
    data: application,
    isLoading,
    error,
    submitReview,
    reviewing,
    reviewError,
  } = useAdminApplication(applicationId);

  const [openingDocumentId, setOpeningDocumentId] = useState(null);
  const [comments, setComments] = useState("");
  const [localReviewError, setLocalReviewError] = useState("");

  const [documentError, setDocumentError] = useState("");

  if (isLoading) {
    return <PageMessage message="Loading candidate application..." />;
  }

  if (error) {
    return <PageMessage error message={error.message} />;
  }

  if (!application) {
    return <PageMessage error message="Application not found." />;
  }

  const candidate = application.candidate_profiles;
  const profile = candidate?.profiles;
  const intake = application.admission_intakes;
  const documents = application.application_documents || [];

  async function handleOpenDocument(document) {
    setDocumentError("");
    setOpeningDocumentId(document.id);

    try {
      const signedUrl = await createDocumentSignedUrl(document.storage_path);

      window.open(signedUrl, "_blank", "noopener,noreferrer");
    } catch (openError) {
      setDocumentError(openError.message);
    } finally {
      setOpeningDocumentId(null);
    }
  }

  async function handleReview(decision) {
    setLocalReviewError("");

    const trimmedComments = comments.trim();

    if (decision === "correction_required" && trimmedComments.length < 5) {
      setLocalReviewError("Explain what the candidate needs to correct.");

      return;
    }

    if (decision === "rejected" && trimmedComments.length < 5) {
      setLocalReviewError("Provide a reason for rejecting the application.");

      return;
    }

    const labels = {
      approved: "approve this application",
      correction_required: "return this application for correction",
      rejected: "reject this application",
    };

    const confirmed = window.confirm(
      `Are you sure you want to ${labels[decision]}?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      await submitReview({
        decision,
        comments: trimmedComments,
      });

      navigate("/admin/dashboard", {
        replace: true,
      });
    } catch (decisionError) {
      setLocalReviewError(decisionError.message);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 p-5 md:p-8">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div>
            <Link
              to="/admin/dashboard"
              className="font-semibold text-blue-800 hover:underline"
            >
              ← Return to application queue
            </Link>

            <p className="mt-6 text-sm font-semibold uppercase tracking-wide text-blue-700">
              Application verification
            </p>

            <h1 className="mt-2 text-3xl font-bold text-blue-900">
              {profile?.full_name || "Candidate Application"}
            </h1>

            <p className="mt-2 text-slate-600">
              Application number:{" "}
              <span className="font-semibold">
                {application.application_number || "Not assigned"}
              </span>
            </p>
          </div>

          <StatusBadge status={application.status} />
        </header>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <InformationSection title="Personal Information">
              <InformationGrid>
                <InformationItem label="Full name" value={profile?.full_name} />

                <InformationItem label="Email address" value={profile?.email} />

                <InformationItem label="Phone number" value={profile?.phone} />

                <InformationItem
                  label="Alternate phone"
                  value={candidate?.alternate_phone}
                />

                <InformationItem
                  label="Date of birth"
                  value={formatDate(candidate?.date_of_birth)}
                />

                <InformationItem
                  label="Gender"
                  value={formatValue(candidate?.gender)}
                />

                <InformationItem
                  label="Marital status"
                  value={formatValue(candidate?.marital_status)}
                />

                <InformationItem label="Country" value={candidate?.country} />

                <InformationItem label="State" value={candidate?.state} />

                <InformationItem label="City" value={candidate?.city} />

                <InformationItem
                  wide
                  label="Residential address"
                  value={candidate?.residential_address}
                />
              </InformationGrid>
            </InformationSection>

            <InformationSection title="Ecclesiastical Information">
              <InformationGrid>
                <InformationItem
                  label="Stake or district"
                  value={candidate?.ecclesiastical_area_name}
                />

                <InformationItem
                  label="Area type"
                  value={formatValue(candidate?.ecclesiastical_area_type)}
                />

                <InformationItem
                  label="Ward or branch"
                  value={candidate?.local_unit_name}
                />

                <InformationItem
                  label="Unit type"
                  value={formatValue(candidate?.local_unit_type)}
                />

                <InformationItem
                  label="Membership record number"
                  value={candidate?.membership_record_number}
                />

                <InformationItem
                  label="Bishop or Branch President"
                  value={candidate?.local_leader_name}
                />

                <InformationItem
                  label="Stake or District President"
                  value={candidate?.area_leader_name}
                />

                <InformationItem
                  label="Verification status"
                  value={formatValue(
                    candidate?.church_unit_verification_status,
                  )}
                />
              </InformationGrid>
            </InformationSection>

            <InformationSection title="Mission Information">
              <InformationGrid>
                <InformationItem
                  label="Missionary status"
                  value={formatValue(candidate?.missionary_status)}
                />

                <InformationItem
                  label="Mission name"
                  value={candidate?.mission_name}
                />

                <InformationItem
                  label="Mission country"
                  value={candidate?.mission_country}
                />

                <InformationItem
                  label="Mission start date"
                  value={formatDate(candidate?.mission_start_date)}
                />

                <InformationItem
                  label="Mission end date"
                  value={formatDate(candidate?.mission_end_date)}
                />
              </InformationGrid>
            </InformationSection>

            <InformationSection title="Emergency Contact">
              <InformationGrid>
                <InformationItem
                  label="Contact name"
                  value={candidate?.emergency_contact_name}
                />

                <InformationItem
                  label="Relationship"
                  value={candidate?.emergency_contact_relationship}
                />

                <InformationItem
                  label="Phone number"
                  value={candidate?.emergency_contact_phone}
                />

                <InformationItem
                  wide
                  label="Address"
                  value={candidate?.emergency_contact_address}
                />
              </InformationGrid>
            </InformationSection>

            <InformationSection title="Education and Programme">
              <InformationGrid>
                <InformationItem
                  label="Highest qualification"
                  value={formatValue(candidate?.highest_qualification)}
                />

                <InformationItem
                  label="Institution"
                  value={candidate?.institution_name}
                />

                <InformationItem
                  label="Field of study"
                  value={candidate?.field_of_study}
                />

                <InformationItem
                  label="Graduation year"
                  value={candidate?.graduation_year}
                />

                <InformationItem
                  label="Preferred LTC programme"
                  value={candidate?.preferred_programme}
                />

                <InformationItem
                  wide
                  label="Skills and experience"
                  value={candidate?.skills_experience}
                />
              </InformationGrid>
            </InformationSection>

            <InformationSection title="Uploaded Documents">
              {documentError && (
                <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-4 text-red-700">
                  {documentError}
                </div>
              )}

              {documents.length === 0 ? (
                <p className="text-slate-600">
                  No documents have been uploaded.
                </p>
              ) : (
                <div className="space-y-3">
                  {documents.map((document) => (
                    <DocumentRow
                      key={document.id}
                      document={document}
                      opening={openingDocumentId === document.id}
                      onOpen={() => handleOpenDocument(document)}
                    />
                  ))}
                </div>
              )}
            </InformationSection>
          </div>

          <aside className="space-y-6">
            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-blue-900">
                Application Summary
              </h2>

              <div className="mt-5 space-y-4">
                <SummaryItem label="Admission intake" value={intake?.name} />

                <SummaryItem
                  label="Progress"
                  value={`${application.completion_percentage}%`}
                />

                <SummaryItem
                  label="Submitted"
                  value={formatDateTime(application.submitted_at)}
                />

                <SummaryItem
                  label="Declaration accepted"
                  value={formatDateTime(application.declaration_accepted_at)}
                />

                <SummaryItem
                  label="Privacy consent"
                  value={formatDateTime(application.privacy_consent_at)}
                />

                <SummaryItem
                  label="Documents uploaded"
                  value={documents.length}
                />
              </div>
            </section>

            <section className="rounded-xl border border-blue-200 bg-blue-50 p-6">
              <h2 className="text-lg font-bold text-blue-900">
                LTC Admin Review
              </h2>

              <p className="mt-3 text-sm leading-6 text-blue-900">
                Check the candidate’s information and uploaded documents before
                making a decision.
              </p>

              {(localReviewError || reviewError) && (
                <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {localReviewError || reviewError?.message}
                </div>
              )}

              <div className="mt-5">
                <label
                  htmlFor="reviewComments"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >
                  Review comments
                </label>

                <textarea
                  id="reviewComments"
                  value={comments}
                  onChange={(event) => {
                    setComments(event.target.value);
                    setLocalReviewError("");
                  }}
                  rows={5}
                  maxLength={2000}
                  disabled={reviewing}
                  placeholder="Enter comments, correction instructions or rejection reason."
                  className="w-full resize-y rounded-md border border-slate-300 bg-white px-3 py-3 outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
                />

                <p className="mt-1 text-right text-xs text-slate-500">
                  {comments.length}/2000
                </p>
              </div>

              <div className="mt-5 space-y-3">
                <button
                  type="button"
                  onClick={() => handleReview("approved")}
                  disabled={
                    reviewing || application.status !== "pending_ltc_review"
                  }
                  className="w-full rounded-md bg-blue-900 px-4 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {reviewing ? "Processing..." : "Approve Application"}
                </button>

                <button
                  type="button"
                  onClick={() => handleReview("correction_required")}
                  disabled={
                    reviewing || application.status !== "pending_ltc_review"
                  }
                  className="w-full rounded-md border border-amber-500 bg-white px-4 py-3 font-semibold text-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Request Correction
                </button>

                <button
                  type="button"
                  onClick={() => handleReview("rejected")}
                  disabled={
                    reviewing || application.status !== "pending_ltc_review"
                  }
                  className="w-full rounded-md border border-red-500 bg-white px-4 py-3 font-semibold text-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Reject Application
                </button>
              </div>

              {application.status !== "pending_ltc_review" && (
                <p className="mt-4 text-sm font-medium text-slate-600">
                  A decision has already been made for this application.
                </p>
              )}
            </section>

            {/* <section className="rounded-xl border border-blue-200 bg-blue-50 p-6">
              <h2 className="text-lg font-bold text-blue-900">
                LTC Admin Review
              </h2>

              <p className="mt-3 text-sm leading-6 text-blue-900">
                Check the candidate’s information and uploaded
                documents before making a decision.
              </p>

              <div className="mt-5 space-y-3">
                <button
                  type="button"
                  disabled
                  className="w-full rounded-md bg-blue-900 px-4 py-3 font-semibold text-white opacity-60"
                >
                  Approve Application
                </button>

                <button
                  type="button"
                  disabled
                  className="w-full rounded-md border border-amber-500 px-4 py-3 font-semibold text-amber-700 opacity-60"
                >
                  Request Correction
                </button>

                <button
                  type="button"
                  disabled
                  className="w-full rounded-md border border-red-500 px-4 py-3 font-semibold text-red-700 opacity-60"
                >
                  Reject Application
                </button>
              </div>

              <p className="mt-4 text-xs text-slate-600">
                Decision buttons will be activated after the
                secure review function is added.
              </p>
            </section> */}
          </aside>
        </div>
      </div>
    </main>
  );
}

function InformationSection({ title, children }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="border-b border-slate-200 pb-4 text-xl font-bold text-blue-900">
        {title}
      </h2>

      <div className="mt-5">{children}</div>
    </section>
  );
}

function InformationGrid({ children }) {
  return <div className="grid gap-5 md:grid-cols-2">{children}</div>;
}

function InformationItem({ label, value, wide = false }) {
  return (
    <div className={wide ? "md:col-span-2" : ""}>
      <p className="text-sm text-slate-500">{label}</p>

      <p className="mt-1 font-medium text-slate-900">
        {value || "Not provided"}
      </p>
    </div>
  );
}

function SummaryItem({ label, value }) {
  return (
    <div className="border-b border-slate-200 pb-3 last:border-0">
      <p className="text-sm text-slate-500">{label}</p>

      <p className="mt-1 font-semibold text-slate-900">
        {value || "Not available"}
      </p>
    </div>
  );
}

function DocumentRow({ document, opening, onOpen }) {
  const type = document.document_types;

  return (
    <div className="flex flex-col justify-between gap-4 rounded-lg border border-slate-200 p-4 sm:flex-row sm:items-center">
      <div>
        <p className="font-semibold text-slate-900">
          {type?.name || formatValue(type?.code) || "Document"}
        </p>

        <p className="mt-1 text-sm text-slate-600">
          {document.original_filename}
        </p>

        {document.document_subtype && (
          <p className="mt-1 text-xs text-slate-500">
            Type: {formatValue(document.document_subtype)}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <DocumentStatus status={document.verification_status} />

        <button
          type="button"
          onClick={onOpen}
          disabled={opening}
          className="rounded-md border border-blue-800 px-4 py-2 text-sm font-semibold text-blue-800 disabled:opacity-60"
        >
          {opening ? "Opening..." : "View"}
        </button>
      </div>
    </div>
  );
}

function DocumentStatus({ status }) {
  return (
    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
      {formatValue(status || "pending")}
    </span>
  );
}

function StatusBadge({ status }) {
  const labels = {
    pending_ltc_review: "Pending LTC Review",
    correction_required: "Correction Required",
    rejected: "Rejected",
    awaiting_local_endorsement: "Awaiting Local Endorsement",
  };

  return (
    <span className="w-fit rounded-full bg-amber-100 px-4 py-2 font-semibold text-amber-800">
      {labels[status] || formatValue(status)}
    </span>
  );
}

function formatValue(value) {
  if (!value) {
    return "";
  }

  return String(value)
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatDate(value) {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
  }).format(new Date(value));
}

function formatDateTime(value) {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function PageMessage({ message, error = false }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div
        className={
          error
            ? "rounded-lg bg-red-50 p-5 text-red-700"
            : "rounded-lg bg-white p-5 text-slate-600 shadow"
        }
      >
        {message}
      </div>
    </main>
  );
}
