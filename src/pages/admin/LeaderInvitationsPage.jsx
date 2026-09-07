import { useState } from 'react';

import AdminLayout from '../../layouts/AdminLayout';

import {
  useAreaLeaderInvitations,
} from '../../hooks/useLeaderInvitations';

export default function LeaderInvitationsPage() {
  const {
    data: invitations = [],
    isLoading: invitationsLoading,
    error: invitationsError,
    createInvitation,
    creatingInvitation,
    creationError,
  } = useAreaLeaderInvitations();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    intendedRole: '',
    areaName: '',
  });

  const [message, setMessage] = useState('');
  const [messageType, setMessageType] =
    useState('');

  const [
    generatedLink,
    setGeneratedLink,
  ] = useState('');

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,

      ...(name === 'intendedRole'
        ? {
            areaName: '',
          }
        : {}),
    }));

    setMessage('');
    setMessageType('');
    setGeneratedLink('');
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setMessage('');
    setMessageType('');
    setGeneratedLink('');

    if (
      !formData.fullName.trim() ||
      !formData.email.trim() ||
      !formData.intendedRole ||
      !formData.areaName.trim()
    ) {
      setMessage(
        'Complete all invitation fields.'
      );

      setMessageType('error');
      return;
    }

    try {
      const result =
        await createInvitation({
          fullName: formData.fullName,
          email: formData.email,
          intendedRole:
            formData.intendedRole,
          areaName: formData.areaName,
        });

      const invitationLink =
        `${window.location.origin}/invitation/${result.token}`;

      setGeneratedLink(invitationLink);

      setMessage(
        'Invitation created successfully. Copy the link now.'
      );

      setMessageType('success');

      setFormData({
        fullName: '',
        email: '',
        intendedRole: '',
        areaName: '',
      });
    } catch (error) {
      setMessage(error.message);
      setMessageType('error');
    }
  }

  async function handleCopyLink() {
    if (!generatedLink) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        generatedLink
      );

      setMessage(
        'Invitation link copied successfully.'
      );

      setMessageType('success');
    } catch {
      setMessage(
        'The browser could not copy the link. Select and copy it manually.'
      );

      setMessageType('error');
    }
  }

  const loading = invitationsLoading;

  const pageError =
    invitationsError ||
    creationError;

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
            Invite Area Leader
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Only an LTC Admin can generate an
            invitation for a Stake President or
            District President.
          </p>

          {message && (
            <div
              className={`mt-5 rounded-md border p-4 text-sm ${
                messageType === 'success'
                  ? 'border-green-200 bg-green-50 text-green-800'
                  : 'border-red-200 bg-red-50 text-red-700'
              }`}
            >
              {message}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="mt-6 space-y-5"
          >
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
                <option value="">
                  Select leadership role
                </option>

                <option value="stake_president">
                  Stake President
                </option>

                <option value="district_president">
                  District President
                </option>
              </select>
            </div>

            <div>
              <label
                htmlFor="areaName"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                {getAreaLabel(
                  formData.intendedRole
                )}
              </label>

              <input
                id="areaName"
                name="areaName"
                type="text"
                value={formData.areaName}
                onChange={handleChange}
                disabled={
                  !formData.intendedRole
                }
                required
                placeholder={getAreaPlaceholder(
                  formData.intendedRole
                )}
                className="w-full rounded-md border border-slate-300 px-3 py-3 outline-none disabled:cursor-not-allowed disabled:bg-slate-100 focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
              />

              <p className="mt-2 text-xs leading-5 text-slate-500">
                Type the official Church area name
                carefully. If it does not already
                exist, the system will create it.
              </p>
            </div>

            <button
              type="submit"
              disabled={
                creatingInvitation ||
                !formData.fullName.trim() ||
                !formData.email.trim() ||
                !formData.intendedRole ||
                !formData.areaName.trim()
              }
              className="w-full rounded-md bg-blue-900 px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {creatingInvitation
                ? 'Generating invitation...'
                : 'Generate Invitation Link'}
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
                onFocus={(event) =>
                  event.target.select()
                }
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
                The link expires after seven days.
                It should only be sent to the named
                Stake or District President.
              </p>
            </div>
          )}
        </section>

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-6">
            <h2 className="text-xl font-bold text-blue-900">
              Area Leader Invitations
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Track pending, accepted, expired and
              revoked invitations.
            </p>
          </div>

          {loading && (
            <PageNotice message="Loading invitations..." />
          )}

          {pageError &&
            !creatingInvitation && (
              <PageNotice
                error
                message={pageError.message}
              />
            )}

          {!loading &&
            !pageError &&
            invitations.length === 0 && (
              <PageNotice message="No leader invitations have been generated." />
            )}

          {!loading &&
            !pageError &&
            invitations.length > 0 && (
              <div className="divide-y divide-slate-200">
                {invitations.map(
                  (invitation) => (
                    <InvitationRow
                      key={invitation.id}
                      invitation={invitation}
                    />
                  )
                )}
              </div>
            )}
        </section>
      </div>
    </AdminLayout>
  );
}

function InvitationRow({
  invitation,
}) {
  const status =
    getInvitationStatus(invitation);

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
            {formatValue(
              invitation.intended_role
            )}

            {' — '}

            {invitation
              .ecclesiastical_areas?.name ||
              'Area not available'}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            Created:{' '}
            {formatDateTime(
              invitation.created_at
            )}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Expires:{' '}
            {formatDateTime(
              invitation.expires_at
            )}
          </p>
        </div>

        <InvitationStatus status={status} />
      </div>
    </article>
  );
}

function InvitationStatus({
  status,
}) {
  const colors = {
    pending:
      'bg-amber-100 text-amber-800',

    accepted:
      'bg-green-100 text-green-700',

    expired:
      'bg-slate-200 text-slate-700',

    revoked:
      'bg-red-100 text-red-700',
  };

  return (
    <span
      className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${
        colors[status] ||
        colors.pending
      }`}
    >
      {formatValue(status)}
    </span>
  );
}

function getInvitationStatus(
  invitation
) {
  if (invitation.revoked_at) {
    return 'revoked';
  }

  if (invitation.accepted_at) {
    return 'accepted';
  }

  if (
    new Date(invitation.expires_at) <
    new Date()
  ) {
    return 'expired';
  }

  return 'pending';
}

function getAreaLabel(role) {
  if (role === 'stake_president') {
    return 'Stake name';
  }

  if (role === 'district_president') {
    return 'District name';
  }

  return 'Stake or district name';
}

function getAreaPlaceholder(role) {
  if (role === 'stake_president') {
    return 'Example: Benin City Stake';
  }

  if (role === 'district_president') {
    return 'Example: Benin City District';
  }

  return 'Select the leadership role first';
}

function FormField({
  label,
  name,
  type = 'text',
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

function PageNotice({
  message,
  error = false,
}) {
  return (
    <div
      className={`p-8 text-center ${
        error
          ? 'bg-red-50 text-red-700'
          : 'text-slate-500'
      }`}
    >
      {message}
    </div>
  );
}

function formatValue(value) {
  if (!value) {
    return '';
  }

  return String(value)
    .split('_')
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1)
    )
    .join(' ');
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