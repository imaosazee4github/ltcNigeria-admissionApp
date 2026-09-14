import {
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import LeaderLayout from "../../layouts/LeaderLayout";
import HonorCodeModal from "../../components/common/HonorCodeModal";

import {
  useLocalEndorsementQueue,
  useSubmitLocalEndorsement,
} from "../../hooks/useLocalEndorsements";

const initialResponses = {
  leader_known_three_months: "",
  previous_leader_name: "",
  previous_leader_calling: "",
  previous_leader_phone: "",
  previous_leader_email: "",

  church_attendance: "",
  mission_completion: "",

  current_temple_recommend: "",
  temple_recommend_commitment: "",

  honor_code_reviewed: "",
  honor_code_compliance: "",

  legal_concern: "",
  moral_conduct: "",
  word_of_wisdom: "",
  applicant_readiness: "",

  leader_declaration: false,
};

const questions = [
  {
    name: "church_attendance",
    label:
      "How frequently does the applicant attend Church meetings?",
    options: [
      {
        value: "every_week",
        label: "Every week",
      },
      {
        value: "twice_per_month",
        label: "Approximately twice per month",
      },
      {
        value: "infrequently",
        label: "Infrequently",
      },
      {
        value: "unable_to_determine",
        label: "Unable to determine",
      },
    ],
  },
  {
    name: "mission_completion",
    label:
      "Has the applicant honorably completed full-time missionary service?",
    options: [
      {
        value: "yes",
        label: "Yes",
      },
      {
        value: "no",
        label: "No",
      },
      {
        value: "currently_serving",
        label: "Currently serving",
      },
      {
        value: "not_applicable",
        label: "Not applicable",
      },
    ],
  },
  {
    name: "current_temple_recommend",
    label:
      "Does the applicant currently hold a valid temple recommend?",
    options: [
      {
        value: "yes",
        label: "Yes",
      },
      {
        value: "no",
        label: "No",
      },
      {
        value: "unable_to_confirm",
        label: "Unable to confirm",
      },
    ],
  },
  {
    name: "temple_recommend_commitment",
    label:
      "Is the applicant committed to maintaining the standards required to remain worthy of a temple recommend?",
    options: [
      {
        value: "yes",
        label: "Yes",
      },
      {
        value: "no",
        label: "No",
      },
      {
        value: "further_discussion",
        label: "Further discussion is required",
      },
    ],
  },
  {
    name: "honor_code_reviewed",
    label:
      "Have you reviewed the LTC Nigeria Code of Honor and Dress and Grooming Standards with the applicant?",
    options: [
      {
        value: "yes",
        label: "Yes",
      },
      {
        value: "no",
        label: "No",
      },
    ],
  },
  {
    name: "honor_code_compliance",
    label:
      "To the best of your knowledge, is the applicant living the LTC Nigeria Honor Code and committed to following it throughout enrollment?",
    options: [
      {
        value: "yes",
        label: "Yes",
      },
      {
        value: "no",
        label: "No",
      },
      {
        value: "further_discussion",
        label: "Further discussion is required",
      },
    ],
  },
  {
    name: "legal_concern",
    label:
      "To the best of your knowledge, is the applicant currently on probation or parole, or do they have a criminal conviction that LTC Nigeria should review?",
    options: [
      {
        value: "yes",
        label: "Yes",
      },
      {
        value: "no",
        label: "No",
      },
      {
        value: "not_aware",
        label: "I am not aware",
      },
    ],
  },
  {
    name: "moral_conduct",
    label:
      "To the best of your knowledge, is the applicant living the law of chastity and maintaining morally clean conduct?",
    options: [
      {
        value: "yes",
        label: "Yes",
      },
      {
        value: "no",
        label: "No",
      },
      {
        value: "further_discussion",
        label: "Further discussion is required",
      },
    ],
  },
  {
    name: "word_of_wisdom",
    label:
      "To the best of your knowledge, does the applicant obey the Word of Wisdom?",
    options: [
      {
        value: "yes",
        label: "Yes",
      },
      {
        value: "no",
        label: "No",
      },
      {
        value: "further_discussion",
        label: "Further discussion is required",
      },
    ],
  },
  {
    name: "applicant_readiness",
    label:
      "Is the applicant spiritually, morally, emotionally, and socially prepared to participate successfully in the LTC Nigeria programme?",
    options: [
      {
        value: "yes",
        label: "Yes",
      },
      {
        value: "no",
        label: "No",
      },
      {
        value: "further_evaluation",
        label: "Further evaluation is recommended",
      },
    ],
  },
];

export default function LocalEndorsementReviewPage() {
  const { applicationId } = useParams();
  const navigate = useNavigate();

  const {
    data,
    isLoading,
    error,
  } = useLocalEndorsementQueue();

  const {
    submitEndorsement,
    submitting,
    submissionError,
  } = useSubmitLocalEndorsement(
    applicationId
  );

  const [responses, setResponses] =
    useState(initialResponses);

  const [decision, setDecision] =
    useState("");

  const [comments, setComments] =
    useState("");

  const [formError, setFormError] =
    useState("");

  const [honorCodeOpen, setHonorCodeOpen] =
    useState(false);

  const application = useMemo(
    () =>
      data?.applications?.find(
        (item) =>
          String(item.id) ===
          String(applicationId)
      ),
    [
      data?.applications,
      applicationId,
    ]
  );

  // const dashboardRoute =
  //   data?.leaderRole ===
  //   "branch_president"
  //     ? "/branch-president/dashboard"
  //     : "/bishop/dashboard";

  const endorsementsRoute =
  '/leader/endorsements';

  function updateResponse(name, value) {
    setResponses((current) => ({
      ...current,
      [name]: value,
    }));

    setFormError("");
  }

  function validateForm() {
    if (
      !responses.leader_known_three_months
    ) {
      return "Indicate how long you have served as the applicant’s ecclesiastical leader.";
    }

    if (
      responses.leader_known_three_months ===
      "no"
    ) {
      if (
        !responses.previous_leader_name.trim()
      ) {
        return "Enter the previous ecclesiastical leader’s name.";
      }

      if (
        !responses.previous_leader_calling
      ) {
        return "Select the previous ecclesiastical leader’s calling.";
      }

      if (
        !responses.previous_leader_phone.trim() &&
        !responses.previous_leader_email.trim()
      ) {
        return "Enter the previous leader’s phone number or email address.";
      }
    }

    const unansweredQuestion =
      questions.find(
        (question) =>
          !responses[question.name]
      );

    if (unansweredQuestion) {
      return `Please answer: ${unansweredQuestion.label}`;
    }

    if (!decision) {
      return "Select an endorsement decision.";
    }

    if (
      decision !== "endorsed" &&
      !comments.trim()
    ) {
      return "Comments are required when requesting a correction or rejecting the application.";
    }

    if (
      !responses.leader_declaration
    ) {
      return "You must confirm the leader declaration.";
    }

    return "";
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const validationError =
      validateForm();

    if (validationError) {
      setFormError(validationError);
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to submit this endorsement? You will not be able to edit it from this page afterward."
    );

    if (!confirmed) {
      return;
    }

    setFormError("");

    try {
      await submitEndorsement({
        decision,
        comments,
        responses: {
          ...responses,

          previous_leader_name:
            responses.leader_known_three_months ===
            "no"
              ? responses.previous_leader_name.trim()
              : null,

          previous_leader_calling:
            responses.leader_known_three_months ===
            "no"
              ? responses.previous_leader_calling
              : null,

          previous_leader_phone:
            responses.leader_known_three_months ===
            "no"
              ? responses.previous_leader_phone.trim() ||
                null
              : null,

          previous_leader_email:
            responses.leader_known_three_months ===
            "no"
              ? responses.previous_leader_email
                  .trim()
                  .toLowerCase() ||
                null
              : null,
        },
      });

      navigate(endorsementsRoute, {
        replace: true,
      });
    } catch (submitError) {
      setFormError(
        submitError.message ||
          "The endorsement could not be submitted."
      );
    }
  }

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
        <main className="p-6 md:p-8">
          <div className="mx-auto max-w-3xl rounded-xl border border-amber-200 bg-amber-50 p-6">
            <h1 className="text-xl font-bold text-amber-900">
              Application unavailable
            </h1>

            <p className="mt-2 text-amber-800">
              This application is not in
              your endorsement queue. It may
              have already been processed.
            </p>

            <button
              type="button"
              onClick={() =>
                navigate(endorsementsRoute)
              }
              className="mt-5 rounded-md bg-blue-900 px-5 py-3 font-semibold text-white"
            >
              Return to Dashboard
            </button>
          </div>
        </main>
      </LeaderLayout>
    );
  }

  return (
    <LeaderLayout>
      <main className="p-6 md:p-8">
        <div className="mx-auto max-w-5xl">
          <button
            type="button"
            onClick={() =>
              navigate(endorsementsRoute)
            }
            className="text-sm font-semibold text-blue-800 hover:underline"
          >
            ← Back to Dashboard
          </button>

          <div className="mt-5">
            <p className="text-sm font-semibold uppercase tracking-wider text-amber-600">
              Local Ecclesiastical Endorsement
            </p>

            <h1 className="mt-2 text-3xl font-bold text-blue-900">
              Review Candidate
            </h1>
          </div>

          <CandidateSummary
            application={application}
          />

          <form
            onSubmit={handleSubmit}
            className="mt-6 space-y-6"
          >
            <FormSection
              title="Leader Instructions"
              description="Complete the interview before submitting this endorsement."
            >
              <ol className="list-decimal space-y-2 pl-5 text-sm text-slate-700">
                <li>
                  Personally interview the
                  applicant.
                </li>

                <li>
                  Review the{" "}
                  <button
                    type="button"
                    onClick={() =>
                      setHonorCodeOpen(true)
                    }
                    className="font-semibold text-blue-800 underline"
                  >
                    LTC Nigeria Code of Honor
                    and Dress and Grooming
                    Standards
                  </button>{" "}
                  with the applicant.
                </li>

                <li>
                  Confirm the applicant’s
                  temple recommend status and
                  commitment.
                </li>

                <li>
                  Answer every question
                  truthfully.
                </li>
              </ol>
            </FormSection>

            <FormSection title="Ecclesiastical Leadership">
              <RadioQuestion
                number={1}
                name="leader_known_three_months"
                label="Have you served as the applicant’s ecclesiastical leader for at least three months?"
                value={
                  responses.leader_known_three_months
                }
                options={[
                  {
                    value: "yes",
                    label: "Yes",
                  },
                  {
                    value: "no",
                    label: "No",
                  },
                ]}
                onChange={updateResponse}
              />

              {responses.leader_known_three_months ===
                "no" && (
                <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-5">
                  <h3 className="font-bold text-amber-900">
                    Previous ecclesiastical
                    leader
                  </h3>

                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <TextField
                      label="Full name"
                      value={
                        responses.previous_leader_name
                      }
                      onChange={(value) =>
                        updateResponse(
                          "previous_leader_name",
                          value
                        )
                      }
                      required
                    />

                    <SelectField
                      label="Calling"
                      value={
                        responses.previous_leader_calling
                      }
                      onChange={(value) =>
                        updateResponse(
                          "previous_leader_calling",
                          value
                        )
                      }
                      options={[
                        {
                          value: "bishop",
                          label: "Bishop",
                        },
                        {
                          value:
                            "branch_president",
                          label:
                            "Branch President",
                        },
                        {
                          value:
                            "mission_president",
                          label:
                            "Mission President",
                        },
                        {
                          value: "other",
                          label: "Other",
                        },
                      ]}
                      required
                    />

                    <TextField
                      label="Phone number"
                      value={
                        responses.previous_leader_phone
                      }
                      onChange={(value) =>
                        updateResponse(
                          "previous_leader_phone",
                          value
                        )
                      }
                      type="tel"
                    />

                    <TextField
                      label="Email address"
                      value={
                        responses.previous_leader_email
                      }
                      onChange={(value) =>
                        updateResponse(
                          "previous_leader_email",
                          value
                        )
                      }
                      type="email"
                    />
                  </div>
                </div>
              )}
            </FormSection>

            <FormSection title="Candidate Assessment">
              <div className="divide-y divide-slate-200">
                {questions.map(
                  (question, index) => (
                    <RadioQuestion
                      key={question.name}
                      number={index + 2}
                      name={question.name}
                      label={question.label}
                      value={
                        responses[
                          question.name
                        ]
                      }
                      options={
                        question.options
                      }
                      onChange={
                        updateResponse
                      }
                    />
                  )
                )}
              </div>
            </FormSection>

            <FormSection title="Recommendation">
              <RadioQuestion
                number={12}
                name="decision"
                label="After interviewing the applicant, what is your recommendation?"
                value={decision}
                options={[
                  {
                    value: "endorsed",
                    label:
                      "Recommend for final endorsement",
                  },
                  {
                    value:
                      "correction_required",
                    label:
                      "Return for correction",
                  },
                  {
                    value: "rejected",
                    label:
                      "Do not recommend",
                  },
                ]}
                onChange={(
                  name,
                  value
                ) => {
                  setDecision(value);
                  setFormError("");
                }}
              />

              <div className="mt-6">
                <label
                  htmlFor="comments"
                  className="block font-semibold text-slate-800"
                >
                  Confidential comments
                </label>

                <p className="mt-1 text-sm text-slate-500">
                  Comments are required when
                  returning or rejecting an
                  application.
                </p>

                <textarea
                  id="comments"
                  rows={5}
                  value={comments}
                  onChange={(event) =>
                    setComments(
                      event.target.value
                    )
                  }
                  className="mt-3 w-full rounded-md border border-slate-300 px-4 py-3 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
                  placeholder="Provide relevant information that will help LTC Nigeria evaluate and support the applicant."
                />
              </div>
            </FormSection>

            <FormSection title="Leader Declaration">
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={
                    responses.leader_declaration
                  }
                  onChange={(event) =>
                    updateResponse(
                      "leader_declaration",
                      event.target.checked
                    )
                  }
                  className="mt-1 h-5 w-5 rounded border-slate-300"
                />

                <span className="text-sm leading-6 text-slate-700">
                  I confirm that I personally
                  interviewed the applicant,
                  reviewed the LTC Nigeria Code
                  of Honor and Dress and
                  Grooming Standards with the
                  applicant, and answered these
                  questions accurately to the
                  best of my knowledge.
                </span>
              </label>
            </FormSection>

            {(formError ||
              submissionError) && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
                {formError ||
                  submissionError?.message}
              </div>
            )}

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() =>
                  navigate(endorsementsRoute)
                }
                disabled={submitting}
                className="rounded-md border border-slate-300 px-5 py-3 font-semibold text-slate-700 disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="rounded-md bg-blue-900 px-6 py-3 font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting
                  ? "Submitting..."
                  : "Submit Endorsement"}
              </button>
            </div>
          </form>
        </div>
      </main>

      <HonorCodeModal
        open={honorCodeOpen}
        onClose={() =>
          setHonorCodeOpen(false)
        }
        onReviewed={() =>
          updateResponse(
            "honor_code_reviewed",
            "yes"
          )
        }
      />
    </LeaderLayout>
  );
}

