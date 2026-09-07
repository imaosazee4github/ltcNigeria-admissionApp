import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import LeaderSidebar from '../components/leader/LeaderSidebar';
import { useAuth } from '../hooks/useAuth';

export default function LeaderLayout({
  children,
}) {
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const leaderRole = profile?.role;

  async function handleSignOut() {
    const result = await signOut();

    if (result?.error) {
      console.error(result.error.message);
      return;
    }

    navigate('/', {
      replace: true,
    });
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <LeaderSidebar
        open={sidebarOpen}
        onClose={() =>
          setSidebarOpen(false)
        }
        leaderRole={leaderRole}
      />

      <div className="min-h-screen lg:pl-72">
        <header className="sticky top-0 z-20 flex min-h-20 items-center justify-between border-b border-slate-200 bg-white px-5 py-4 md:px-8">
          <div className="flex items-center gap-4">
            <button
              type="button"
              aria-label="Open navigation menu"
              onClick={() =>
                setSidebarOpen(true)
              }
              className="rounded-md border border-slate-300 px-3 py-2 text-xl text-slate-700 lg:hidden"
            >
              ☰
            </button>

            <div>
              <p className="text-sm text-slate-500">
                Welcome
              </p>

              <p className="font-bold text-blue-900">
                {profile?.full_name ||
                  'Church Leader'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            className="rounded-md border border-blue-900 px-4 py-2 text-sm font-semibold text-blue-900 transition hover:bg-blue-50"
          >
            Sign Out
          </button>
        </header>

        <div>{children}</div>
      </div>
    </div>
  );
}