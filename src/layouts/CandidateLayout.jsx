import {
  useState,
} from 'react';

import {
  useNavigate,
} from 'react-router-dom';

import CandidateSidebar from '../components/candidate/CandidateSidebar';

import { useAuth } from '../hooks/useAuth';

export default function CandidateLayout({
  children,
}) {
  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const navigate = useNavigate();

  const {
    profile,
    signOut,
  } = useAuth();

  async function handleSignOut() {
    const {
      error,
    } = await signOut();

    if (error) {
      console.error(
        error.message
      );

      return;
    }

    navigate('/', {
      replace: true,
    });
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <CandidateSidebar
        open={sidebarOpen}
        onClose={() =>
          setSidebarOpen(false)
        }
      />

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-slate-200 bg-white px-5 md:px-8">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() =>
                setSidebarOpen(true)
              }
              aria-label="Open navigation"
              className="rounded-lg border border-slate-200 px-3 py-2 text-xl text-blue-900 lg:hidden"
            >
              ☰
            </button>

            <div>
              <p className="text-xs text-slate-500">
                Welcome
              </p>

              <p className="font-semibold text-blue-900">
                {profile?.full_name ||
                  'Candidate'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            className="rounded-lg border border-blue-900 px-4 py-2 text-sm font-semibold text-blue-900 transition hover:bg-blue-50"
          >
            Sign Out
          </button>
        </header>

        {children}
      </div>
    </div>
  );
}