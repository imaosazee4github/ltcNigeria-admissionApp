export const DASHBOARD_ROUTES = {
  candidate: '/candidate/dashboard',
  bishop: '/bishop/dashboard',
  branch_president: '/branch-president/dashboard',
  stake_president: '/stake-president/dashboard',
  district_president: '/district-president/dashboard',
  ltc_admin: '/admin/dashboard',
  super_admin: '/super-admin/dashboard',
};

export function getDashboardRoute(role) {
  return DASHBOARD_ROUTES[role] || '/unauthorized';
}