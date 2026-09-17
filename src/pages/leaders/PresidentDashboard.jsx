import { Link } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";

import {
  useLeaderAssignment,
  useLocalLeaderInvitations,
} from "../../hooks/useLocalLeaderInvitations";

import LeaderLayout from "../../layouts/LeaderLayout";
import { useFinalEndorsementQueue } from "../../hooks/useFinalEndorsements";

export default function PresidentDashboard() {
  const { profile } = useAuth();

  const {
    data: assignment,
    isLoading: assignmentLoading,
    error: assignmentError,
  } = useLeaderAssignment(profile?.id);

  const {
    data: invitations = [],
    isLoading: invitationsLoading,
    error: invitationsError,
  } = useLocalLeaderInvitations();

  const {
    data: endorsementQueue,
    isLoading: endorsementsLoading,
    error: endorsementsError,
  } = useFinalEndorsementQueue();

  const isLoading =
    assignmentLoading || invitationsLoading || endorsementsLoading;

  const error = assignmentError || invitationsError || endorsementsError;

  if (isLoading) {
    return (
      <LeaderLayout>
        <PageMessage message="Loading leadership dashboard..." />
      </LeaderLayout>
    );
  }

  if (error) {
    return (
      <LeaderLayout>
        <PageMessage error message={error.message} />
      </LeaderLayout>
    );
  }

  if (!assignment) {
    return (
      <LeaderLayout>
        <PageMessage
          error
          message="No active leadership assignment was found for your account."
        />
      </LeaderLayout>
    );
  }

  const leaderRole = assignment.leader_role || profile?.role;

  const assignedArea = assignment.ecclesiastical_areas;

  const pendingInvitations = invitations.filter(
    (invitation) =>
      !invitation.accepted_at &&
      !invitation.revoked_at &&
      (!invitation.expires_at || new Date(invitation.expires_at) > new Date()),
  ).length;

  const acceptedInvitations = invitations.filter((invitation) =>
    Boolean(invitation.accepted_at),
  ).length;

  const expiredInvitations = invitations.filter(
    (invitation) =>
      !invitation.accepted_at &&
      !invitation.revoked_at &&
      invitation.expires_at &&
      new Date(invitation.expires_at) < new Date(),
  ).length;

  const pendingFinalEndorsements =
    endorsementQueue?.total ?? endorsementQueue?.applications?.length ?? 0;

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
                {getDashboardTitle(leaderRole)}
              </h1>

              <p className="mt-2 text-slate-600">
                Welcome, {profile?.full_name || "Church Leader"}
              </p>
            </div>

            <Link
              to="/president/leader-invitations"
              className="w-fit rounded-lg bg-blue-900 px-5 py-3 font-semibold text-white transition hover:bg-blue-800"
            >
              Invite Unit Leader
            </Link>
          </header>

          <section className="mt-8 rounded-xl border border-blue-100 bg-blue-50 p-6">
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-700">
              Assigned Stake or District
            </p>

            <h2 className="mt-2 text-2xl font-bold text-blue-900">
              {assignedArea?.name || "Area not assigned"}
            </h2>

            <p className="mt-2 text-slate-600">
              {formatStatus(assignedArea?.area_type)}
              {assignedArea?.city ? ` • ${assignedArea.city}` : ""}
              {assignedArea?.state ? `, ${assignedArea.state}` : ""}
            </p>
          </section>

          <section className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <DashboardCard
              label="Total Invitations"
              value={invitations.length}
              description="Local leader invitations created"
              colour="blue"
            />

            <DashboardCard
              label="Pending Invitations"
              value={pendingInvitations}
              description="Waiting for registration"
              colour="amber"
            />

            <DashboardCard
              label="Accepted Invitations"
              value={acceptedInvitations}
              description="Registered local leaders"
              colour="green"
            />

            <DashboardCard
              label="Expired Invitations"
              value={expiredInvitations}
              description="Invitations requiring attention"
              colour="red"
            />
          </section>

          <section className="mt-8 grid gap-6 xl:grid-cols-3">
            <article className="rounded-xl border border-slate-200 bg-white shadow-sm xl:col-span-2">
              <div className="flex items-center justify-between border-b border-slate-200 p-6">
                <div>
                  <h2 className="text-xl font-bold text-blue-900">
                    Recent Invitations
                  </h2>

                  <p className="mt-1 text-sm text-slate-600">
                    Leaders invited under your assigned area.
                  </p>
                </div>

                <Link
                  to="/president/leader-invitations"
                  className="text-sm font-semibold text-blue-800 hover:underline"
                >
                  View all
                </Link>
              </div>

              {invitations.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-slate-600">
                    No local leader invitations have been created.
                  </p>

                  <Link
                    to="/president/leader-invitations"
                    className="mt-4 inline-flex rounded-lg bg-blue-900 px-5 py-3 font-semibold text-white"
                  >
                    Create First Invitation
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-slate-200">
                  {invitations.slice(0, 5).map((invitation) => (
                    <InvitationRow
                      key={invitation.id}
                      invitation={invitation}
                    />
                  ))}
                </div>
              )}
            </article>

            <article className="rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 p-6">
                <h2 className="text-xl font-bold text-blue-900">
                  Stake President Endorsements
                </h2>

                <p className="mt-1 text-sm text-slate-600">
                  Candidate applications waiting for your decision.
                </p>
              </div>

              <div className="p-6">
                <div className="rounded-lg bg-slate-50 p-6 text-center">
                  <p className="text-3xl font-bold text-blue-900">
                    {pendingFinalEndorsements}
                  </p>

                  <p className="mt-2 text-sm text-slate-600">
                    Applications awaiting final endorsement
                  </p>
                </div>

                <p className="mt-5 text-sm text-slate-500">
                  Review candidates who have received their Bishop or Branch
                  President endorsement and are awaiting your final decision.
                </p>

                <Link
                  to="/president/endorsements"
                  className="mt-5 flex w-full items-center justify-center rounded-lg bg-blue-900 px-5 py-3 font-semibold text-white transition hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2"
                >
                  View Endorsements
                </Link>
              </div>
            </article>
          </section>
        </div>
      </main>
    </LeaderLayout>
  );
}

