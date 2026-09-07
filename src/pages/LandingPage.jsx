import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getDashboardRoute } from '../utils/permissions';

export default function LandingPage() {
  const navigate = useNavigate();
  const { signIn, session, role, loading } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errorMessage, setErrorMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage('');
    setSubmitting(true);

    const { error } = await signIn(formData);

    if (error) {
      setErrorMessage(error.message);
      setSubmitting(false);
      return;
    }

    setSubmitting(false);
    navigate('/auth/redirect', { replace: true });
  }

  if (!loading && session && role) {
    return <Navigate to={getDashboardRoute(role)} replace />;
  }

  return (
    <div className="min-h-screen bg-[#fbfaf7] text-slate-800">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-900 font-bold text-white">
              LA
            </div>

            <div>
              <p className="font-serif text-xl font-bold text-blue-900">
                LightApp
              </p>

              <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-600">
                Admissions
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 text-sm md:flex">
            <a href="#process" className="text-blue-900">
              About the Process
            </a>

            <Link to="/guidelines">
              LTC Guidelines
            </Link>

            <Link to="/support">
              Help & Support
            </Link>

            <Link
              to="/portal/login"
              className="rounded-md border border-blue-800 px-4 py-2 font-medium text-blue-900"
            >
              LTC Admin Portal
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-12 px-6 py-12 lg:grid-cols-[1.35fr_0.85fr] lg:items-center lg:py-20">
        <section>
          <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase text-amber-700">
            Now accepting applications
          </span>

          <h1 className="mt-5 max-w-2xl font-serif text-4xl font-bold leading-tight text-blue-900 md:text-5xl">
            Your pathway to admission, guided every step.
          </h1>

          <p className="mt-5 max-w-2xl leading-7 text-slate-600">
            A secure, church-affiliated student admissions system
            designed to synchronize your academic ambitions with
            ecclesiastical support.
          </p>

          <div id="process" className="mt-10">
            <h2 className="font-serif text-xl font-bold text-blue-900">
              The 3-Stage Endorsement Workflow
            </h2>

            <div className="mt-6 space-y-5">
              <WorkflowStep
                number="1"
                title="LTC Admin Review"
                description="First-stage verification and academic qualification checks."
              />

              <WorkflowStep
                number="2"
                title="Priesthood Endorsement"
                description="Interview and spiritual endorsement from your Bishop or Branch President."
              />

              <WorkflowStep
                number="3"
                title="Final Endorsement"
                description="Concluding interview and review by your Stake or District President."
              />
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-7 shadow-sm">
          <h2 className="font-serif text-2xl font-bold text-blue-900">
            Welcome Back
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Access your application portfolio and status tracker.
          </p>

          {errorMessage && (
            <div className="mt-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
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
                placeholder="student@example.com"
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
                <input type="checkbox" />
                Keep me signed in
              </label>

              <Link
                to="/forgot-password"
                className="font-medium text-amber-700"
              >
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-md bg-blue-900 px-4 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Signing in...' : 'Sign In'}
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
              className="block w-full rounded-md border border-blue-800 px-4 py-3 text-center font-semibold text-blue-900"
            >
              Register as New Student
            </Link>
          </form>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-6 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
          <p>
            © 2026 LightApp Admissions. All rights reserved.
          </p>

          <div className="flex gap-6">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Use</Link>
            <Link to="/support">LTC Support</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function WorkflowStep({ number, title, description }) {
  return (
    <div className="flex gap-4">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-900">
        {number}
      </div>

      <div>
        <h3 className="font-semibold text-slate-900">
          {title}
        </h3>

        <p className="mt-1 text-sm text-slate-600">
          {description}
        </p>
      </div>
    </div>
  );
}