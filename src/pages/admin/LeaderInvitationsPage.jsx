import { useMemo, useState } from "react";

import AdminLayout from "../../layouts/AdminLayout";

import { useAreaLeaderInvitations } from "../../hooks/useLeaderInvitations";

export default function LeaderInvitationsPage() {
  const {
    data: invitations = [],
    isLoading: invitationsLoading,
    error: invitationsError,
    createInvitation,
    creatingInvitation,
    creationError,
    renewInvitation,
    renewingInvitation,
    revokeInvitation,
    revokingInvitation,
    deleteInvitation,
    deletingInvitation,
    areas = [],
    areasLoading,
    areasError,
  } = useAreaLeaderInvitations();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    intendedRole: "",
    stateName: "",
    areaId: "",
  });

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const [generatedLink, setGeneratedLink] = useState("");

  const [openMenuId, setOpenMenuId] = useState(null);

  const [actionDialog, setActionDialog] = useState(null);

  const [actionMessage, setActionMessage] = useState("");

  const [actionMessageType, setActionMessageType] = useState("");

  const [renewedLink, setRenewedLink] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,

      ...(name === "intendedRole"
        ? {
            stateName: "",
            areaId: "",
          }
        : {}),

      ...(name === "stateName"
        ? {
            areaId: "",
          }
        : {}),
    }));

    setMessage("");
    setMessageType("");
    setGeneratedLink("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setMessage("");
    setMessageType("");
    setGeneratedLink("");

    if (
      !formData.fullName.trim() ||
      !formData.email.trim() ||
      !formData.intendedRole ||
      !formData.stateName ||
      !formData.areaId
    ) {
      setMessage("Complete all invitation fields.");

      setMessageType("error");
      return;
    }

    try {
      const selectedArea = areas.find((area) => area.id === formData.areaId);

      if (!selectedArea) {
        throw new Error("Select a valid Stake or District.");
      }

      const result = await createInvitation({
        fullName: formData.fullName,
        email: formData.email,
        intendedRole: formData.intendedRole,
        areaName: selectedArea.name,
      });

      const invitationLink = `${window.location.origin}/invitation/${result.token}`;

      setGeneratedLink(invitationLink);

      setMessage("Invitation created successfully. Copy the link now.");

      setMessageType("success");

      setFormData({
        fullName: "",
        email: "",
        intendedRole: "",
        stateName: "",
        areaId: "",
      });
    } catch (error) {
      setMessage(error.message);
      setMessageType("error");
    }
  }

  async function handleCopyLink() {
    if (!generatedLink) {
      return;
    }

    try {
      await navigator.clipboard.writeText(generatedLink);

      setMessage("Invitation link copied successfully.");

      setMessageType("success");
    } catch {
      setMessage(
        "The browser could not copy the link. Select and copy it manually.",
      );

      setMessageType("error");
    }
  }

  const loading = invitationsLoading;

  const actionInProgress =
    renewingInvitation || revokingInvitation || deletingInvitation;

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
        "The browser could not copy the link. Select and copy it manually.",
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

  const pageError = invitationsError || creationError || areasError;

  const selectedAreaType =
    formData.intendedRole === "stake_president"
      ? "stake"
      : formData.intendedRole === "district_president"
        ? "district"
        : "";

  const availableAreas = useMemo(
    () =>
      areas.filter(
        (area) =>
          area.area_type?.toLowerCase() === selectedAreaType &&
          area.state === formData.stateName,
      ),
    [areas, selectedAreaType, formData.stateName],
  );

  const availableStates = useMemo(
    () =>
      [
        ...new Set(
          areas
            .filter(
              (area) => area.area_type?.toLowerCase() === selectedAreaType,
            )
            .map((area) => area.state)
            .filter(Boolean),
        ),
      ].sort((a, b) => a.localeCompare(b)),
    [areas, selectedAreaType],
  );

  return (
    <AdminLayout
      title="Leader Invitations"
      description="Invite Stake and District Presidents to register for the LTC Admission application."
    >
      <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
        <section className="h-fit rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
            New invitation
          </p>

          <h2 className="mt-2 text-2xl font-bold text-blue-900">
            Invite Stake President or District President
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Only an LTC Admin can generate an invitation for a Stake President
            or District President.
          </p>

          {message && (
            <div
              className={`mt-5 rounded-md border p-4 text-sm ${
                messageType === "success"
                  ? "border-green-200 bg-green-50 text-green-800"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <FormField
              label="Leader full name"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Enter full name"
            />

            <FormField
              label="Email address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="leader@example.com"
            />

            <div>
              <label
                htmlFor="intendedRole"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Leadership role
              </label>

              <select
                id="intendedRole"
                name="intendedRole"
                value={formData.intendedRole}
                onChange={handleChange}
                required
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-3 outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">Select leadership role</option>

                <option value="stake_president">Stake President</option>

                <option value="district_president">District President</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="stateName"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                State or FCT
              </label>

              <select
                id="stateName"
                name="stateName"
                value={formData.stateName}
                onChange={handleChange}
                disabled={!formData.intendedRole || areasLoading}
                required
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-3 outline-none disabled:cursor-not-allowed disabled:bg-slate-100 focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">
                  {areasLoading ? "Loading states..." : "Select State or FCT"}
                </option>

                {availableStates.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="areaId"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                {getAreaLabel(formData.intendedRole)}
              </label>

              <select
                id="areaId"
                name="areaId"
                value={formData.areaId}
                onChange={handleChange}
                disabled={!formData.stateName || areasLoading}
                required
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-3 outline-none disabled:cursor-not-allowed disabled:bg-slate-100 focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">
                  {getAreaPlaceholder(formData.intendedRole)}
                </option>

                {availableAreas.map((area) => (
                  <option key={area.id} value={area.id}>
                    {area.name}
                  </option>
                ))}
              </select>

              <p className="mt-2 text-xs leading-5 text-slate-500">
                Select an existing active Church area from the database.
              </p>
            </div>

            <button
              type="submit"
              disabled={
                creatingInvitation ||
                !formData.fullName.trim() ||
                !formData.email.trim() ||
                !formData.intendedRole ||
                !formData.stateName ||
                !formData.areaId ||
                areasLoading
              }
              className="w-full rounded-md bg-blue-900 px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {creatingInvitation
                ? "Generating invitation..."
                : "Generate Invitation Link"}
            </button>
          </form>

          {generatedLink && (
            <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4">
              <label
                htmlFor="generatedLink"
                className="block text-sm font-semibold text-green-900"
              >
                Secure invitation link
              </label>

              <textarea
                id="generatedLink"
                value={generatedLink}
                readOnly
                rows={4}
                onFocus={(event) => event.target.select()}
                className="mt-2 w-full resize-none rounded-md border border-green-300 bg-white p-3 text-sm text-slate-700"
              />

              <button
                type="button"
                onClick={handleCopyLink}
                className="mt-3 w-full rounded-md bg-green-700 px-4 py-3 font-semibold text-white hover:bg-green-800"
              >
                Copy Invitation Link
              </button>

              <p className="mt-3 text-xs leading-5 text-green-800">
                The link expires after seven days. It should only be sent to the
                named Stake or District President.
              </p>
            </div>
          )}
        </section>

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-6">
            <h2 className="text-xl font-bold text-blue-900">
              Stake President or District President Invitations
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Track pending, accepted, expired and revoked invitations.
            </p>
          </div>
          {actionMessage && (
            <div
              className={`border-b px-6 py-4 text-sm ${
                actionMessageType === "success"
                  ? "border-green-200 bg-green-50 text-green-800"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {actionMessage}
            </div>
          )}

          {loading && <PageNotice message="Loading invitations..." />}

          {pageError && !creatingInvitation && (
            <PageNotice error message={pageError.message} />
          )}

          {!loading && !pageError && invitations.length === 0 && (
            <PageNotice message="No leader invitations have been generated." />
          )}

          {!loading && !pageError && invitations.length > 0 && (
            <div className="divide-y divide-slate-200">
              {invitations.map((invitation) => (
                // <InvitationRow key={invitation.id} invitation={invitation} />
                <InvitationRow
                  key={invitation.id}
                  invitation={invitation}
                  menuOpen={openMenuId === invitation.id}
                  actionInProgress={actionInProgress}
                  onToggleMenu={() => handleToggleMenu(invitation.id)}
                  onRenew={() => handleRenewInvitation(invitation)}
                  onRevoke={() => handleRequestAction("revoke", invitation)}
                  onDelete={() => handleRequestAction("delete", invitation)}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {actionDialog && (
        <InvitationActionDialog
          actionDialog={actionDialog}
          renewedLink={renewedLink}
          actionInProgress={actionInProgress}
          onClose={handleCloseDialog}
          onConfirm={handleConfirmAction}
          onCopyLink={handleCopyRenewedLink}
        />
      )}
    </AdminLayout>
  );
}

function InvitationActionDialog({
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
        aria-labelledby="invitation-action-title"
        className="w-full max-w-lg rounded-xl border border-slate-200 bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
          <div>
            <h2
              id="invitation-action-title"
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
                htmlFor="renewedInvitationLink"
                className="mt-5 block text-sm font-semibold text-slate-700"
              >
                New invitation link
              </label>

              <textarea
                id="renewedInvitationLink"
                value={renewedLink}
                readOnly
                rows={4}
                onFocus={(event) =>
                  event.target.select()
                }
                className="mt-2 w-full resize-none rounded-md border border-green-300 bg-green-50 p-3 text-sm text-slate-700"
              />

              <p className="mt-3 text-xs leading-5 text-slate-500">
                This new link expires after seven
                days and should only be sent to the
                named leader.
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
            {isRenewed ? 'Close' : 'Cancel'}
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
function InvitationRow({
  invitation,
  menuOpen,
  actionInProgress,
  onToggleMenu,
  onRenew,
  onRevoke,
  onDelete,
}) {
  const status = getInvitationStatus(invitation);

  const canManage = status !== "accepted";

  const canRevoke = status === "pending";

  const renewLabel =
    status === "pending" ? "Resend Invitation" : "Renew Invitation";

  return (
    <article className="p-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <h3 className="font-bold text-slate-900">
            {invitation.invited_full_name}
          </h3>

          <p className="mt-1 text-sm text-slate-600">
            {invitation.invited_email}
          </p>

          <p className="mt-3 text-sm text-slate-700">
            {formatValue(invitation.intended_role)}

            {" — "}

            {invitation.ecclesiastical_areas?.name || "Area not available"}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            Created: {formatDateTime(invitation.created_at)}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Expires: {formatDateTime(invitation.expires_at)}
          </p>
        </div>

        {/* <InvitationStatus status={status} /> */}
        <div className="relative flex items-center gap-3">
          <InvitationStatus status={status} />

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
      </div>
    </article>
  );
}

function InvitationStatus({ status }) {
  const colors = {
    pending: "bg-amber-100 text-amber-800",

    accepted: "bg-green-100 text-green-700",

    expired: "bg-slate-200 text-slate-700",

    revoked: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${
        colors[status] || colors.pending
      }`}
    >
      {formatValue(status)}
    </span>
  );
}

function getInvitationStatus(invitation) {
  if (invitation.revoked_at) {
    return "revoked";
  }

  if (invitation.accepted_at) {
    return "accepted";
  }

  if (new Date(invitation.expires_at) < new Date()) {
    return "expired";
  }

  return "pending";
}

function getAreaLabel(role) {
  if (role === "stake_president") {
    return "Stake name";
  }

  if (role === "district_president") {
    return "District name";
  }

  return "Stake or district name";
}

function getAreaPlaceholder(role) {
  if (role === "stake_president") {
    return "Example: Benin City Stake";
  }

  if (role === "district_president") {
    return "Example: Benin City District";
  }

  return "Select the leadership role first";
}

function FormField({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-semibold text-slate-700"
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
        className="w-full rounded-md border border-slate-300 px-3 py-3 outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
      />
    </div>
  );
}

function PageNotice({ message, error = false }) {
  return (
    <div
      className={`p-8 text-center ${
        error ? "bg-red-50 text-red-700" : "text-slate-500"
      }`}
    >
      {message}
    </div>
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

function formatDateTime(value) {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