function CandidateSummary({
  application,
}) {
  return (
    <section className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-700">
            Candidate
          </p>

          <h2 className="mt-2 text-2xl font-bold text-blue-900">
            {application.candidate_name ||
              "Unknown candidate"}
          </h2>
        </div>

        <span className="w-fit rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-800">
          Pending Local Endorsement
        </span>
      </div>

      <div className="mt-5 grid gap-4 text-sm md:grid-cols-2 lg:grid-cols-3">
        <SummaryValue
          label="Application"
          value={
            application.application_number
          }
        />

        <SummaryValue
          label="Intake"
          value={application.intake_name}
        />

        <SummaryValue
          label="Local unit"
          value={
            application.local_unit_name
          }
        />

        <SummaryValue
          label="Email"
          value={
            application.candidate_email
          }
        />

        <SummaryValue
          label="Phone"
          value={
            application.candidate_phone
          }
        />

        <SummaryValue
          label="Membership number"
          value={
            application.membership_record_number
          }
        />
      </div>
    </section>
  );
}

function SummaryValue({
  label,
  value,
}) {
  return (
    <div>
      <p className="text-slate-500">
        {label}
      </p>

      <p className="mt-1 font-semibold text-slate-800">
        {value || "Not provided"}
      </p>
    </div>
  );
}

