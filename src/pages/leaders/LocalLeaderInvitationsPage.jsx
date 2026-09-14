import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import LeaderLayout from '../../layouts/LeaderLayout';
import { useAuth } from '../../hooks/useAuth';

import {
  useLeaderAssignment,
  useLocalLeaderInvitations,
} from '../../hooks/useLocalLeaderInvitations';

const initialForm = {
  fullName: '',
  email: '',
  intendedRole: '',
  localUnitId: '',
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
    localUnits = [],
    localUnitsLoading,
    localUnitsError,
  } = useLocalLeaderInvitations(
    assignment?.area_id
  );

  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState('');
  const [copyMessage, setCopyMessage] = useState('');

  const leaderRole =
    assignment?.leader_role || profile?.role;

  const assignedArea =
    assignment?.ecclesiastical_areas;

  const allowedRoles = useMemo(() => {
    if (leaderRole === 'stake_president') {
      return [
        {
          value: 'bishop',
          label: 'Bishop',
        },
        {
          value: 'branch_president',
          label: 'Branch President',
        },
      ];
    }

    if (leaderRole === 'district_president') {
      return [
        {
          value: 'branch_president',
          label: 'Branch President',
        },
      ];
    }

    return [];
  }, [leaderRole]);

  useEffect(() => {
    if (
      allowedRoles.length === 1 &&
      !form.intendedRole
    ) {
      setForm((currentForm) => ({
        ...currentForm,
        intendedRole: allowedRoles[0].value,
      }));
    }
  }, [allowedRoles, form.intendedRole]);

  const availableUnits = useMemo(() => {
    const requiredUnitType =
      form.intendedRole === 'bishop'
        ? 'ward'
        : form.intendedRole === 'branch_president'
          ? 'branch'
          : '';

    if (!requiredUnitType) return [];

    return localUnits.filter(
      (unit) =>
        unit.unit_type?.toLowerCase() === requiredUnitType
    );
  }, [localUnits, form.intendedRole]);

  const generatedToken =
    invitationResult?.token ||
    invitationResult?.invitation_token ||
    invitationResult?.invite_token ||
    '';

  const generatedLink =
    invitationResult?.invitation_url ||
    (generatedToken
      ? `${window.location.origin}/invitation/${generatedToken}`
      : '');

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
      ...(name === 'intendedRole'
        ? { localUnitId: '' }
        : {}),
    }));

    setFormError('');
    setCopyMessage('');

    if (invitationResult) {
      resetInvitation();
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setFormError('');
    setCopyMessage('');

    const fullName = form.fullName.trim();
    const email = form.email.trim();
    const selectedUnit = localUnits.find(
      (unit) => unit.id === form.localUnitId
    );

    if (
      !fullName ||
      !email ||
      !form.intendedRole ||
      !form.localUnitId
    ) {
      setFormError(
        'Please complete all invitation fields.'
      );

      return;
    }

    if (!selectedUnit) {
      setFormError(
        'Select a valid Ward or Branch in your assigned area.'
      );
      return;
    }

    if (
      !allowedRoles.some(
        (role) =>
          role.value === form.intendedRole
      )
    ) {
      setFormError(
        'You are not permitted to invite this leadership role.'
      );

      return;
    }

    try {
      await createInvitation({
        fullName,
        email,
        intendedRole:
          form.intendedRole,
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
      await navigator.clipboard.writeText(
        generatedLink
      );

      setCopyMessage(
        'Invitation link copied successfully.'
      );
    } catch {
      setCopyMessage(
        'Unable to copy automatically. Select and copy the link manually.'
      );
    }
  }

  if (
    assignmentLoading ||
    invitationsLoading
  ) {
    return (
      <PageMessage message="Loading leader invitations..." />
    );
  }

  if (assignmentError) {
    return (
      <PageMessage
        error
        message={assignmentError.message}
      />
    );
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
            Invite authorized leaders serving
            under your assigned Church area.
          </p>
        </header>

        <section className="mt-8 grid gap-4 sm:grid-cols-2">
          <SummaryCard
            label="Leadership assignment"
            value={formatStatus(leaderRole)}
          />

          <SummaryCard
            label="Assigned area"
            value={
              assignedArea?.name ||
              'Area not assigned'
            }
          />
        </section>

        <section className="mt-8 rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-6">
            <h2 className="text-xl font-bold text-blue-900">
              Generate Invitation Link
            </h2>

            <p className="mt-2 text-sm text-slate-600">
              The invited leader must use the
              generated link to register.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-5 p-6"
          >
            {(formError || creationError) && (
              <ErrorMessage
                message={
                  formError ||
                  creationError?.message
                }
              />
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
                <option value="">
                  Select leadership role
                </option>

                {allowedRoles.map((role) => (
                  <option
                    key={role.value}
                    value={role.value}
                  >
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
                {form.intendedRole ===
                'branch_president'
                  ? 'Branch name'
                  : form.intendedRole ===
                      'bishop'
                    ? 'Ward name'
                    : 'Ward or branch name'}
              </label>

              <select
                id="localUnitId"
                name="localUnitId"
                value={form.localUnitId}
                onChange={handleChange}
                required
                disabled={
                  !form.intendedRole ||
                  localUnitsLoading
                }
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none disabled:cursor-not-allowed disabled:bg-slate-100 focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">
                  {localUnitsLoading
                    ? 'Loading units...'
                    : form.intendedRole === 'branch_president'
                      ? 'Select branch'
                      : form.intendedRole === 'bishop'
                        ? 'Select ward'
                        : 'Select the leadership role first'}
                </option>

                {availableUnits.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.name}
                  </option>
                ))}
              </select>

              <p className="mt-2 text-sm text-slate-500">
                Only units belonging to{' '}
                {assignedArea?.name ||
                  'your assigned area'} are available.
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
                ? 'Generating invitation...'
                : 'Generate Invitation Link'}
            </button>
          </form>
        </section>

        {generatedLink && (
          <section className="mt-6 rounded-xl border border-green-200 bg-green-50 p-6">
            <h2 className="font-bold text-green-900">
              Invitation created successfully
            </h2>

            <p className="mt-2 text-sm text-green-800">
              Copy and send this secure link to
              the invited leader.
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
              Track pending, accepted, expired
              and revoked invitations.
            </p>
          </div>

          {invitationsError ? (
            <div className="p-6">
              <ErrorMessage
                message={invitationsError.message}
              />
            </div>
          ) : invitations.length === 0 ? (
            <p className="p-8 text-center text-slate-600">
              You have not created any local
              leader invitations.
            </p>
          ) : (
            <div className="divide-y divide-slate-200">
              {invitations.map((invitation) => (
                <InvitationItem
                  key={invitation.id}
                  invitation={invitation}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  </LeaderLayout>
);
  
}

function FormField({
  label,
  name,
  type,
  value,
  onChange,
  placeholder,
}) {
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
      <p className="text-sm text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-xl font-bold text-blue-900">
        {value}
      </p>
    </article>
  );
}

function InvitationItem({ invitation }) {
  const status = getInvitationStatus(invitation);

  const localUnit =
    invitation.local_units;

  return (
    <article className="flex flex-col justify-between gap-4 p-6 sm:flex-row sm:items-start">
      <div>
        <h3 className="font-bold text-slate-900">
          {invitation.invited_full_name}
        </h3>

        <p className="mt-1 text-slate-600">
          {invitation.invited_email}
        </p>

        <p className="mt-3 text-sm text-slate-700">
          {formatStatus(
            invitation.intended_role
          )}
          {' — '}
          {localUnit?.name ||
            'Unit not available'}
        </p>

        <p className="mt-2 text-xs text-slate-500">
          Created:{' '}
          {formatDate(invitation.created_at)}
        </p>

        <p className="mt-1 text-xs text-slate-500">
          Expires:{' '}
          {formatDate(invitation.expires_at)}
        </p>
      </div>

      <StatusBadge status={status} />
    </article>
  );
}

function StatusBadge({ status }) {
  const styles = {
    Pending:
      'bg-amber-100 text-amber-800',
    Accepted:
      'bg-green-100 text-green-800',
    Expired:
      'bg-red-100 text-red-700',
    Revoked:
      'bg-slate-200 text-slate-700',
  };

  return (
    <span
      className={`w-fit rounded-full px-3 py-1 text-sm font-semibold ${
        styles[status] ||
        'bg-slate-100 text-slate-700'
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

function getInvitationStatus(invitation) {
  if (invitation.revoked_at) {
    return 'Revoked';
  }

  if (invitation.accepted_at) {
    return 'Accepted';
  }

  if (
    invitation.expires_at &&
    new Date(invitation.expires_at) <
      new Date()
  ) {
    return 'Expired';
  }

  return 'Pending';
}

function formatDate(value) {
  if (!value) {
    return 'Not available';
  }

  return new Intl.DateTimeFormat('en-NG', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function formatStatus(value) {
  if (!value) {
    return 'Not available';
  }

  return value
    .split('_')
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1)
    )
    .join(' ');
}



// import {
//   useEffect,
//   useMemo,
//   useState,
// } from 'react';

// import LeaderLayout from '../../layouts/LeaderLayout';
// import { useAuth } from '../../hooks/useAuth';

// import {
//   useLeaderAssignment,
//   useLocalLeaderInvitations,
// } from '../../hooks/useLocalLeaderInvitations';

// const initialForm = {
//   fullName: '',
//   email: '',
//   intendedRole: '',
//   localUnitName: '',
// };

// export default function LocalLeaderInvitationsPage() {
//   const { profile } = useAuth();

//   const {
//     data: assignment,
//     isLoading: assignmentLoading,
//     error: assignmentError,
//   } = useLeaderAssignment(profile?.id);

//   const {
//     data: invitations = [],
//     isLoading: invitationsLoading,
//     error: invitationsError,
//     createInvitation,
//     creatingInvitation,
//     creationError,
//     invitationResult,
//     resetInvitation,
//   } = useLocalLeaderInvitations();

//   const [form, setForm] = useState(initialForm);
//   const [formError, setFormError] = useState('');
//   const [copyMessage, setCopyMessage] = useState('');

//   const leaderRole =
//     assignment?.leader_role || profile?.role;

//   const assignedArea =
//     assignment?.ecclesiastical_areas;

//   const allowedRoles = useMemo(() => {
//     if (leaderRole === 'stake_president') {
//       return [
//         {
//           value: 'bishop',
//           label: 'Bishop',
//         },
//         {
//           value: 'branch_president',
//           label: 'Branch President',
//         },
//       ];
//     }

//     if (leaderRole === 'district_president') {
//       return [
//         {
//           value: 'branch_president',
//           label: 'Branch President',
//         },
//       ];
//     }

//     return [];
//   }, [leaderRole]);

//   useEffect(() => {
//     if (
//       allowedRoles.length === 1 &&
//       !form.intendedRole
//     ) {
//       setForm((currentForm) => ({
//         ...currentForm,
//         intendedRole: allowedRoles[0].value,
//       }));
//     }
//   }, [allowedRoles, form.intendedRole]);

//   const generatedToken =
//     invitationResult?.token ||
//     invitationResult?.invitation_token ||
//     invitationResult?.invite_token ||
//     '';

//   const generatedLink =
//     invitationResult?.invitation_url ||
//     (generatedToken
//       ? `${window.location.origin}/invitation/${generatedToken}`
//       : '');

//   function handleChange(event) {
//     const { name, value } = event.target;

//     setForm((currentForm) => ({
//       ...currentForm,
//       [name]: value,
//     }));

//     setFormError('');
//     setCopyMessage('');

//     if (invitationResult) {
//       resetInvitation();
//     }
//   }

//   async function handleSubmit(event) {
//     event.preventDefault();

//     setFormError('');
//     setCopyMessage('');

//     const fullName = form.fullName.trim();
//     const email = form.email.trim();
//     const localUnitName =
//       form.localUnitName.trim();

//     if (
//       !fullName ||
//       !email ||
//       !form.intendedRole ||
//       !localUnitName
//     ) {
//       setFormError(
//         'Please complete all invitation fields.'
//       );

//       return;
//     }

//     if (
//       !allowedRoles.some(
//         (role) =>
//           role.value === form.intendedRole
//       )
//     ) {
//       setFormError(
//         'You are not permitted to invite this leadership role.'
//       );

//       return;
//     }

//     try {
//       await createInvitation({
//         fullName,
//         email,
//         intendedRole:
//           form.intendedRole,
//         localUnitName,
//       });

//       setForm(initialForm);
//     } catch (error) {
//       console.error(error);
//     }
//   }

//   async function handleCopyLink() {
//     if (!generatedLink) {
//       return;
//     }

//     try {
//       await navigator.clipboard.writeText(
//         generatedLink
//       );

//       setCopyMessage(
//         'Invitation link copied successfully.'
//       );
//     } catch {
//       setCopyMessage(
//         'Unable to copy automatically. Select and copy the link manually.'
//       );
//     }
//   }

//   if (
//     assignmentLoading ||
//     invitationsLoading
//   ) {
//     return (
//       <PageMessage message="Loading leader invitations..." />
//     );
//   }

//   if (assignmentError) {
//     return (
//       <PageMessage
//         error
//         message={assignmentError.message}
//       />
//     );
//   }

//   if (!assignment) {
//     return (
//       <PageMessage
//         error
//         message="No active leader assignment was found for your account."
//       />
//     );
//   }

//   return (
//     <LeaderLayout>
//      <main className="p-5 md:p-8">
//       <div className="mx-auto max-w-6xl">
//         <header>
//           <p className="text-sm font-semibold uppercase tracking-wider text-amber-600">
//             Church Leadership
//           </p>

//           <h1 className="mt-2 text-3xl font-bold text-blue-900">
//             Local Leader Invitations
//           </h1>

//           <p className="mt-2 text-slate-600">
//             Invite authorized leaders serving
//             under your assigned Church area.
//           </p>
//         </header>

//         <section className="mt-8 grid gap-4 sm:grid-cols-2">
//           <SummaryCard
//             label="Leadership assignment"
//             value={formatStatus(leaderRole)}
//           />

//           <SummaryCard
//             label="Assigned area"
//             value={
//               assignedArea?.name ||
//               'Area not assigned'
//             }
//           />
//         </section>

//         <section className="mt-8 rounded-xl border border-slate-200 bg-white shadow-sm">
//           <div className="border-b border-slate-200 p-6">
//             <h2 className="text-xl font-bold text-blue-900">
//               Generate Invitation Link
//             </h2>

//             <p className="mt-2 text-sm text-slate-600">
//               The invited leader must use the
//               generated link to register.
//             </p>
//           </div>

//           <form
//             onSubmit={handleSubmit}
//             className="space-y-5 p-6"
//           >
//             {(formError || creationError) && (
//               <ErrorMessage
//                 message={
//                   formError ||
//                   creationError?.message
//                 }
//               />
//             )}

//             <FormField
//               label="Leader full name"
//               name="fullName"
//               type="text"
//               value={form.fullName}
//               onChange={handleChange}
//               placeholder="Enter the leader’s full name"
//             />

//             <FormField
//               label="Email address"
//               name="email"
//               type="email"
//               value={form.email}
//               onChange={handleChange}
//               placeholder="leader@example.com"
//             />

//             <div>
//               <label
//                 htmlFor="intendedRole"
//                 className="block text-sm font-semibold text-slate-700"
//               >
//                 Leadership role
//               </label>

//               <select
//                 id="intendedRole"
//                 name="intendedRole"
//                 value={form.intendedRole}
//                 onChange={handleChange}
//                 required
//                 className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
//               >
//                 <option value="">
//                   Select leadership role
//                 </option>

//                 {allowedRoles.map((role) => (
//                   <option
//                     key={role.value}
//                     value={role.value}
//                   >
//                     {role.label}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div>
//               <label
//                 htmlFor="localUnitName"
//                 className="block text-sm font-semibold text-slate-700"
//               >
//                 {form.intendedRole ===
//                 'branch_president'
//                   ? 'Branch name'
//                   : form.intendedRole ===
//                       'bishop'
//                     ? 'Ward name'
//                     : 'Ward or branch name'}
//               </label>

//               <input
//                 id="localUnitName"
//                 name="localUnitName"
//                 type="text"
//                 value={form.localUnitName}
//                 onChange={handleChange}
//                 placeholder={
//                   form.intendedRole ===
//                   'branch_president'
//                     ? 'Type the official branch name'
//                     : form.intendedRole ===
//                         'bishop'
//                       ? 'Type the official ward name'
//                       : 'Select the leadership role first'
//                 }
//                 required
//                 disabled={!form.intendedRole}
//                 className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none disabled:cursor-not-allowed disabled:bg-slate-100 focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
//               />

//               <p className="mt-2 text-sm text-slate-500">
//                 Type the official Church unit
//                 name carefully. The unit will be
//                 connected to{' '}
//                 {assignedArea?.name ||
//                   'your assigned area'}.
//               </p>
//             </div>

//             <button
//               type="submit"
//               disabled={
//                 creatingInvitation ||
//                 allowedRoles.length === 0
//               }
//               className="w-full rounded-lg bg-blue-900 px-5 py-3 font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-blue-300"
//             >
//               {creatingInvitation
//                 ? 'Generating invitation...'
//                 : 'Generate Invitation Link'}
//             </button>
//           </form>
//         </section>

//         {generatedLink && (
//           <section className="mt-6 rounded-xl border border-green-200 bg-green-50 p-6">
//             <h2 className="font-bold text-green-900">
//               Invitation created successfully
//             </h2>

//             <p className="mt-2 text-sm text-green-800">
//               Copy and send this secure link to
//               the invited leader.
//             </p>

//             <div className="mt-4 flex flex-col gap-3 sm:flex-row">
//               <input
//                 type="text"
//                 readOnly
//                 value={generatedLink}
//                 className="min-w-0 flex-1 rounded-lg border border-green-300 bg-white px-4 py-3 text-sm"
//               />

//               <button
//                 type="button"
//                 onClick={handleCopyLink}
//                 className="rounded-lg bg-green-700 px-5 py-3 font-semibold text-white"
//               >
//                 Copy Link
//               </button>
//             </div>

//             {copyMessage && (
//               <p className="mt-3 text-sm font-medium text-green-800">
//                 {copyMessage}
//               </p>
//             )}
//           </section>
//         )}

//         <section className="mt-8 rounded-xl border border-slate-200 bg-white shadow-sm">
//           <div className="border-b border-slate-200 p-6">
//             <h2 className="text-xl font-bold text-blue-900">
//               Local Leader Invitations
//             </h2>

//             <p className="mt-2 text-sm text-slate-600">
//               Track pending, accepted, expired
//               and revoked invitations.
//             </p>
//           </div>

//           {invitationsError ? (
//             <div className="p-6">
//               <ErrorMessage
//                 message={invitationsError.message}
//               />
//             </div>
//           ) : invitations.length === 0 ? (
//             <p className="p-8 text-center text-slate-600">
//               You have not created any local
//               leader invitations.
//             </p>
//           ) : (
//             <div className="divide-y divide-slate-200">
//               {invitations.map((invitation) => (
//                 <InvitationItem
//                   key={invitation.id}
//                   invitation={invitation}
//                 />
//               ))}
//             </div>
//           )}
//         </section>
//       </div>
//     </main>
//   </LeaderLayout>
// );
  
// }

// function FormField({
//   label,
//   name,
//   type,
//   value,
//   onChange,
//   placeholder,
// }) {
//   return (
//     <div>
//       <label
//         htmlFor={name}
//         className="block text-sm font-semibold text-slate-700"
//       >
//         {label}
//       </label>

//       <input
//         id={name}
//         name={name}
//         type={type}
//         value={value}
//         onChange={onChange}
//         placeholder={placeholder}
//         required
//         className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
//       />
//     </div>
//   );
// }

// function SummaryCard({ label, value }) {
//   return (
//     <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
//       <p className="text-sm text-slate-500">
//         {label}
//       </p>

//       <p className="mt-2 text-xl font-bold text-blue-900">
//         {value}
//       </p>
//     </article>
//   );
// }

// function InvitationItem({ invitation }) {
//   const status = getInvitationStatus(invitation);

//   const localUnit =
//     invitation.local_units;

//   return (
//     <article className="flex flex-col justify-between gap-4 p-6 sm:flex-row sm:items-start">
//       <div>
//         <h3 className="font-bold text-slate-900">
//           {invitation.invited_full_name}
//         </h3>

//         <p className="mt-1 text-slate-600">
//           {invitation.invited_email}
//         </p>

//         <p className="mt-3 text-sm text-slate-700">
//           {formatStatus(
//             invitation.intended_role
//           )}
//           {' — '}
//           {localUnit?.name ||
//             'Unit not available'}
//         </p>

//         <p className="mt-2 text-xs text-slate-500">
//           Created:{' '}
//           {formatDate(invitation.created_at)}
//         </p>

//         <p className="mt-1 text-xs text-slate-500">
//           Expires:{' '}
//           {formatDate(invitation.expires_at)}
//         </p>
//       </div>

//       <StatusBadge status={status} />
//     </article>
//   );
// }

// function StatusBadge({ status }) {
//   const styles = {
//     Pending:
//       'bg-amber-100 text-amber-800',
//     Accepted:
//       'bg-green-100 text-green-800',
//     Expired:
//       'bg-red-100 text-red-700',
//     Revoked:
//       'bg-slate-200 text-slate-700',
//   };

//   return (
//     <span
//       className={`w-fit rounded-full px-3 py-1 text-sm font-semibold ${
//         styles[status] ||
//         'bg-slate-100 text-slate-700'
//       }`}
//     >
//       {status}
//     </span>
//   );
// }

// function ErrorMessage({ message }) {
//   return (
//     <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
//       {message}
//     </div>
//   );
// }

// function PageMessage({
//   message,
//   error = false,
// }) {
//   return (
//     <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
//       <div
//         className={
//           error
//             ? 'rounded-lg bg-red-50 p-5 text-red-700'
//             : 'rounded-lg bg-white p-5 text-slate-600 shadow'
//         }
//       >
//         {message}
//       </div>
//     </main>
//   );
// }

// function getInvitationStatus(invitation) {
//   if (invitation.revoked_at) {
//     return 'Revoked';
//   }

//   if (invitation.accepted_at) {
//     return 'Accepted';
//   }

//   if (
//     invitation.expires_at &&
//     new Date(invitation.expires_at) <
//       new Date()
//   ) {
//     return 'Expired';
//   }

//   return 'Pending';
// }

// function formatDate(value) {
//   if (!value) {
//     return 'Not available';
//   }

//   return new Intl.DateTimeFormat('en-NG', {
//     dateStyle: 'medium',
//     timeStyle: 'short',
//   }).format(new Date(value));
// }

// function formatStatus(value) {
//   if (!value) {
//     return 'Not available';
//   }

//   return value
//     .split('_')
//     .map(
//       (word) =>
//         word.charAt(0).toUpperCase() +
//         word.slice(1)
//     )
//     .join(' ');
// }