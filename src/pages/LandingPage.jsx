import {
  useState,
} from 'react';

import {
  Link,
  Navigate,
  useNavigate,
} from 'react-router-dom';

import {
  useAuth,
} from '../hooks/useAuth';

import {
  getDashboardRoute,
} from '../utils/permissions';

export default function LandingPage() {
  const navigate = useNavigate();

  const {
    signIn,
    session,
    role,
    loading,
  } = useAuth();

  const [formData, setFormData] =
    useState({
      email: '',
      password: '',
    });

  const [
    errorMessage,
    setErrorMessage,
  ] = useState('');

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  function handleChange(event) {
    const {
      name,
      value,
    } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setErrorMessage('');
    setSubmitting(true);

    const {
      error,
    } = await signIn(formData);

    if (error) {
      setErrorMessage(error.message);
      setSubmitting(false);
      return;
    }

    setSubmitting(false);

    navigate(
      '/auth/redirect',
      {
        replace: true,
      }
    );
  }

  if (
    !loading &&
    session &&
    role
  ) {
    return (
      <Navigate
        to={getDashboardRoute(role)}
        replace
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#fbfaf7] text-slate-800">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link
            to="/"
            className="flex items-center gap-3"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-900 text-sm font-bold text-white">
              LTC
            </div>

            <div>
              <p className="font-serif text-xl font-bold leading-none text-blue-900">
                LightApp
              </p>

              <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-amber-600">
                Pioneer Phase Admissions
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 text-sm md:flex">
            <Link
              to="/admission-process"
              className="text-slate-700 transition hover:text-blue-900"
            >
              About the Process
            </Link>

            <Link
              to="/ltc-guidelines"
              className="text-slate-700 transition hover:text-blue-900"
            >
              LTC Guidelines
            </Link>

            <a
              href="mailto:admission@nigerialtc.org"
              className="text-slate-700 transition hover:text-blue-900"
            >
              Help & Support
            </a>

            <a
              href="#sign-in"
              className="rounded-md border border-blue-800 px-4 py-2 font-medium text-blue-900 transition hover:bg-blue-50"
            >
              Sign In
            </a>
          </nav>
        </div>

        <nav className="flex gap-5 overflow-x-auto border-t border-slate-100 px-6 py-3 text-sm md:hidden">
          <Link
            to="/admission-process"
            className="whitespace-nowrap font-medium text-slate-700"
          >
            Admission Process
          </Link>

          <Link
            to="/ltc-guidelines"
            className="whitespace-nowrap font-medium text-slate-700"
          >
            LTC Guidelines
          </Link>

          <a
            href="mailto:admission@nigerialtc.org"
            className="whitespace-nowrap font-medium text-slate-700"
          >
            Support
          </a>
        </nav>
      </header>

      <main className="mx-auto grid max-w-7xl gap-12 px-6 py-12 lg:grid-cols-[1.35fr_0.85fr] lg:items-center lg:py-20">
        <section>
          <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase text-amber-700">
            Now accepting applications
          </span>

          <h1 className="mt-5 max-w-2xl font-serif text-4xl font-bold leading-tight text-blue-900 md:text-5xl">
            Your pathway to admission,
            guided every step.
          </h1>

          <p className="mt-5 max-w-2xl leading-7 text-slate-600">
            A secure, faith-centered
            admission platform that guides
            returned missionaries through
            application review,
            ecclesiastical endorsement and
            preparation for the LTC Pioneer
            Phase.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              to="/admission-process"
              className="rounded-md bg-blue-900 px-5 py-3 font-semibold text-white transition hover:bg-blue-800"
            >
              View Admission Process
            </Link>

            <Link
              to="/ltc-guidelines"
              className="rounded-md border border-blue-900 px-5 py-3 font-semibold text-blue-900 transition hover:bg-blue-50"
            >
              Review LTC Guidelines
            </Link>
          </div>

          <div
            id="process"
            className="mt-10"
          >
            <h2 className="font-serif text-xl font-bold text-blue-900">
              The three-stage review and
              endorsement workflow
            </h2>

            <div className="mt-6 space-y-5">
              <WorkflowStep
                number="1"
                title="LTC Administrative Review"
                description="The LTC Admissions Team verifies the submitted application and supporting documents."
              />

              <WorkflowStep
                number="2"
                title="Local Leader Endorsement"
                description="The applicant is interviewed and endorsed by their Bishop or Branch President."
              />

              <WorkflowStep
                number="3"
                title="Final Endorsement"
                description="The Stake or District President completes the final ecclesiastical review and recommendation."
              />
            </div>
          </div>
        </section>

        <section
          id="sign-in"
          className="scroll-mt-8 rounded-xl border border-slate-200 bg-white p-7 shadow-sm"
        >
          <h2 className="font-serif text-2xl font-bold text-blue-900">
            Welcome Back
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Sign in to access your
            application, status updates and
            assigned portal.
          </p>

          {errorMessage && (
            <div
              role="alert"
              className="mt-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {errorMessage}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="mt-6 space-y-5"
          >
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium"
              >
                Email Address
              </label>

              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
                autoComplete="email"
                required
                className="w-full rounded-md border border-slate-300 px-3 py-3 outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium"
              >
                Password
              </label>

              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
                required
                className="w-full rounded-md border border-slate-300 px-3 py-3 outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="flex items-center justify-between gap-4 text-sm">
              <label className="flex items-center gap-2 text-slate-600">
                <input
                  type="checkbox"
                  className="h-4 w-4"
                />

                Keep me signed in
              </label>

              <Link
                to="/forgot-password"
                className="font-medium text-amber-700 hover:text-amber-800"
              >
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-md bg-blue-900 px-4 py-3 font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting
                ? 'Signing in...'
                : 'Sign In'}
            </button>

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-200" />

              <span className="text-xs uppercase text-slate-400">
                or
              </span>

              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <Link
              to="/signup"
              className="block w-full rounded-md border border-blue-800 px-4 py-3 text-center font-semibold text-blue-900 transition hover:bg-blue-50"
            >
              Start a New Application
            </Link>
          </form>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-6 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()}{' '}
            Light Training Center Nigeria.
            All rights reserved.
          </p>

          <div className="flex flex-wrap gap-6">
            <Link
              to="/admission-process"
              className="hover:text-blue-900"
            >
              Admission Process
            </Link>

            <Link
              to="/ltc-guidelines"
              className="hover:text-blue-900"
            >
              LTC Guidelines
            </Link>

            <a
              href="mailto:admission@nigerialtc.org"
              className="hover:text-blue-900"
            >
              LTC Support
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function WorkflowStep({
  number,
  title,
  description,
}) {
  return (
    <div className="flex gap-4">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-900">
        {number}
      </div>

      <div>
        <h3 className="font-semibold text-slate-900">
          {title}
        </h3>

        <p className="mt-1 text-sm leading-6 text-slate-600">
          {description}
        </p>
      </div>
    </div>
  );
}