function DashboardCard({ label, value, description, colour }) {
  const colours = {
    blue: "bg-blue-50 text-blue-900",
    amber: "bg-amber-50 text-amber-800",
    green: "bg-green-50 text-green-800",
    red: "bg-red-50 text-red-700",
  };

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>

      <p
        className={`mt-3 inline-flex rounded-lg px-3 py-1 text-3xl font-bold ${
          colours[colour]
        }`}
      >
        {value}
      </p>

      <p className="mt-3 text-sm text-slate-600">{description}</p>
    </article>
  );
}

function InvitationRow({ invitation }) {
  const status = getInvitationStatus(invitation);

  return (
    <div className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center">
      <div>
        <p className="font-bold text-slate-900">
          {invitation.invited_full_name}
        </p>

        <p className="mt-1 text-sm text-slate-600">
          {formatStatus(invitation.intended_role)}
          {" — "}
          {invitation.local_units?.name || "Unit not available"}
        </p>

        <p className="mt-1 text-xs text-slate-500">
          {invitation.invited_email}
        </p>
      </div>

      <StatusBadge status={status} />
    </div>
  );
}

function StatusBadge({ status }) {
  const colours = {
    Pending: "bg-amber-100 text-amber-800",
    Accepted: "bg-green-100 text-green-800",
    Expired: "bg-red-100 text-red-700",
    Revoked: "bg-slate-200 text-slate-700",
  };

  return (
    <span
      className={`w-fit rounded-full px-3 py-1 text-sm font-semibold ${
        colours[status] || "bg-slate-100 text-slate-700"
      }`}
    >
      {status}
    </span>
  );
}

function PageMessage({ message, error = false }) {
  return (
    <main className="flex min-h-[70vh] items-center justify-center p-6">
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

function getDashboardTitle(role) {
  if (role === "district_president") {
    return "District President Dashboard";
  }

  if (role === "stake_president") {
    return "Stake President Dashboard";
  }

  return "President Dashboard";
}

function getInvitationStatus(invitation) {
  if (invitation.revoked_at) {
    return "Revoked";
  }

  if (invitation.accepted_at) {
    return "Accepted";
  }

  if (invitation.expires_at && new Date(invitation.expires_at) < new Date()) {
    return "Expired";
  }

  return "Pending";
}

function formatStatus(value) {
  if (!value) {
    return "Not available";
  }

  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
