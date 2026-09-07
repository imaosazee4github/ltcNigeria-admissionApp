import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import AdminSidebar from '../components/admin/AdminSidebar';
import { useAuth } from '../hooks/useAuth';

export default function AdminLayout({
  title,
  description,
  children,
}) {
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  async function handleSignOut() {
    const { error } = await signOut();

    if (error) {
      console.error(error.message);
      return;
    }

    navigate('/', {
      replace: true,
    });
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white">
          <div className="flex min-h-20 items-center justify-between gap-4 px-5 py-4 md:px-8">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() =>
                  setSidebarOpen(true)
                }
                className="rounded-md border border-slate-300 px-3 py-2 text-xl lg:hidden"
              >
                ☰
              </button>

              <div>
                <h1 className="text-xl font-bold text-blue-900 md:text-2xl">
                  {title}
                </h1>

                {description && (
                  <p className="mt-1 text-sm text-slate-500">
                    {description}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold text-slate-800">
                  {profile?.full_name ||
                    'Administrator'}
                </p>

                <p className="text-xs text-slate-500">
                  LTC Administrator
                </p>
              </div>

              <button
                type="button"
                onClick={handleSignOut}
                className="rounded-md border border-blue-900 px-4 py-2 text-sm font-semibold text-blue-900 hover:bg-blue-50"
              >
                Sign Out
              </button>
            </div>
          </div>
        </header>

        <main className="p-5 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}