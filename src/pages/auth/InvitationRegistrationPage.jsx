import { useEffect, useRef, useState } from "react";

import { Link, useParams } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";

import {
  acceptLeaderInvitation,
  registerInvitedLeader,
  resendLeaderConfirmation,
  validateLeaderInvitation,
} from "../../services/invitationRegistrationService";


export default function InvitationRegistrationPage() {
  const { token } = useParams();

  const { user, loading: authLoading, signOut } = useAuth();

  const acceptanceStarted = useRef(false);

  const [invitation, setInvitation] = useState(null);

  const [validating, setValidating] = useState(true);

  const [registering, setRegistering] = useState(false);

  const [accepting, setAccepting] = useState(false);

  const [message, setMessage] = useState("");

  const [messageType, setMessageType] = useState("");

  const [confirmationPending, setConfirmationPending] = useState(false);

  const [resendingConfirmation, setResendingConfirmation] = useState(false);

  const [formData, setFormData] = useState({
    phone: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  });

  useEffect(() => {
    let active = true;

    async function loadInvitation() {
      setValidating(true);
      setMessage("");

      try {
        const result = await validateLeaderInvitation(token);

        if (!active) {
          return;
        }

        setInvitation(result);

        if (!result?.valid) {
          setMessage(result?.message || "This invitation is invalid.");

          setMessageType("error");
        }
      } catch (error) {
        if (!active) {
          return;
        }

        setMessage(error.message);
        setMessageType("error");
      } finally {
        if (active) {
          setValidating(false);
        }
      }
    }

    loadInvitation();

    return () => {
      active = false;
    };
  }, [token]);

  /*
   * After email verification, Supabase redirects
   * back to this page. When a session is available,
   * accept the invitation automatically.
   */
  useEffect(() => {
    if (
      authLoading ||
      validating ||
      !user ||
      !invitation?.valid ||
      acceptanceStarted.current
    ) {
      return;
    }

    const signedInEmail = user.email?.toLowerCase();

    const invitedEmail = invitation.invited_email?.toLowerCase();

    if (signedInEmail !== invitedEmail) {
      setMessage(
        `You are signed in as ${user.email}. Sign out and use ${invitation.invited_email}.`,
      );

      setMessageType("error");
      return;
    }

    acceptanceStarted.current = true;

    async function completeInvitation() {
      setAccepting(true);
      setMessage("Assigning your leadership role...");

      setMessageType("info");

      try {
        await acceptLeaderInvitation(token);

        setMessage("Invitation accepted. Redirecting to your dashboard...");

        setMessageType("success");

        /*
         * A full reload ensures AuthContext fetches
         * the newly assigned leadership role.
         */
        window.setTimeout(() => {
          window.location.replace("/auth/redirect");
        }, 1200);
      } catch (error) {
        acceptanceStarted.current = false;

        setMessage(error.message);
        setMessageType("error");
        setAccepting(false);
      }
    }

    completeInvitation();
  }, [authLoading, validating, user, invitation, token]);

  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));

    setMessage("");
    setMessageType("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setMessage("");
    setMessageType("");

    if (!invitation?.valid) {
      setMessage("This invitation cannot be used.");

      setMessageType("error");
      return;
    }

    if (!formData.phone.trim()) {
      setMessage("Enter your phone number.");

      setMessageType("error");
      return;
    }

    if (formData.password.length < 8) {
      setMessage("Password must contain at least 8 characters.");

      setMessageType("error");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setMessage("The passwords do not match.");

      setMessageType("error");
      return;
    }

    if (!formData.acceptTerms) {
      setMessage("Accept the account terms to continue.");

      setMessageType("error");
      return;
    }

    try {
      setRegistering(true);

      const result = await registerInvitedLeader({
        token,
        email: invitation.invited_email,
        fullName: invitation.invited_full_name,
        phone: formData.phone,
        password: formData.password,
      });

      if (result.session) {
        setMessage("Account created. Accepting your invitation...");

        setMessageType("success");
      } else {
        setConfirmationPending(true);

        setMessage(
          "Account created. Check your email and click the verification link to complete your registration.",
        );

        setMessageType("success");
      }
  
    
    } catch (error) {
      setMessage(error.message);
      setMessageType("error");
    } finally {
      setRegistering(false);
    }
  }

  async function handleResendConfirmation() {
    if (!invitation?.invited_email) {
      setMessage("The invited email address is missing.");

      setMessageType("error");
      return;
    }

    try {
      setResendingConfirmation(true);
      setMessage("");

      await resendLeaderConfirmation({
        token,
        email: invitation.invited_email,
      });

      setMessage(
        `A new confirmation email was sent to ${invitation.invited_email}. Use only the newest email.`,
      );

      setMessageType("success");
    } catch (error) {
      setMessage(error.message);
      setMessageType("error");
    } finally {
      setResendingConfirmation(false);
    }
  }

  async function handleWrongAccountSignOut() {
    try {
      await signOut();

      acceptanceStarted.current = false;

      setMessage(
        `You have been signed out. Continue using ${invitation?.invited_email}.`,
      );

      setMessageType("info");
    } catch (error) {
      setMessage(error.message);
      setMessageType("error");
    }
  }

  if (validating || authLoading) {
    return <PageMessage message="Validating invitation..." />;
  }

  if (!invitation?.valid) {
    return (
      <InvalidInvitation message={message || "This invitation is invalid."} />
    );
  }

  const signedInWithWrongEmail =
    user &&
    user.email?.toLowerCase() !== invitation.invited_email?.toLowerCase();

  return (
    <main className="min-h-screen bg-slate-50 p-5 md:p-8">
      <div className="mx-auto max-w-3xl">
        <Link to="/" className="font-semibold text-blue-900">
          ← Return to login
        </Link>

        <section className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <header className="border-b border-slate-200 bg-blue-900 p-6 text-white md:p-8">
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-200">
              LTC Nigeria Admissions
            </p>

            <h1 className="mt-2 text-3xl font-bold">Leadership Invitation</h1>

            <p className="mt-2 text-blue-100">
              Create your account to access your assigned leadership dashboard.
            </p>
          </header>

          <div className="p-6 md:p-8">
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-5">
              <p className="text-sm font-semibold text-blue-700">
                You have been invited as
              </p>

              <p className="mt-1 text-xl font-bold text-blue-900">
                {formatValue(invitation.intended_role)}
              </p>

              <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                <InvitationDetail
                  label="Leader"
                  value={invitation.invited_full_name}
                />

                <InvitationDetail
                  label="Email"
                  value={invitation.invited_email}
                />

                <InvitationDetail
                  label="Church area"
                  value={invitation.area_name}
                />

                <InvitationDetail
                  label="Area type"
                  value={formatValue(invitation.area_type)}
                />
              </dl>
            </div>

            {message && (
              <div
                className={`mt-5 rounded-md border p-4 text-sm ${getMessageClasses(
                  messageType,
                )}`}
              >
                {message}
              </div>
            )}

            {signedInWithWrongEmail ? (
              <div className="mt-6">
                <p className="text-sm text-slate-700">
                  You must sign out before registering with the invited email
                  address.
                </p>

                <button
                  type="button"
                  onClick={handleWrongAccountSignOut}
                  className="mt-4 rounded-md bg-red-700 px-5 py-3 font-semibold text-white"
                >
                  Sign Out Current Account
                </button>
              </div>
            ) : user ? (
              <div className="mt-6 rounded-md bg-blue-50 p-5 text-blue-900">
                {accepting
                  ? "Completing your leadership registration..."
                  : "Preparing your leadership account..."}
              </div>
            ) : confirmationPending ? (
              <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-5">
                <h2 className="font-bold text-amber-900">
                  Confirm your email address
                </h2>

                <p className="mt-2 text-sm text-amber-800">
                  We sent a confirmation email to{" "}
                  <strong>{invitation.invited_email}</strong>. Click the
                  verification link before signing in.
                </p>

                <button
                  type="button"
                  onClick={handleResendConfirmation}
                  disabled={resendingConfirmation}
                  className="mt-5 rounded-md border border-amber-700 px-5 py-3 font-semibold text-amber-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {resendingConfirmation
                    ? "Sending confirmation..."
                    : "Resend Confirmation Email"}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-7 space-y-5">
                <ReadOnlyField
                  label="Full name"
                  value={invitation.invited_full_name}
                />

                <ReadOnlyField
                  label="Email address"
                  value={invitation.invited_email}
                />

                <FormField
                  label="Phone number"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+234..."
                />

                <FormField
                  label="Password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Minimum 8 characters"
                />

                <FormField
                  label="Confirm password"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Enter password again"
                />

                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    name="acceptTerms"
                    checked={formData.acceptTerms}
                    onChange={handleChange}
                    className="mt-1 h-4 w-4"
                  />

                  <span className="text-sm leading-6 text-slate-700">
                    I confirm that I am the invited Church leader and agree to
                    use candidate information only for authorized endorsement
                    purposes.
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={registering}
                  className="w-full rounded-md bg-blue-900 px-6 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {registering
                    ? "Creating account..."
                    : "Create Leadership Account"}
                </button>
              </form>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function InvitationDetail({ label, value }) {
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

function ReadOnlyField({ label, value }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <input
        type="text"
        value={value || ""}
        readOnly
        className="w-full rounded-md border border-slate-300 bg-slate-100 px-3 py-3 text-slate-600"
      />
    </div>
  );
}

function FormField({ label, name, type, value, onChange, placeholder }) {
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

function InvalidInvitation({ message }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-lg rounded-xl border border-red-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-red-700">
          Invitation Unavailable
        </h1>

        <p className="mt-4 text-slate-600">{message}</p>

        <Link
          to="/"
          className="mt-6 inline-block rounded-md bg-blue-900 px-6 py-3 font-semibold text-white"
        >
          Return to Login
        </Link>
      </div>
    </main>
  );
}

function PageMessage({ message }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="rounded-lg bg-white p-5 text-slate-600 shadow">
        {message}
      </div>
    </main>
  );
}

function getMessageClasses(type) {
  if (type === "success") {
    return "border-green-200 bg-green-50 text-green-800";
  }

  if (type === "info") {
    return "border-blue-200 bg-blue-50 text-blue-800";
  }

  return "border-red-200 bg-red-50 text-red-700";
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
