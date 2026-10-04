import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { Link } from "react-router-dom";

import AdminLayout from "../../layouts/AdminLayout";
import { useAdminEndorsementTracking } from "../../hooks/useAdminEndorsements";

const EMPTY_APPLICATIONS = [];

const statusOptions = [
  { value: "all", label: "All Application Stages" },
  { value: "pending_local_endorsement", label: "Waiting for Local Leader" },
  { value: "pending_final_endorsement", label: "Waiting for Area President" },
  { value: "correction_required", label: "Returned for Correction" },
  { value: "rejected", label: "Rejected" },
  { value: "admission_completed", label: "Admission Completed" },
  { value: "awaiting_room", label: "Awaiting Room" },
  { value: "room_allocated", label: "Room Allocated" },
];

const controlClass =
  "h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-100";

export default function AdminEndorsementsPage() {
  const { data, isLoading, isFetching, error, refetch } =
    useAdminEndorsementTracking();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [warningFilter, setWarningFilter] = useState("all");
  const [selectedComments, setSelectedComments] = useState(null);

  const applications = data?.applications || EMPTY_APPLICATIONS;

  const filteredApplications = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return applications.filter((application) => {
      const searchableText = [
        application.candidate_name,
        application.candidate_email,
        application.application_number,
        application.admission_number,
        application.local_unit_name,
        application.area_name,
        application.local_leader_name,
        application.area_leader_name,
        application.intake_name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !searchValue || searchableText.includes(searchValue);

      const matchesStatus =
        statusFilter === "all" ||
        application.application_status === statusFilter;

      const matchesWarning =
        warningFilter === "all" ||
        (warningFilter === "warnings"
          ? Boolean(application.warning)
          : !application.warning);

      return matchesSearch && matchesStatus && matchesWarning;
    });
  }, [applications, search, statusFilter, warningFilter]);

  const hasFilters =
    Boolean(search.trim()) ||
    statusFilter !== "all" ||
    warningFilter !== "all";

  function clearFilters() {
    setSearch("");
    setStatusFilter("all");
    setWarningFilter("all");
  }

  function openComments(application, stage) {
    const isLocal = stage === "local";

    setSelectedComments({
      candidateName: application.candidate_name || "Unknown candidate",
      applicationNumber: application.application_number || "Number pending",
      stage: isLocal
        ? "Bishop / Branch President"
        : "Stake / District President",
      leaderName: isLocal
        ? application.local_leader_name
        : application.area_leader_name,
      decision: isLocal
        ? application.local_endorsement_decision
        : application.final_endorsement_decision,
      date: isLocal
        ? application.local_endorsed_at
        : application.final_endorsed_at,
      comments: isLocal
        ? application.local_endorsement_comments
        : application.final_endorsement_comments,
    });
  }

  return (
    <AdminLayout
      title="Endorsement Tracking"
      description="View Church leader decisions and monitor each candidate’s endorsement progress."
    >
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Waiting for Local Leader"
          value={data?.pendingLocal || 0}
          description="Bishop or branch president"
          color="blue"
        />
        <SummaryCard
          label="Waiting for Area President"
          value={data?.pendingFinal || 0}
          description="Stake or district president"
          color="purple"
        />
        <SummaryCard
          label="Final Endorsements Completed"
          value={data?.completed || 0}
          description="Final decision recorded as endorsed"
          color="green"
        />
        <SummaryCard
          label="Requires Attention"
          value={data?.warnings || 0}
          description="Assignment or delay warnings"
          color="amber"
        />
      </section>

      <section className="mt-6 min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Candidate Endorsements
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Local and final decisions, leader details, and comments.
              </p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {applications.length} records
            </span>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <label>
              <span className="mb-1.5 block text-xs font-semibold text-slate-600">
                Search
              </span>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Candidate, number, unit or leader"
                className={controlClass}
              />
            </label>

            <label>
              <span className="mb-1.5 block text-xs font-semibold text-slate-600">
                Application stage
              </span>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className={controlClass}
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span className="mb-1.5 block text-xs font-semibold text-slate-600">
                Attention
              </span>
              <select
                value={warningFilter}
                onChange={(event) => setWarningFilter(event.target.value)}
                className={controlClass}
              >
                <option value="all">All Records</option>
                <option value="warnings">Requires Attention</option>
                <option value="clear">No Warning</option>
              </select>
            </label>

            <div className="flex items-end gap-2">
              <button
                type="button"
                onClick={() => refetch()}
                disabled={isFetching}
                className="h-11 flex-1 rounded-lg bg-blue-900 px-4 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
              >
                {isFetching ? "Refreshing..." : "Refresh"}
              </button>
              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="h-11 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {isLoading ? (
          <PageNotice message="Loading endorsement tracking..." />
        ) : error ? (
          <PageNotice error message={error.message} />
        ) : filteredApplications.length === 0 ? (
          <PageNotice message="No endorsement records match the selected filters." />
        ) : (
          <>
            <div className="space-y-4 bg-slate-50 p-4 lg:hidden">
              {filteredApplications.map((application) => (
                <MobileCard
                  key={application.id}
                  application={application}
                  onViewComments={openComments}
                />
              ))}
            </div>

            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[1100px] divide-y divide-slate-200">
                <caption className="sr-only">
                  Candidate applications and Church leader decisions
                </caption>
                <thead className="bg-slate-50">
                  <tr>
                    <Heading>Candidate</Heading>
                    <Heading>Church Unit</Heading>
                    <Heading>Local Leader</Heading>
                    <Heading>Area President</Heading>
                    <Heading>Application Status</Heading>
                    <Heading>Action</Heading>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredApplications.map((application) => (
                    <EndorsementRow
                      key={application.id}
                      application={application}
                      onViewComments={openComments}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        <div className="border-t border-slate-200 bg-slate-50/50 px-5 py-4 text-xs text-slate-500">
          Showing {filteredApplications.length} of {applications.length} records
        </div>
      </section>

      <CommentsModal
        details={selectedComments}
        onClose={() => setSelectedComments(null)}
      />
    </AdminLayout>
  );
}

function EndorsementRow({ application, onViewComments }) {
  return (
    <tr className="transition-colors hover:bg-slate-50/70">
      <td className="w-[240px] px-5 py-5 align-top">
        <CandidateDetails application={application} />
      </td>
      <td className="w-[180px] px-5 py-5 align-top">
        <ChurchUnit application={application} />
      </td>
      <td className="w-[220px] px-5 py-5 align-top">
        <LeaderDecision
          application={application}
          stage="local"
          onViewComments={onViewComments}
        />
      </td>
      <td className="w-[220px] px-5 py-5 align-top">
        <LeaderDecision
          application={application}
          stage="final"
          onViewComments={onViewComments}
        />
      </td>
      <td className="w-[180px] px-5 py-5 align-top">
        <ApplicationStage application={application} />
      </td>
      <td className="px-5 py-5 align-top">
        <ApplicationLink applicationId={application.id} />
      </td>
    </tr>
  );
}

function MobileCard({ application, onViewComments }) {
  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 p-5">
        <CandidateDetails application={application} />
        <div className="mt-4">
          <ApplicationStage application={application} />
        </div>
      </div>

      <div className="p-5">
        <ChurchUnit application={application} />

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {[
            ["local", "Bishop / Branch President"],
            ["final", "Stake / District President"],
          ].map(([stage, label]) => (
            <section
              key={stage}
              className="rounded-lg border border-slate-200 p-4"
            >
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                {label}
              </h3>
              <LeaderDecision
                application={application}
                stage={stage}
                onViewComments={onViewComments}
              />
            </section>
          ))}
        </div>

        <div className="mt-5">
          <ApplicationLink applicationId={application.id} fullWidth />
        </div>
      </div>
    </article>
  );
}

