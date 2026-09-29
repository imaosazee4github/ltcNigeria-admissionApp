import { useEffect, useMemo, useState } from "react";

import LeaderLayout from "../../layouts/LeaderLayout";
import { useAuth } from "../../hooks/useAuth";

import {
  useLeaderAssignment,
  useLocalLeaderInvitations,
} from "../../hooks/useLocalLeaderInvitations";

const initialForm = {
  fullName: "",
  email: "",
  intendedRole: "",
  localUnitId: "",
};

export default function LocalLeaderInvitationsPage() {
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
    createInvitation,
    creatingInvitation,
    creationError,
    invitationResult,
    resetInvitation,
    renewInvitation,
    renewingInvitation,
    revokeInvitation,
    revokingInvitation,
    deleteInvitation,
    deletingInvitation,
    localUnits = [],
    localUnitsLoading,
    localUnitsError,
  } = useLocalLeaderInvitations(assignment?.area_id);

  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState("");
  const [copyMessage, setCopyMessage] = useState("");

  const [openMenuId, setOpenMenuId] = useState(null);

  const [actionDialog, setActionDialog] = useState(null);

  const [actionMessage, setActionMessage] = useState("");

  const [actionMessageType, setActionMessageType] = useState("");

  const [renewedLink, setRenewedLink] = useState("");

  const leaderRole = assignment?.leader_role || profile?.role;

  const assignedArea = assignment?.ecclesiastical_areas;

  const allowedRoles = useMemo(() => {
    if (leaderRole === "stake_president") {
      return [
        {
          value: "bishop",
          label: "Bishop",
        },
        {
          value: "branch_president",
          label: "Branch President",
        },
      ];
    }

    if (leaderRole === "district_president") {
      return [
        {
          value: "branch_president",
          label: "Branch President",
        },
      ];
    }

    return [];
  }, [leaderRole]);

  useEffect(() => {
    if (allowedRoles.length === 1 && !form.intendedRole) {
      setForm((currentForm) => ({
        ...currentForm,
        intendedRole: allowedRoles[0].value,
      }));
    }
  }, [allowedRoles, form.intendedRole]);

  const availableUnits = useMemo(() => {
    const requiredUnitType =
      form.intendedRole === "bishop"
        ? "ward"
        : form.intendedRole === "branch_president"
          ? "branch"
          : "";

    if (!requiredUnitType) return [];

    return localUnits.filter(
      (unit) => unit.unit_type?.toLowerCase() === requiredUnitType,
    );
  }, [localUnits, form.intendedRole]);

  const generatedToken =
    invitationResult?.token ||
    invitationResult?.invitation_token ||
    invitationResult?.invite_token ||
    "";

  const generatedLink =
    invitationResult?.invitation_url ||
    (generatedToken
      ? `${window.location.origin}/invitation/${generatedToken}`
      : "");

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
      ...(name === "intendedRole" ? { localUnitId: "" } : {}),
    }));

    setFormError("");
    setCopyMessage("");

    if (invitationResult) {
      resetInvitation();
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setFormError("");
    setCopyMessage("");

    const fullName = form.fullName.trim();
    const email = form.email.trim();
    const selectedUnit = localUnits.find(
      (unit) => unit.id === form.localUnitId,
    );

    if (!fullName || !email || !form.intendedRole || !form.localUnitId) {
      setFormError("Please complete all invitation fields.");

      return;
    }

    if (!selectedUnit) {
      setFormError("Select a valid Ward or Branch in your assigned area.");
      return;
    }

    if (!allowedRoles.some((role) => role.value === form.intendedRole)) {
      setFormError("You are not permitted to invite this leadership role.");

      return;
    }

    try {
      await createInvitation({
        fullName,
        email,
        intendedRole: form.intendedRole,
        localUnitName: selectedUnit.name,
      });

      setForm(initialForm);
    } catch (error) {
      console.error(error);
    }
  }

  async function handleCopyLink() {
    if (!generatedLink) {
      return;
    }

    try {
      await navigator.clipboard.writeText(generatedLink);

      setCopyMessage("Invitation link copied successfully.");
    } catch {
      setCopyMessage(
        "Unable to copy automatically. Select and copy the link manually.",
      );
    }
  }

  function clearActionFeedback() {
    setActionMessage("");
    setActionMessageType("");
    setRenewedLink("");
  }

  function handleToggleMenu(invitationId) {
    setOpenMenuId((currentId) =>
      currentId === invitationId ? null : invitationId,
    );
  }

  function handleRequestAction(type, invitation) {
    setOpenMenuId(null);
    clearActionFeedback();

    setActionDialog({
      type,
      invitation,
    });
  }

  async function handleRenewInvitation(invitation) {
    setOpenMenuId(null);
    clearActionFeedback();

    try {
      const result = await renewInvitation(invitation.id);

      setRenewedLink(result.invitationUrl);

      setActionMessage(
        "Invitation renewed successfully. Copy and send the new link.",
      );

      setActionMessageType("success");

      setActionDialog({
        type: "renewed",
        invitation,
      });
    } catch (error) {
      setActionMessage(error.message);
      setActionMessageType("error");
    }
  }

  async function handleConfirmAction() {
    if (!actionDialog?.invitation) {
      return;
    }

    const { type, invitation } = actionDialog;

    try {
      if (type === "revoke") {
        await revokeInvitation(invitation.id);

        setActionMessage("Invitation revoked successfully.");
      }

      if (type === "delete") {
        await deleteInvitation(invitation.id);

        setActionMessage("Invitation deleted successfully.");
      }

      setActionMessageType("success");
      setActionDialog(null);
    } catch (error) {
      setActionMessage(error.message);
      setActionMessageType("error");
    }
  }

  async function handleCopyRenewedLink() {
    if (!renewedLink) {
      return;
    }

    try {
      await navigator.clipboard.writeText(renewedLink);

      setActionMessage("Renewed invitation link copied successfully.");

      setActionMessageType("success");
    } catch {
      setActionMessage(
        "Unable to copy automatically. Select and copy the link manually.",
      );

      setActionMessageType("error");
    }
  }

  function handleCloseDialog() {
    if (renewingInvitation || revokingInvitation || deletingInvitation) {
      return;
    }

    setActionDialog(null);
  }

  const actionInProgress =
    renewingInvitation || revokingInvitation || deletingInvitation;

  if (assignmentLoading || invitationsLoading) {
    return <PageMessage message="Loading leader invitations..." />;
  }

  if (assignmentError) {
    return <PageMessage error message={assignmentError.message} />;
  }

  if (!assignment) {
    return (
      <PageMessage
        error
        message="No active leader assignment was found for your account."
      />
    );
  }

  return (
    <LeaderLayout>
      <main className="p-5 md:p-8">
        <div className="mx-auto max-w-6xl">
          <header>
            <p className="text-sm font-semibold uppercase tracking-wider text-amber-600">
              Church Leadership
            </p>

            <h1 className="mt-2 text-3xl font-bold text-blue-900">
              Local Leader Invitations
            </h1>

            <p className="mt-2 text-slate-600">
              Invite authorized leaders serving under your assigned Church area.
            </p>
          </header>

          <section className="mt-8 grid gap-4 sm:grid-cols-2">
            <SummaryCard
              label="Leadership assignment"
              value={formatStatus(leaderRole)}
            />

            <SummaryCard
              label="Assigned area"
              value={assignedArea?.name || "Area not assigned"}
            />
          </section>

          <section className="mt-8 rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-6">
              <h2 className="text-xl font-bold text-blue-900">
                Generate Invitation Link
              </h2>

              <p className="mt-2 text-sm text-slate-600">
                The invited leader must use the generated link to register.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-6">
              {(formError || creationError) && (
                <ErrorMessage message={formError || creationError?.message} />
              )}

              <FormField
                label="Leader full name"
                name="fullName"
                type="text"
                value={form.fullName}
                onChange={handleChange}
                placeholder="Enter the leader’s full name"
              />

              <FormField
                label="Email address"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="leader@example.com"
              />

              <div>
                <label
                  htmlFor="intendedRole"
                  className="block text-sm font-semibold text-slate-700"
                >
                  Leadership role
                </label>

                <select
                  id="intendedRole"
                  name="intendedRole"
                  value={form.intendedRole}
                  onChange={handleChange}
                  required
                  className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Select leadership role</option>

                  {allowedRoles.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="localUnitId"
                  className="block text-sm font-semibold text-slate-700"
                >
                  {form.intendedRole === "branch_president"
                    ? "Branch name"
                    : form.intendedRole === "bishop"
                      ? "Ward name"
                      : "Ward or branch name"}
                </label>

                <select
                  id="localUnitId"
                  name="localUnitId"
                  value={form.localUnitId}
                  onChange={handleChange}
                  required
                  disabled={!form.intendedRole || localUnitsLoading}
                  className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none disabled:cursor-not-allowed disabled:bg-slate-100 focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">
                    {localUnitsLoading
                      ? "Loading units..."
                      : form.intendedRole === "branch_president"
                        ? "Select branch"
                        : form.intendedRole === "bishop"
                          ? "Select ward"
                          : "Select the leadership role first"}
                  </option>

                  {availableUnits.map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      {unit.name}
                    </option>
                  ))}
                </select>

                <p className="mt-2 text-sm text-slate-500">
                  Only units belonging to{" "}
                  {assignedArea?.name || "your assigned area"} are available.
                </p>

                {localUnitsError && (
                  <p className="mt-2 text-sm text-red-700">
                    {localUnitsError.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={
                  creatingInvitation ||
                  allowedRoles.length === 0 ||
                  localUnitsLoading ||
                  !form.localUnitId
                }
                className="w-full rounded-lg bg-blue-900 px-5 py-3 font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-blue-300"
              >
                {creatingInvitation
                  ? "Generating invitation..."
                  : "Generate Invitation Link"}
              </button>
            </form>
          </section>

          {generatedLink && (
            <section className="mt-6 rounded-xl border border-green-200 bg-green-50 p-6">
              <h2 className="font-bold text-green-900">
                Invitation created successfully
              </h2>

              <p className="mt-2 text-sm text-green-800">
                Copy and send this secure link to the invited leader.
              </p>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <input
                  type="text"
                  readOnly
                  value={generatedLink}
                  className="min-w-0 flex-1 rounded-lg border border-green-300 bg-white px-4 py-3 text-sm"
                />

                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="rounded-lg bg-green-700 px-5 py-3 font-semibold text-white"
                >
                  Copy Link
                </button>
              </div>

              {copyMessage && (
                <p className="mt-3 text-sm font-medium text-green-800">
                  {copyMessage}
                </p>
              )}
            </section>
          )}

          <section className="mt-8 rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-6">
              <h2 className="text-xl font-bold text-blue-900">
                Local Leader Invitations
              </h2>

              <p className="mt-2 text-sm text-slate-600">
                Track pending, accepted, expired and revoked invitations.
              </p>
            </div>

                      {actionMessage && (
            <div
              className={`border-b px-6 py-4 text-sm ${
                actionMessageType === 'success'
                  ? 'border-green-200 bg-green-50 text-green-800'
                  : 'border-red-200 bg-red-50 text-red-700'
              }`}
            >
              {actionMessage}
            </div>
          )}

            {invitationsError ? (
              <div className="p-6">
                <ErrorMessage message={invitationsError.message} />
              </div>
            ) : invitations.length === 0 ? (
              <p className="p-8 text-center text-slate-600">
                You have not created any local leader invitations.
              </p>
            ) : (
              <div className="divide-y divide-slate-200">
                {invitations.map((invitation) => (
                  // <InvitationItem key={invitation.id} invitation={invitation} />

                                  <InvitationItem
                  key={invitation.id}
                  invitation={invitation}
                  menuOpen={
                    openMenuId ===
                    invitation.id
                  }
                  actionInProgress={
                    actionInProgress
                  }
                  onToggleMenu={() =>
                    handleToggleMenu(
                      invitation.id
                    )
                  }
                  onRenew={() =>
                    handleRenewInvitation(
                      invitation
                    )
                  }
                  onRevoke={() =>
                    handleRequestAction(
                      'revoke',
                      invitation
                    )
                  }
                  onDelete={() =>
                    handleRequestAction(
                      'delete',
                      invitation
                    )
                  }
                />
                ))}
              </div>
            )}
          </section>
        {/* </div>
      </main>
    </LeaderLayout> */}
          </div>
    </main>

    {actionDialog && (
      <LocalInvitationActionDialog
        actionDialog={actionDialog}
        renewedLink={renewedLink}
        actionInProgress={
          actionInProgress
        }
        onClose={handleCloseDialog}
        onConfirm={
          handleConfirmAction
        }
        onCopyLink={
          handleCopyRenewedLink
        }
      />
    )}
  </LeaderLayout>
  );
}

function LocalInvitationActionDialog({
  actionDialog,
  renewedLink,
  actionInProgress,
  onClose,
  onConfirm,
  onCopyLink,
}) {
  const {
    type,
    invitation,
  } = actionDialog;

  const isRenewed =
    type === 'renewed';

  const isDelete =
    type === 'delete';

  const title = isRenewed
    ? 'Invitation Renewed'
    : isDelete
      ? 'Delete Invitation'
      : 'Revoke Invitation';

  const description = isDelete
    ? `Permanently delete the invitation for ${invitation.invited_full_name}? This action cannot be undone.`
    : `Revoke the invitation for ${invitation.invited_full_name}? The current registration link will stop working immediately.`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="local-invitation-action-title"
        className="w-full max-w-lg rounded-xl border border-slate-200 bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
          <div>
            <h2
              id="local-invitation-action-title"
              className="text-xl font-bold text-blue-900"
            >
              {title}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {invitation.invited_email}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={actionInProgress}
            aria-label="Close dialog"
            className="flex h-9 w-9 items-center justify-center rounded-md text-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50"
          >
            ×
          </button>
        </div>

        <div className="px-6 py-5">
          {isRenewed ? (
            <>
              <p className="text-sm leading-6 text-slate-600">
                A new secure invitation link has
                been created. The previous link no
                longer works.
              </p>

              <label
                htmlFor="renewedLocalInvitationLink"
                className="mt-5 block text-sm font-semibold text-slate-700"
              >
                New invitation link
              </label>

              <textarea
                id="renewedLocalInvitationLink"
                value={renewedLink}
                readOnly
                rows={4}
                onFocus={(event) =>
                  event.target.select()
                }
                className="mt-2 w-full resize-none rounded-md border border-green-300 bg-green-50 p-3 text-sm text-slate-700"
              />

              <p className="mt-3 text-xs leading-5 text-slate-500">
                This link expires after seven days
                and should only be sent to the
                named Bishop or Branch President.
              </p>
            </>
          ) : (
            <p className="text-sm leading-6 text-slate-600">
              {description}
            </p>
          )}
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 px-6 py-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={actionInProgress}
            className="rounded-md border border-slate-300 px-4 py-2.5 font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isRenewed
              ? 'Close'
              : 'Cancel'}
          </button>

          {isRenewed ? (
            <button
              type="button"
              onClick={onCopyLink}
              className="rounded-md bg-green-700 px-4 py-2.5 font-semibold text-white hover:bg-green-800"
            >
              Copy New Link
            </button>
          ) : (
            <button
              type="button"
              onClick={onConfirm}
              disabled={actionInProgress}
              className={`rounded-md px-4 py-2.5 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 ${
                isDelete
                  ? 'bg-red-700 hover:bg-red-800'
                  : 'bg-amber-600 hover:bg-amber-700'
              }`}
            >
              {actionInProgress
                ? 'Processing...'
                : isDelete
                  ? 'Delete Invitation'
                  : 'Revoke Invitation'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function FormField({ label, name, type, value, onChange, placeholder }) {
  return (
    <div>
      <label
        htmlFor={name}
        className="block text-sm font-semibold text-slate-700"
      >
        {label}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required
        className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
      />
    </div>
  );
}

function SummaryCard({ label, value }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>

      <p className="mt-2 text-xl font-bold text-blue-900">{value}</p>
    </article>
  );
}

// function InvitationItem({ invitation }) {
function InvitationItem({
  invitation,
  menuOpen,
  actionInProgress,
  onToggleMenu,
  onRenew,
  onRevoke,
  onDelete,
}) {
  const status = getInvitationStatus(invitation);

    const canManage =
    status !== 'Accepted';

  const canRevoke =
    status === 'Pending';

  const renewLabel =
    status === 'Pending'
      ? 'Resend Invitation'
      : 'Renew Invitation';

  const localUnit = invitation.local_units;

  return (
    <article className="flex flex-col justify-between gap-4 p-6 sm:flex-row sm:items-start">
      <div>
        <h3 className="font-bold text-slate-900">
          {invitation.invited_full_name}
        </h3>

        <p className="mt-1 text-slate-600">{invitation.invited_email}</p>

        <p className="mt-3 text-sm text-slate-700">
          {formatStatus(invitation.intended_role)}
          {" — "}
          {localUnit?.name || "Unit not available"}
        </p>

        <p className="mt-2 text-xs text-slate-500">
          Created: {formatDate(invitation.created_at)}
        </p>

        <p className="mt-1 text-xs text-slate-500">
          Expires: {formatDate(invitation.expires_at)}
        </p>
      </div>

      {/* <StatusBadge status={status} /> */}
            <div className="relative flex items-center gap-3">
        <StatusBadge status={status} />

        {canManage && (
          <button
            type="button"
            onClick={onToggleMenu}
            disabled={actionInProgress}
            aria-label={`Manage invitation for ${invitation.invited_full_name}`}
            aria-expanded={menuOpen}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 bg-white text-xl font-bold leading-none text-slate-600 transition hover:border-blue-400 hover:bg-blue-50 hover:text-blue-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            ⋮
          </button>
        )}

        {canManage && menuOpen && (
          <div
            role="menu"
            className="absolute right-0 top-11 z-20 w-52 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
          >
            <button
              type="button"
              role="menuitem"
              onClick={onRenew}
              disabled={actionInProgress}
              className="block w-full px-4 py-3 text-left text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {renewLabel}
            </button>

            {canRevoke && (
              <button
                type="button"
                role="menuitem"
                onClick={onRevoke}
                disabled={actionInProgress}
                className="block w-full px-4 py-3 text-left text-sm font-medium text-amber-700 hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Revoke Invitation
              </button>
            )}

            <div className="my-1 border-t border-slate-200" />

            <button
              type="button"
              role="menuitem"
              onClick={onDelete}
              disabled={actionInProgress}
              className="block w-full px-4 py-3 text-left text-sm font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Delete Invitation
            </button>
          </div>
        )}
      </div>
    </article>
  );
}

function StatusBadge({ status }) {
  const styles = {
    Pending: "bg-amber-100 text-amber-800",
    Accepted: "bg-green-100 text-green-800",
    Expired: "bg-red-100 text-red-700",
    Revoked: "bg-slate-200 text-slate-700",
  };

  return (
    <span
      className={`w-fit rounded-full px-3 py-1 text-sm font-semibold ${
        styles[status] || "bg-slate-100 text-slate-700"
      }`}
    >
      {status}
    </span>
  );
}

function ErrorMessage({ message }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
      {message}
    </div>
  );
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

function formatDate(value) {
  if (!value) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
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
