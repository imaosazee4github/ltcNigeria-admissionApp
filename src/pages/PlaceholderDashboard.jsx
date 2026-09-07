import { useAuth } from '../hooks/useAuth';

export default function PlaceholderDashboard({ title }) {
  const { profile, signOut } = useAuth();

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">{title}</p>

            <h1 className="text-3xl font-bold text-blue-900">
              Welcome, {profile?.full_name}
            </h1>
          </div>

          <button
            onClick={signOut}
            className="rounded-md border border-blue-900 px-4 py-2 text-blue-900"
          >
            Sign Out
          </button>
        </div>
      </div>
    </main>
  );
}