function CandidateDetails({ application }) {
  return (
    <div>
      <p className="text-sm font-semibold leading-6 text-slate-900">
        {application.candidate_name || "Unknown candidate"}
      </p>
      <p className="mt-1 break-words font-mono text-xs text-slate-500">
        {application.application_number || "Number pending"}
      </p>
      {application.admission_number && (
        <p className="mt-2 text-xs font-semibold text-blue-800">
          Admission: {application.admission_number}
        </p>
      )}
      <p className="mt-2 text-xs leading-5 text-slate-400">
        {application.intake_name || "Current intake"}
      </p>
    </div>
  );
}

function ChurchUnit({ application }) {
  return (
    <div>
      <p className="text-sm font-medium leading-6 text-slate-800">
        {application.local_unit_name || "No local unit"}
      </p>
      <p className="mt-1 text-xs leading-5 text-slate-500">
        {application.area_name || "No assigned area"}
      </p>
    </div>
  );
}

function LeaderDecision({ application, stage, onViewComments }) {
  const isLocal = stage === "local";
  const decision = isLocal
    ? application.local_endorsement_decision
    : application.final_endorsement_decision;
  const leaderName = isLocal
    ? application.local_leader_name
    : application.area_leader_name;
  const date = isLocal
    ? application.local_endorsed_at
    : application.final_endorsed_at;
  const comments = isLocal
    ? application.local_endorsement_comments
    : application.final_endorsement_comments;
  const hasComments =
    typeof comments === "string" && Boolean(comments.trim());

  return (
    <div className="space-y-2">
      <DecisionBadge value={decision} />

      <div>
        <p className="text-xs font-medium leading-5 text-slate-700">
          {leaderName ||
            (isLocal
              ? "No active local leader"
              : "No active area president")}
        </p>
        {date && (
          <p className="mt-0.5 text-xs text-slate-400">
            {formatDate(date)}
          </p>
        )}
      </div>

      {hasComments ? (
        <button
          type="button"
          aria-haspopup="dialog"
          aria-label={`View ${
            isLocal ? "local leader" : "area president"
          } comments for ${application.candidate_name || "candidate"}`}
          onClick={() => onViewComments(application, stage)}
          className="inline-flex rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-800 transition hover:bg-blue-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
        >
          View comments
        </button>
      ) : decision ? (
        <p className="text-xs italic text-slate-400">
          No comments recorded
        </p>
      ) : null}
    </div>
  );
}

