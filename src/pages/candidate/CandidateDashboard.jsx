import { Link } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";
import { useApplication } from "../../hooks/useApplication";

import CandidateLayout from "../../layouts/CandidateLayout";

export default function CandidateDashboard() {
  const { profile } = useAuth();

  const { data, isLoading, isFetching, error, refreshRoomAssignment } =
    useApplication(profile?.id);

  

  if (isLoading) {
    return (
      <CandidateLayout>
        <PageMessage message="Loading your dashboard..." />
      </CandidateLayout>
    );
  }

  const application = data?.application;

  const candidateProfile = data?.candidateProfile;

  const latestReview = data?.latestReview;



  const roomInformation = data?.roomAssignment || null;

  const roomStatus = roomInformation?.roomStatus || "not_available";

  const assignedRoom = roomInformation?.assignment || null;

  const localUnitType = candidateProfile?.local_unit_type;

  return (
    <CandidateLayout>
      <main className="p-5 md:p-8">
        <div className="mx-auto max-w-7xl">
          <header>
            <p className="text-sm font-semibold uppercase tracking-wider text-amber-600">
              Candidate Dashboard
            </p>

            <h1 className="mt-2 text-3xl font-bold text-blue-900">
              Welcome, {profile?.full_name || "Candidate"}
            </h1>

            <p className="mt-2 text-slate-600">
              Follow your admission progress and view important updates.
            </p>
          </header>

          {error && (
            <div className="mt-7 rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
              {error.message}
            </div>
          )}

          {!error && !data?.intake && (
            <div className="mt-7 rounded-xl border border-amber-200 bg-amber-50 p-6">
              <h2 className="font-bold text-amber-900">
                Applications are currently closed
              </h2>

              <p className="mt-2 text-sm text-amber-800">
                There is no open admission intake at this time.
              </p>
            </div>
          )}

          {application && (
            <>
              <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <SummaryCard
                  label="Application progress"
                  value={`${application.completion_percentage}%`}
                  description={`Step ${application.current_step} of 7`}
                  color="blue"
                />

                <SummaryCard
                  label="LTC review"
                  value={getLtcReviewStatus(application.status)}
                  description="Administrative review"
                  color="amber"
                />

                <SummaryCard
                  label="Local endorsement"
                  value={getLocalStatus(application.status)}
                  description={getLocalLeaderName(localUnitType)}
                  color="emerald"
                />

                <SummaryCard
                  label="Final endorsement"
                  value={getFinalStatus(application.status)}
                  description="Stake or District President"
                  color="purple"
                />
              </section>

              {application.status === "correction_required" && (
                <CorrectionNotice latestReview={latestReview} />
              )}

              {application.status === "rejected" && (
                <section className="mt-7 rounded-xl border border-red-200 bg-red-50 p-6">
                  <h2 className="text-xl font-bold text-red-800">
                    Application Not Approved
                  </h2>

                  <p className="mt-2 text-sm text-red-700">
                    Your application was not approved. Contact the LTC Admission
                    Office if you need further information.
                  </p>
                </section>
              )}

              <section className="mt-7 grid gap-6 xl:grid-cols-3">
                <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        Current Admission
                      </p>

                      <h2 className="mt-1 text-2xl font-bold text-blue-900">
                        {data?.intake?.name || "Current Intake"}
                      </h2>
                    </div>

                    <ApplicationStatus
                      status={application.status}
                      localUnitType={localUnitType}
                    />
                  </div>

                  <div className="mt-7">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-slate-700">
                        Application progress
                      </span>

                      <span className="font-bold text-blue-900">
                        {application.completion_percentage}%
                      </span>
                    </div>

                    <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-blue-900 transition-all"
                        style={{
                          width: `${application.completion_percentage}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="mt-7 rounded-lg bg-blue-50 p-5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                      What happens next?
                    </p>

                    <p className="mt-2 text-sm leading-6 text-slate-700">
                      {getStepMessage(application.status, localUnitType)}
                    </p>
                  </div>

                  <div className="mt-7">
                    <Link
                      to="/candidate/application"
                      className="inline-flex rounded-lg bg-blue-900 px-5 py-3 font-semibold text-white transition hover:bg-blue-800"
                    >
                      {getApplicationButtonLabel(application)}
                    </Link>
                  </div>
                </article>

                <ChurchUnitCard candidateProfile={candidateProfile} />
              </section>

              <section className="mt-7 grid gap-6 xl:grid-cols-3">
                <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
                  <h2 className="text-xl font-bold text-blue-900">
                    Admission Journey
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Track each stage of your admission process.
                  </p>

                  <div className="mt-6 space-y-5">
                    <JourneyItem
                      number="1"
                      title="Application submitted"
                      completed={isAtOrAfter(
                        application.status,
                        "pending_ltc_review",
                      )}
                    />

                    <JourneyItem
                      number="2"
                      title="LTC Admin review"
                      completed={isAtOrAfter(
                        application.status,
                        "pending_local_endorsement",
                      )}
                    />

                    <JourneyItem
                      number="3"
                      title={getLocalLeaderName(localUnitType)}
                      completed={isAtOrAfter(
                        application.status,
                        "pending_final_endorsement",
                      )}
                    />

                    <JourneyItem
                      number="4"
                      title="Final endorsement"
                      completed={isAtOrAfter(
                        application.status,
                        "admission_completed",
                      )}
                    />

                    <JourneyItem
                      number="5"
                      title="Room assigned"
                      completed={
                        roomStatus === "allocated" && Boolean(assignedRoom)
                      }
                    />

                  
                  </div>
                </article>

                <AssignedRoomCard
                  applicationStatus={application.status}
                  roomStatus={roomStatus}
                  assignment={assignedRoom}
                  refreshing={isFetching}
                  onRefresh={refreshRoomAssignment}
                />

            
              </section>
            </>
          )}
        </div>
      </main>
    </CandidateLayout>
  );
}

function SummaryCard({ label, value, description, color }) {
  const colors = {
    blue: "bg-blue-50 text-blue-900",
    amber: "bg-amber-50 text-amber-800",
    emerald: "bg-emerald-50 text-emerald-800",
    purple: "bg-purple-50 text-purple-800",
  };

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>

      <span
        className={`mt-3 inline-flex rounded-lg px-3 py-2 text-sm font-bold ${colors[color]}`}
      >
        {value}
      </span>

      <p className="mt-3 text-xs text-slate-500">{description}</p>
    </article>
  );
}

function ChurchUnitCard({ candidateProfile }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-blue-900">Church Unit</h2>

      <dl className="mt-5 space-y-5">
        <Detail
          label="Stake or District"
          value={candidateProfile?.ecclesiastical_area_name}
        />

        <Detail
          label="Ward or Branch"
          value={candidateProfile?.local_unit_name}
        />

        <Detail
          label="Membership number"
          value={candidateProfile?.membership_record_number}
        />
      </dl>
    </article>
  );
}

function AssignedRoomCard({
  applicationStatus,
  roomStatus,
  assignment,
  refreshing,
  onRefresh,
}) {
  const admittedStatuses = [
    'admission_completed',
    'awaiting_room',
    'room_allocated',
  ];

  if (
    !admittedStatuses.includes(
      applicationStatus
    )
  ) {
    return (
      <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-blue-900">
          Assigned Accommodation
        </h2>

        <p className="mt-4 text-sm leading-6 text-slate-500">
          Accommodation information will
          become available after your
          admission and Church endorsements
          are completed.
        </p>
      </article>
    );
  }

  if (
    roomStatus === 'gender_required'
  ) {
    return (
      <article className="rounded-xl border border-red-200 bg-red-50 p-6">
        <h2 className="text-xl font-bold text-red-900">
          Gender Information Required
        </h2>

        <p className="mt-3 text-sm leading-6 text-red-800">
          Your gender information must be
          completed before the system can
          assign suitable accommodation.
        </p>

        <Link
          to="/candidate/application"
          className="mt-5 inline-flex rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600"
        >
          Review Application
        </Link>
      </article>
    );
  }

  if (
    roomStatus !== 'allocated' ||
    !assignment
  ) {
    return (
      <article className="rounded-xl border border-amber-200 bg-amber-50 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-amber-900">
              Room Assignment Pending
            </h2>

            <p className="mt-3 text-sm leading-6 text-amber-800">
              Your admission is complete.
              Your room will be assigned
              automatically or by an LTC
              Administrator.
            </p>
          </div>

          <span className="shrink-0 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
            Pending
          </span>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          className="mt-5 rounded-lg border border-amber-700 px-4 py-2 text-sm font-semibold text-amber-800 hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {refreshing
            ? 'Checking...'
            : 'Check Room Status'}
        </button>
      </article>
    );
  }

  return (
    <article className="overflow-hidden rounded-xl border border-emerald-200 bg-white shadow-sm">
      <header className="bg-emerald-50 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Assigned Accommodation
            </p>

            <h2 className="mt-2 text-2xl font-bold text-emerald-900">
              {assignment.house_name}
            </h2>

            <p className="mt-1 text-sm text-emerald-800">
              {assignment.hostel_label}
            </p>
          </div>

          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
            Allocated
          </span>
        </div>
      </header>

      <div className="p-6">
        <dl className="grid gap-5 sm:grid-cols-2">
          <Detail
            label="Dormitory"
            value={
              assignment.house_name
            }
          />

          <Detail
            label="Residence"
            value={
              assignment.hostel_label
            }
          />

          <Detail
            label="Room"
            value={
              assignment.room_name
            }
          />

          <Detail
            label="Bed Space"
            value={
              assignment.bed_label
            }
          />

          <Detail
            label="Bed Position"
            value={
              formatBedPosition(
                assignment.bed_position
              )
            }
          />

          <Detail
            label="Assigned On"
            value={
              formatAssignmentDate(
                assignment.assigned_at
              )
            }
          />
        </dl>

        <div className="mt-6 rounded-lg bg-blue-50 p-4">
          <p className="text-sm font-semibold text-blue-900">
            Assignment method
          </p>

          <p className="mt-1 text-sm text-blue-800">
            {assignment.assignment_source ===
            'system'
              ? 'Automatically assigned by the LTC accommodation system.'
              : 'Assigned by an LTC Administrator.'}
          </p>
        </div>

        {assignment.notes && (
          <div className="mt-4 rounded-lg bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-700">
              Accommodation Instructions
            </p>

            <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">
              {assignment.notes}
            </p>
          </div>
        )}

        <p className="mt-5 text-xs leading-5 text-slate-500">
          Contact the LTC Administration
          Office if you have questions about
          this assignment. Candidates cannot
          change room assignments directly.
        </p>
      </div>
    </article>
  );
}


function CorrectionNotice({ latestReview }) {
  return (
    <section className="mt-7 rounded-xl border border-amber-300 bg-amber-50 p-6">
      <h2 className="text-xl font-bold text-amber-900">Correction Required</h2>

      <p className="mt-2 text-amber-800">
        Review the comment, correct your application and resubmit it.
      </p>

      <div className="mt-4 rounded-lg border border-amber-200 bg-white p-4">
        <p className="text-sm font-semibold text-slate-700">Reviewer comment</p>

        <p className="mt-2 whitespace-pre-wrap text-slate-800">
          {latestReview?.comments ||
            "Please review and correct the requested information."}
        </p>
      </div>
    </section>
  );
}

function JourneyItem({ number, title, completed }) {
  return (
    <div className="flex items-center gap-4">
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
          completed
            ? "bg-emerald-100 text-emerald-700"
            : "bg-slate-100 text-slate-500"
        }`}
      >
        {completed ? "✓" : number}
      </span>

      <div className="flex-1">
        <p className="font-semibold text-slate-800">{title}</p>

        <p className="text-xs text-slate-500">
          {completed ? "Completed" : "Pending"}
        </p>
      </div>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </dt>

      <dd className="mt-1 font-medium text-slate-900">
        {value || "Not available"}
      </dd>
    </div>
  );
}

function PageMessage({ message }) {
  return (
    <main className="flex min-h-[70vh] items-center justify-center p-6">
      <p className="text-slate-600">{message}</p>
    </main>
  );
}

function getApplicationButtonLabel(application) {
  if (application.status === "correction_required") {
    return "Correct Application";
  }

  if (application.status === "draft") {
    return application.completion_percentage > 0
      ? "Continue Application"
      : "Start Application";
  }

  return "View Application";
}

function getLtcReviewStatus(status) {
  if (["draft", "pending_ltc_review"].includes(status)) {
    return status === "draft" ? "Not started" : "Pending";
  }

  if (status === "correction_required") {
    return "Action required";
  }

  if (status === "rejected") {
    return "Not approved";
  }

  return "Completed";
}

function getLocalStatus(status) {
  if (["draft", "pending_ltc_review", "correction_required"].includes(status)) {
    return "Not started";
  }

  if (status === "pending_local_endorsement") {
    return "Pending";
  }

  if (status === "rejected") {
    return "Stopped";
  }

  return "Completed";
}

function getFinalStatus(status) {
  if (status === "pending_final_endorsement") {
    return "Pending";
  }

  if (
    ["admission_completed", "awaiting_room", "room_allocated"].includes(status)
  ) {
    return "Completed";
  }

  if (status === "rejected") {
    return "Stopped";
  }

  return "Not started";
}

function getLocalLeaderName(localUnitType) {
  if (localUnitType === "ward") {
    return "Bishop endorsement";
  }

  if (localUnitType === "branch") {
    return "Branch President endorsement";
  }

  return "Local leader endorsement";
}

function getStepMessage(status, localUnitType) {
  const messages = {
    draft: "Complete all seven sections and submit your application.",

    pending_ltc_review: "Your application is waiting for LTC Admin review.",

    correction_required:
      "Make the requested corrections and resubmit your application.",

    pending_final_endorsement:
      "Your application is waiting for final endorsement from your Stake or District President.",

    admission_completed:
      "Your admission and Church endorsements are complete. Room assignment will be processed automatically or by an LTC Admin.",

    awaiting_room:
      "Your admission is complete and your room assignment is being processed.",

    room_allocated: "Your admission and room assignment are complete.",

    rejected: "Your application was not approved.",

    withdrawn: "This application has been withdrawn.",
  };

  if (status === "pending_local_endorsement") {
    return localUnitType === "ward"
      ? "Your application is waiting for your Bishop’s endorsement."
      : "Your application is waiting for your Branch President’s endorsement.";
  }

  return messages[status] || "Your application progress is saved.";
}

function ApplicationStatus({ status, localUnitType }) {
  const localLabel =
    localUnitType === "ward"
      ? "Pending Bishop Endorsement"
      : "Pending Branch President Endorsement";

  const labels = {
    draft: "Draft",
    pending_ltc_review: "Pending LTC Review",
    correction_required: "Correction Required",
    rejected: "Rejected",
    pending_local_endorsement: localLabel,
    pending_final_endorsement: "Pending Final Endorsement",
    admission_completed: "Admission Completed",
    awaiting_room: "Awaiting Room Assignment",
    room_allocated: "Room Assigned",
    withdrawn: "Withdrawn",
  };

  return (
    <span className="inline-flex w-fit rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-800">
      {labels[status] || status}
    </span>
  );
}

function isAtOrAfter(currentStatus, targetStatus) {
  const order = [
    "draft",
    "pending_ltc_review",
    "pending_local_endorsement",
    "pending_final_endorsement",
    "admission_completed",
    "awaiting_room",
    "room_allocated",
  ];

  const currentIndex = order.indexOf(currentStatus);

  const targetIndex = order.indexOf(targetStatus);

  return currentIndex >= targetIndex && currentIndex !== -1;
}

function formatBedPosition(position) {
  if (!position) {
    return 'Not available';
  }

  return position === 'upper'
    ? 'Upper Bunk'
    : 'Lower Bunk';
}

function formatAssignmentDate(value) {
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
    }
  ).format(date);
}