function FormSection({
  title,
  description,
  children,
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-blue-900">
        {title}
      </h2>

      {description && (
        <p className="mt-1 text-sm text-slate-600">
          {description}
        </p>
      )}

      <div className="mt-5">
        {children}
      </div>
    </section>
  );
}

function RadioQuestion({
  number,
  name,
  label,
  value,
  options,
  onChange,
}) {
  return (
    <fieldset className="py-5 first:pt-0 last:pb-0">
      <legend className="font-semibold leading-6 text-slate-800">
        {number}. {label}
      </legend>

      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        {options.map((option) => (
          <label
            key={option.value}
            className={`flex cursor-pointer items-center gap-2 rounded-md border px-4 py-3 text-sm ${
              value === option.value
                ? "border-blue-700 bg-blue-50 text-blue-900"
                : "border-slate-300 bg-white text-slate-700"
            }`}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={
                value === option.value
              }
              onChange={() =>
                onChange(
                  name,
                  option.value
                )
              }
              className="h-4 w-4"
            />

            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function TextField({
  label,
  value,
  onChange,
  type = "text",
  required = false,
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-700">
        {label}
      </span>

      <input
        type={type}
        value={value}
        required={required}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="mt-2 w-full rounded-md border border-slate-300 px-4 py-3 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  required = false,
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-700">
        {label}
      </span>

      <select
        value={value}
        required={required}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="mt-2 w-full rounded-md border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
      >
        <option value="">
          Select an option
        </option>

        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function PageMessage({
  message,
  error = false,
}) {
  return (
    <main className="flex min-h-[60vh] items-center justify-center p-6">
      <div
        className={
          error
            ? "rounded-lg border border-red-200 bg-red-50 p-5 text-red-700"
            : "rounded-lg bg-white p-5 text-slate-600 shadow"
        }
      >
        {message}
      </div>
    </main>
  );
}
