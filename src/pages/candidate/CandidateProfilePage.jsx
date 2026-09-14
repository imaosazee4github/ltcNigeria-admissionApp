import {
  useEffect,
  useState,
} from 'react';

import { Link } from 'react-router-dom';

import CandidateLayout from '../../layouts/CandidateLayout';

import HonorCodeModal from '../../components/common/HonorCodeModal';

import { useAuth } from '../../hooks/useAuth';

import {
  changeAccountPassword,
  getCandidateProfileDetails,
  updateAccountProfile,
} from '../../services/applicationService';

export default function CandidateProfilePage() {
  const {
    profile,
    user,
    fetchProfile,
  } = useAuth();

  const [
    candidateProfile,
    setCandidateProfile,
  ] = useState(null);

  const [fullName, setFullName] =
    useState(
      profile?.full_name || ''
    );

  const [phone, setPhone] =
    useState(profile?.phone || '');

  const [
    newPassword,
    setNewPassword,
  ] = useState('');

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState('');

  const [
    honorCodeOpen,
    setHonorCodeOpen,
  ] = useState(false);

  const [loading, setLoading] =
    useState(true);

  const [
    savingProfile,
    setSavingProfile,
  ] = useState(false);

  const [
    changingPassword,
    setChangingPassword,
  ] = useState(false);

  const [message, setMessage] =
    useState('');

  const [error, setError] =
    useState('');

  useEffect(() => {
    setFullName(
      profile?.full_name || ''
    );

    setPhone(
      profile?.phone || ''
    );
  }, [
    profile?.full_name,
    profile?.phone,
  ]);

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      if (!profile?.id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');

      try {
        const result =
          await getCandidateProfileDetails(
            profile.id
          );

        if (active) {
          setCandidateProfile(result);
        }
      } catch (loadError) {
        if (active) {
          setError(
            loadError.message ||
              'Unable to load your profile.'
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      active = false;
    };
  }, [profile?.id]);

  async function handleProfileSave(
    event
  ) {
    event.preventDefault();

    setMessage('');
    setError('');

    if (!fullName.trim()) {
      setError(
        'Enter your full name.'
      );

      return;
    }

    setSavingProfile(true);

    try {
      await updateAccountProfile({
        profileId: profile.id,
        fullName,
        phone,
      });

      await fetchProfile(profile.id);

      setMessage(
        'Your account information was updated successfully.'
      );
    } catch (saveError) {
      setError(
        saveError.message ||
          'Unable to update your profile.'
      );
    } finally {
      setSavingProfile(false);
    }
  }

  async function handlePasswordChange(
    event
  ) {
    event.preventDefault();

    setMessage('');
    setError('');

    if (newPassword.length < 8) {
      setError(
        'Your password must contain at least 8 characters.'
      );

      return;
    }

    if (
      newPassword !==
      confirmPassword
    ) {
      setError(
        'The passwords do not match.'
      );

      return;
    }

    setChangingPassword(true);

    try {
      await changeAccountPassword(
        newPassword
      );

      setNewPassword('');
      setConfirmPassword('');

      setMessage(
        'Your password was changed successfully.'
      );
    } catch (passwordError) {
      setError(
        passwordError.message ||
          'Unable to change your password.'
      );
    } finally {
      setChangingPassword(false);
    }
  }

  if (loading) {
    return (
      <CandidateLayout>
        <PageMessage message="Loading your profile..." />
      </CandidateLayout>
    );
  }

  return (
    <CandidateLayout>
      <main className="p-5 md:p-8">
        <div className="mx-auto max-w-6xl">
          <header>
            <p className="text-sm font-semibold uppercase tracking-wider text-amber-600">
              Candidate Account
            </p>

            <h1 className="mt-2 text-3xl font-bold text-blue-900">
              My Profile
            </h1>

            <p className="mt-2 text-slate-600">
              Manage your account and view
              your submitted candidate
              information.
            </p>
          </header>

          {message && (
            <div className="mt-7 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-700">
              {message}
            </div>
          )}

          {error && (
            <div className="mt-7 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
              {error}
            </div>
          )}

          <section className="mt-7 grid gap-6 lg:grid-cols-3">
            <form
              onSubmit={handleProfileSave}
              className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2"
            >
              <h2 className="text-xl font-bold text-blue-900">
                Account Information
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Update your name and phone
                number.
              </p>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <FormField
                  label="Full name"
                  required
                >
                  <input
                    type="text"
                    value={fullName}
                    onChange={(event) =>
                      setFullName(
                        event.target.value
                      )
                    }
                    className={inputClasses}
                  />
                </FormField>

                <FormField label="Phone number">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(event) =>
                      setPhone(
                        event.target.value
                      )
                    }
                    className={inputClasses}
                  />
                </FormField>
              </div>

              <div className="mt-5">
                <FormField label="Email address">
                  <input
                    type="email"
                    value={
                      profile?.email ||
                      user?.email ||
                      ''
                    }
                    disabled
                    className={`${inputClasses} cursor-not-allowed bg-slate-100 text-slate-500`}
                  />
                </FormField>

                <p className="mt-2 text-xs text-slate-500">
                  Contact the LTC Admin if
                  your registered email address
                  needs to be changed.
                </p>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="rounded-lg bg-blue-900 px-6 py-3 font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {savingProfile
                    ? 'Saving...'
                    : 'Save Changes'}
                </button>
              </div>
            </form>

            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-blue-900">
                Honor Code
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-600">
                Review the LTC Nigeria Student
                Honor Code and Dress and
                Grooming Standards.
              </p>

              <button
                type="button"
                onClick={() =>
                  setHonorCodeOpen(true)
                }
                className="mt-6 w-full rounded-lg border border-blue-900 px-5 py-3 font-semibold text-blue-900 transition hover:bg-blue-50"
              >
                View Honor Code
              </button>
            </section>
          </section>

          <section className="mt-7 grid gap-6 lg:grid-cols-2">
            <InformationCard
              title="Mission Information"
              description="Mission information is taken from your application."
            >
              <Detail
                label="Mission name"
                value={
                  candidateProfile
                    ?.mission_name
                }
              />

              <Detail
                label="Mission country"
                value={
                  candidateProfile
                    ?.mission_country
                }
              />

              <Detail
                label="Mission start date"
                value={formatDate(
                  candidateProfile
                    ?.mission_start_date
                )}
              />

              <Detail
                label="Mission end date"
                value={formatDate(
                  candidateProfile
                    ?.mission_end_date
                )}
              />

              <Detail
                label="Missionary status"
                value={formatText(
                  candidateProfile
                    ?.missionary_status
                )}
              />

              <EditApplicationLink />
            </InformationCard>

            <InformationCard
              title="Church Information"
              description="Church information is taken from your application."
            >
              <Detail
                label="Stake or District"
                value={
                  candidateProfile
                    ?.ecclesiastical_area_name
                }
              />

              <Detail
                label="Area type"
                value={formatText(
                  candidateProfile
                    ?.ecclesiastical_area_type
                )}
              />

              <Detail
                label="Ward or Branch"
                value={
                  candidateProfile
                    ?.local_unit_name
                }
              />

              <Detail
                label="Local-unit type"
                value={formatText(
                  candidateProfile
                    ?.local_unit_type
                )}
              />

              <Detail
                label="Membership record number"
                value={
                  candidateProfile
                    ?.membership_record_number
                }
              />

              <EditApplicationLink />
            </InformationCard>
          </section>

          <form
            onSubmit={handlePasswordChange}
            className="mt-7 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h2 className="text-xl font-bold text-blue-900">
              Account Security
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Change your account password.
            </p>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <FormField
                label="New password"
                required
              >
                <input
                  type="password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(event) =>
                    setNewPassword(
                      event.target.value
                    )
                  }
                  placeholder="At least 8 characters"
                  className={inputClasses}
                />
              </FormField>

              <FormField
                label="Confirm new password"
                required
              >
                <input
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(
                      event.target.value
                    )
                  }
                  className={inputClasses}
                />
              </FormField>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                disabled={changingPassword}
                className="rounded-lg bg-blue-900 px-6 py-3 font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {changingPassword
                  ? 'Changing Password...'
                  : 'Change Password'}
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
      />
    </CandidateLayout>
  );
}