function CommentsModal({ details, onClose }) {
  const dialogRef = useRef(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (details && !dialog.open) {
      dialog.showModal();
    } else if (!details && dialog.open) {
      dialog.close();
    }
  }, [details]);

  useEffect(() => {
    if (!details) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [details]);

  const comments =
    typeof details?.comments === "string"
      ? details.comments.trim()
      : "";

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClose={onClose}
      className="m-auto w-[92vw] max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl border-0 bg-white p-0 shadow-2xl backdrop:bg-slate-900/60"
    >
      <div className="flex max-h-[90vh] flex-col">
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-200 px-6 py-5 sm:px-8">
          <div>
            <h2
              id={titleId}
              className="text-xl font-bold text-slate-900"
            >
              Leader Comments
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {details?.stage}
            </p>
          </div>

          <button
            type="button"
            autoFocus
            onClick={onClose}
            aria-label="Close comments"
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-700"
          >
            Close
          </button>
        </header>

        <div className="min-h-0 overflow-y-auto px-6 py-6 sm:px-8">
          <section className="rounded-xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Candidate
            </p>
            <p className="mt-1 text-base font-semibold text-slate-900">
              {details?.candidateName}
            </p>
            <p className="mt-1 break-words font-mono text-xs text-slate-500">
              {details?.applicationNumber}
            </p>

            <div className="mt-5 flex flex-wrap items-start justify-between gap-4 border-t border-slate-200 pt-4">
              <div>
                <p className="text-xs text-slate-500">Leader</p>
                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {details?.leaderName || "Leader unavailable"}
                </p>
                {details?.date && (
                  <p className="mt-1 text-xs text-slate-500">
                    {formatDate(details.date)}
                  </p>
                )}
              </div>
              <DecisionBadge value={details?.decision} />
            </div>
          </section>

          <section className="mt-6">
            <h3 className="text-sm font-semibold text-slate-900">
              Comments
            </h3>
            <div className="mt-3 min-h-[180px] rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
              <p className="whitespace-pre-wrap break-words text-base leading-8 text-slate-700">
                {comments || "No comments recorded."}
              </p>
            </div>
          </section>
        </div>

        <footer className="flex shrink-0 justify-end border-t border-slate-200 bg-slate-50 px-6 py-4 sm:px-8">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-blue-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"
          >
            Done
          </button>
        </footer>
      </div>
    </dialog>
  );
}

