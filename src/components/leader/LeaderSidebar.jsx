import { NavLink } from 'react-router-dom';

export default function LeaderSidebar({
  open,
  onClose,
  leaderRole,
}) {
  const dashboardPath =
    leaderRole === 'district_president'
      ? '/district-president/dashboard'
      : '/stake-president/dashboard';

  const navigation = [
    {
      name: 'Dashboard',
      path: dashboardPath,
      enabled: true,
    },
    {
      name: 'Leader Invitations',
      path: '/president/leader-invitations',
      enabled: true,
    },
    {
      name: 'Final Endorsements',
      path: '/president/endorsements',
      enabled: false,
    },
    {
      name: 'Candidates',
      path: '/president/candidates',
      enabled: false,
    },
    {
      name: 'Settings',
      path: '/president/settings',
      enabled: false,
    },
  ];

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={onClose}
          className="fixed inset-0 z-30 bg-slate-950/40 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:translate-x-0 ${
          open
            ? 'translate-x-0'
            : '-translate-x-full'
        }`}
      >
        <div className="flex h-20 items-center justify-between border-b border-slate-200 px-6">
          <div>
            <p className="text-xl font-bold text-blue-900">
              LightApp
            </p>

            <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">
              Church Leadership
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="text-2xl text-slate-500 lg:hidden"
          >
            ×
          </button>
        </div>

        <nav className="flex-1 space-y-2 p-4">
          {navigation.map((item, index) => {
            if (!item.enabled) {
              return (
                <div
                  key={item.name}
                  title="Coming soon"
                  className="flex cursor-not-allowed items-center justify-between rounded-lg px-4 py-3 text-sm font-medium text-slate-400"
                >
                  <span className="flex items-center gap-3">
                    <NavigationIcon
                      number={index + 1}
                    />

                    {item.name}
                  </span>

                  <span className="text-[10px] font-semibold uppercase">
                    Soon
                  </span>
                </div>
              );
            }

            return (
              <NavLink
                key={item.name}
                to={item.path}
                end
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold transition ${
                    isActive
                      ? 'bg-blue-50 text-blue-900'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-blue-900'
                  }`
                }
              >
                <NavigationIcon
                  number={index + 1}
                />

                {item.name}
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-slate-200 p-5">
          <p className="text-xs font-semibold text-blue-900">
            LTC Admission Portal
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Secure leadership processing
          </p>
        </div>
      </aside>
    </>
  );
}

function NavigationIcon({ number }) {
  return (
    <span className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-100 text-xs font-bold">
      {number}
    </span>
  );
}