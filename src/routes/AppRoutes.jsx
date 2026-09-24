import { Route, Routes } from "react-router-dom";

import LandingPage from "../pages/LandingPage";
import AdmissionProcessPage from "../pages/public/AdmissionProcessPage";
import LtcGuidelinesPage from "../pages/public/LtcGuidelinesPage";
import PlaceholderDashboard from "../pages/PlaceholderDashboard";

import AdmittedStudentsPage from "../pages/admin/AdmittedStudentsPage";
import AdminRoomsPage from "../pages/admin/AdminRoomsPage";
import AdminEndorsementsPage from "../pages/admin/AdminEndorsementsPage";
import AdminApplicationsPage from "../pages/admin/AdminApplicationsPage";
import LocalEndorsementsPage from "../pages/leaders/LocalEndorsementsPage";
import SignUpPage from "../pages/auth/SignUpPage";
import AuthRedirectPage from "../pages/auth/AuthRedirectPage";
import InvitationRegistrationPage from "../pages/auth/InvitationRegistrationPage";

import CandidateDashboard from "../pages/candidate/CandidateDashboard";
import ApplicationPage from "../pages/candidate/ApplicationPage";
import CandidateProfilePage from "../pages/candidate/CandidateProfilePage";

import PresidentDashboard from "../pages/leaders/PresidentDashboard";
import LocalLeaderDashboard from "../pages/leaders/LocalLeaderDashboard";
import LocalLeaderInvitationsPage from "../pages/leaders/LocalLeaderInvitationsPage";
import LocalEndorsementReviewPage from "../pages/leaders/LocalEndorsementReviewPage";
import FinalEndorsementsPage from "../pages/leaders/FinalEndorsementsPage";
import FinalEndorsementReviewPage from "../pages/leaders/FinalEndorsementReviewPage";
import LeaderCandidatesPage from "../pages/leaders/LeaderCandidatesPage";

import AdminDashboard from "../pages/admin/AdminDashboard";
import ApplicationReviewPage from "../pages/admin/ApplicationReviewPage";
import LeaderInvitationsPage from "../pages/admin/LeaderInvitationsPage";

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
       <Route path="/admission-process" element={<AdmissionProcessPage />} />
      <Route path="/ltc-guidelines" element={<LtcGuidelinesPage />} />
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

      <Route
        path="/admin/endorsements"
        element={
          <SecureRolePage roles={["ltc_admin", "super_admin"]}>
            <AdminEndorsementsPage />
          </SecureRolePage>
        }
      />

      <Route
        path="/candidate/profile"
        element={
          <SecureRolePage roles={["candidate"]}>
            <CandidateProfilePage />
          </SecureRolePage>
        }
      />

      {/* Local leader routes */}
      <Route
        path="/bishop/dashboard"
        element={
          <SecureRolePage roles={["bishop"]}>
            <LocalLeaderDashboard />
          </SecureRolePage>
        }
      />

      <Route
        path="/branch-president/dashboard"
        element={
          <SecureRolePage roles={["branch_president"]}>
            <LocalLeaderDashboard />
          </SecureRolePage>
        }
      />

      <Route
        path="/leader/endorsements"
        element={
          <SecureRolePage roles={["bishop", "branch_president"]}>
            <LocalEndorsementsPage />
          </SecureRolePage>
        }
      />

      <Route
        path="/leader/endorsements/:applicationId"
        element={
          <SecureRolePage roles={["bishop", "branch_president"]}>
            <LocalEndorsementReviewPage />
          </SecureRolePage>
        }
      />

      <Route
        path="/leader/candidates"
        element={
          <SecureRolePage roles={["bishop", "branch_president"]}>
            <LeaderCandidatesPage />
          </SecureRolePage>
        }
      />

      {/* Area president routes */}
      <Route
        path="/stake-president/dashboard"
        element={
          <SecureRolePage roles={["stake_president"]}>
            <PresidentDashboard />
          </SecureRolePage>
        }
      />

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

      <Route
        path="/president/endorsements"
        element={
          <SecureRolePage roles={["stake_president", "district_president"]}>
            <FinalEndorsementsPage />
          </SecureRolePage>
        }
      />

      <Route
        path="/president/endorsements/:applicationId"
        element={
          <SecureRolePage roles={["stake_president", "district_president"]}>
            <FinalEndorsementReviewPage />
          </SecureRolePage>
        }
      />

      <Route
        path="/president/candidates"
        element={
          <SecureRolePage roles={["stake_president", "district_president"]}>
            <LeaderCandidatesPage />
          </SecureRolePage>
        }
      />

      {/* LTC Admin routes */}
      <Route
        path="/admin/dashboard"
        element={
          <SecureRolePage roles={["ltc_admin", "super_admin"]}>
            <AdminDashboard />
          </SecureRolePage>
        }
      />

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
        path="/admin/applications"
        element={
          <SecureRolePage roles={["ltc_admin", "super_admin"]}>
            <AdminApplicationsPage />
          </SecureRolePage>
        }
      />

      <Route
        path="/admin/students"
        element={
          <SecureRolePage roles={["ltc_admin", "super_admin"]}>
            <AdmittedStudentsPage />
          </SecureRolePage>
        }
      />
      <Route
        path="/admin/rooms"
        element={
          <SecureRolePage roles={["ltc_admin", "super_admin"]}>
            <AdminRoomsPage />
          </SecureRolePage>
        }
      />

      {/* Super Admin */}
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

      {/* Not found */}
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