function ApplicationStage({ application }) {
  const days = Number(application.days_waiting) || 0;

  return (
    <div>
      <StatusBadge status={application.application_status} />
      {isWaitingStatus(application.application_status) && (
        <p className="mt-2 text-xs text-slate-500">
          {days} {days === 1 ? "day" : "days"} waiting
        </p>
      )}
      {application.warning && (
        <WarningBadge warning={application.warning} />
      )}
    </div>
  );
}

function ApplicationLink({ applicationId, fullWidth = false }) {
  return (
    <Link
      to={`/admin/applications/${applicationId}`}
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-blue-900 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 ${
        fullWidth ? "w-full" : ""
      }`}
    >
      View application
    </Link>
  );
}

function SummaryCard({ label, value, description, color }) {
  const colors = {
    blue: "bg-blue-50 text-blue-800",
    purple: "bg-purple-50 text-purple-800",
    green: "bg-emerald-50 text-emerald-800",
    amber: "bg-amber-50 text-amber-800",
  };

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-slate-600">{label}</p>
      <span
        className={`mt-4 inline-flex min-w-[56px] items-center justify-center rounded-lg px-3 py-2 text-2xl font-bold ${
          colors[color] || colors.blue
        }`}
      >
        {value}
      </span>
      <p className="mt-3 text-xs leading-5 text-slate-400">
        {description}
      </p>
    </article>
  );
}

function Heading({ children }) {
  return (
    <th
      scope="col"
      className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
    >
      {children}
    </th>
  );
}

function DecisionBadge({ value }) {
  const colors = {
    approved: "bg-emerald-50 text-emerald-800 ring-emerald-200",
    endorsed: "bg-emerald-50 text-emerald-800 ring-emerald-200",
    correction_required: "bg-amber-50 text-amber-800 ring-amber-200",
    rejected: "bg-red-50 text-red-700 ring-red-200",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
        colors[value] || "bg-slate-50 text-slate-500 ring-slate-200"
      }`}
    >
      {formatDecision(value)}
    </span>
  );
}

function StatusBadge({ status }) {
  const colors = {
    pending_local_endorsement: "bg-blue-50 text-blue-800 ring-blue-200",
    pending_final_endorsement: "bg-purple-50 text-purple-800 ring-purple-200",
    correction_required: "bg-amber-50 text-amber-800 ring-amber-200",
    rejected: "bg-red-50 text-red-700 ring-red-200",
    admission_completed: "bg-emerald-50 text-emerald-800 ring-emerald-200",
    awaiting_room: "bg-cyan-50 text-cyan-800 ring-cyan-200",
    room_allocated: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  };

  const labels = {
    pending_local_endorsement: "Awaiting Local Leader",
    pending_final_endorsement: "Awaiting Area President",
    correction_required: "Correction Required",
    rejected: "Rejected",
    admission_completed: "Admission Completed",
    awaiting_room: "Awaiting Room",
    room_allocated: "Room Allocated",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
        colors[status] || "bg-slate-50 text-slate-700 ring-slate-200"
      }`}
    >
      {labels[status] || formatText(status)}
    </span>
  );
}

function WarningBadge({ warning }) {
  const labels = {
    missing_local_unit: "Missing local unit",
    missing_local_leader: "No active local leader",
    missing_area_president: "No active area president",
    delayed: "Endorsement delayed",
  };

  return (
    <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium leading-5 text-amber-800">
      {labels[warning] || "Requires attention"}
    </p>
  );
}

function PageNotice({ message, error = false }) {
  return (
    <div
      role={error ? "alert" : "status"}
      className={`px-6 py-14 text-center text-sm ${
        error ? "bg-red-50 text-red-700" : "text-slate-500"
      }`}
    >
      {message}
    </div>
  );
}

function formatDecision(value) {
  const labels = {
    approved: "Approved",
    endorsed: "Endorsed",
    correction_required: "Correction Required",
    rejected: "Rejected",
  };

  return value ? labels[value] || formatText(value) : "Not recorded";
}

function formatText(value) {
  if (!value) return "Not available";

  return String(value)
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value) {
  const date = new Date(value);
  if (!value || Number.isNaN(date.getTime())) return "Not available";

  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
  }).format(date);
}

function isWaitingStatus(status) {
  return [
    "pending_local_endorsement",
    "pending_final_endorsement",
  ].includes(status);
}