const inputClasses =
  'mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-100';

function FormField({
  label,
  required = false,
  children,
}) {
  return (
    <label className="block text-sm font-semibold text-slate-700">
      {label}

      {required && (
        <span className="text-red-600">
          {' '}
          *
        </span>
      )}

      {children}
    </label>
  );
}

function InformationCard({
  title,
  description,
  children,
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-blue-900">
        {title}
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        {description}
      </p>

      <dl className="mt-6 grid gap-5 sm:grid-cols-2">
        {children}
      </dl>
    </section>
  );
}

function Detail({
  label,
  value,
}) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </dt>

      <dd className="mt-1 font-medium text-slate-900">
        {value || 'Not provided'}
      </dd>
    </div>
  );
}

function EditApplicationLink() {
  return (
    <div className="sm:col-span-2">
      <Link
        to="/candidate/application"
        className="inline-flex text-sm font-semibold text-blue-800 hover:text-blue-950"
      >
        View information in My Application →
      </Link>
    </div>
  );
}

function PageMessage({
  message,
}) {
  return (
    <main className="flex min-h-[70vh] items-center justify-center p-6">
      <p className="text-slate-600">
        {message}
      </p>
    </main>
  );
}

function formatDate(value) {
  if (!value) {
    return 'Not provided';
  }

  return new Intl.DateTimeFormat(
    'en-NG',
    {
      dateStyle: 'medium',
    }
  ).format(new Date(value));
}

function formatText(value) {
  if (!value) {
    return 'Not provided';
  }

  return String(value)
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}