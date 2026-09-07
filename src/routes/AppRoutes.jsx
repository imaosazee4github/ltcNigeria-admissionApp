import { Route, Routes } from "react-router-dom";

import PresidentDashboard from "../pages/leaders/PresidentDashboard";

import LocalLeaderDashboard from "../pages/leaders/LocalLeaderDashboard";
import LandingPage from "../pages/LandingPage";
import SignUpPage from "../pages/auth/SignUpPage";
import AuthRedirectPage from "../pages/auth/AuthRedirectPage";
import LeaderInvitationsPage from "../pages/admin/LeaderInvitationsPage";

import LocalLeaderInvitationsPage from "../pages/leaders/LocalLeaderInvitationsPage";
import InvitationRegistrationPage from "../pages/auth/InvitationRegistrationPage";
import CandidateDashboard from "../pages/candidate/CandidateDashboard";
import ApplicationPage from "../pages/candidate/ApplicationPage";

import AdminDashboard from "../pages/admin/AdminDashboard";
import ApplicationReviewPage from "../pages/admin/ApplicationReviewPage";

import PlaceholderDashboard from "../pages/PlaceholderDashboard";

import ProtectedRoute from "../components/common/ProtectedRoute";
import RoleRoute from "../components/common/RoleRoute";

function SecureRolePage({ roles, children }) {
  return (
    <ProtectedRoute>
      <RoleRoute allowedRoles={roles}>{children}</RoleRoute>
    </ProtectedRoute>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />

      <Route path="/signup" element={<SignUpPage />} />

      <Route
        path="/invitation/:token"
        element={<InvitationRegistrationPage />}
      />

      <Route path="/auth/redirect" element={<AuthRedirectPage />} />

      {/* Candidate routes */}
      <Route
        path="/candidate/dashboard"
        element={
          <SecureRolePage roles={["candidate"]}>
            <CandidateDashboard />
          </SecureRolePage>
        }
      />

      <Route
        path="/candidate/application"
        element={
          <SecureRolePage roles={["candidate"]}>
            <ApplicationPage />
          </SecureRolePage>
        }
      />

      {/* Bishop route */}

      <Route
        path="/bishop/dashboard"
        element={
          <SecureRolePage roles={["bishop"]}>
            <LocalLeaderDashboard />
          </SecureRolePage>
        }
      />

      {/* Branch President route */}
      {/* <Route
        path="/branch-president/dashboard"
        element={
          <SecureRolePage roles={["branch_president"]}>
            <PlaceholderDashboard title="Branch President Dashboard" />
          </SecureRolePage>
        }
      /> */}

      <Route
        path="/branch-president/dashboard"
        element={
          <SecureRolePage roles={["branch_president"]}>
            <LocalLeaderDashboard />
          </SecureRolePage>
        }
      />

      {/* Stake President route */}

      <Route
        path="/stake-president/dashboard"
        element={
          <SecureRolePage roles={["stake_president"]}>
            <PresidentDashboard />
          </SecureRolePage>
        }
      />

      {/* District President route */}

      <Route
        path="/district-president/dashboard"
        element={
          <SecureRolePage roles={["district_president"]}>
            <PresidentDashboard />
          </SecureRolePage>
        }
      />

      <Route
        path="/president/leader-invitations"
        element={
          <SecureRolePage roles={["stake_president", "district_president"]}>
            <LocalLeaderInvitationsPage />
          </SecureRolePage>
        }
      />

      {/* LTC Admin dashboard */}
      <Route
        path="/admin/dashboard"
        element={
          <SecureRolePage roles={["ltc_admin", "super_admin"]}>
            <AdminDashboard />
          </SecureRolePage>
        }
      />

      {/* LTC Admin application review */}
      <Route
        path="/admin/applications/:applicationId"
        element={
          <SecureRolePage roles={["ltc_admin", "super_admin"]}>
            <ApplicationReviewPage />
          </SecureRolePage>
        }
      />

      <Route
        path="/admin/leader-invitations"
        element={
          <SecureRolePage roles={["ltc_admin"]}>
            <LeaderInvitationsPage />
          </SecureRolePage>
        }
      />

      <Route
        path="/president/leader-invitations"
        element={
          <SecureRolePage roles={["stake_president", "district_president"]}>
            <LocalLeaderInvitationsPage />
          </SecureRolePage>
        }
      />

      {/* Super Admin dashboard */}
      <Route
        path="/super-admin/dashboard"
        element={
          <SecureRolePage roles={["super_admin"]}>
            <PlaceholderDashboard title="Super Admin Dashboard" />
          </SecureRolePage>
        }
      />

      {/* Unauthorized */}
      <Route
        path="/unauthorized"
        element={
          <main className="flex min-h-screen items-center justify-center p-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-red-700">Access Denied</h1>

              <p className="mt-3 text-slate-600">
                Your account does not have permission to access this page.
              </p>
            </div>
          </main>
        }
      />

      {/* 404 */}
      <Route
        path="*"
        element={
          <main className="flex min-h-screen items-center justify-center">
            <h1 className="text-3xl font-bold">Page Not Found</h1>
          </main>
        }
      />
    </Routes>
  );
}
