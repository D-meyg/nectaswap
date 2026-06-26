/* eslint-disable react-refresh/only-export-components */
import { createBrowserRouter, Navigate } from "react-router-dom";
import { lazy } from "react";
import { AppLayout } from "@/layouts/AppLayout";
import { AuthGuard, GuestGuard } from "@/components/common/Guards";

const DashboardPage = lazy(() => import("@/pages/DashboardPage"));
const UsersPage = lazy(() => import("@/pages/UsersPage"));
const UserDetailPage = lazy(() => import("@/pages/UserDetailPage"));
const TransactionsPage = lazy(() => import("@/pages/TransactionsPage"));
const KYCPage = lazy(() => import("@/pages/KYCPage"));
const UserActivityPage = lazy(() => import("@/pages/UserActivityPage"));
const TransactionDetailPage = lazy(
  () => import("@/pages/TransactionDetailPage"),
);

const CardManagementPage = lazy(() => import("@/pages/CardManagementPage"));
const CardDetailPage = lazy(() => import("@/pages/CardDetailPage"));
const WalletsPage = lazy(() => import("@/pages/WalletsPage"));
const CompliancePage = lazy(() => import("@/pages/CompliancePage"));
const RatesPage = lazy(() => import("@/pages/RatesPage"));
const ReferralProgramPage = lazy(() => import("@/pages/ReferralProgramPage"));
const NotificationsPage = lazy(() => import("@/pages/NotificationsPage"));
const SettingsPage = lazy(() => import("@/pages/SettingsPage"));
const AdminUsersPage = lazy(() => import("@/pages/AdminUsersPage"));
const APIKeysPage = lazy(() => import("@/pages/APIKeysPage"));
const AuditLogsPage = lazy(() => import("@/pages/AuditLogsPage"));
const LoginPage = lazy(() => import("@/pages/LoginPage"));
const AnalyticsPage = lazy(() => import("@/pages/AnalyticsPage"));

const RevenueAnalyticsPage = lazy(() => import("@/pages/RevenueAnalyticsPage"));
const UserGrowthPage = lazy(() => import("@/pages/UserGrowthPage"));

export const router = createBrowserRouter([
  {
    element: <AuthGuard />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: "/", element: <DashboardPage /> },
          { path: "/users", element: <UsersPage /> },
          { path: "/users/:id", element: <UserDetailPage /> },
          { path: "/transactions", element: <TransactionsPage /> },
          { path: "/transactions/pending", element: <TransactionsPage /> },
          { path: "/transactions/failed", element: <TransactionsPage /> },
          { path: "/transactions/:id", element: <TransactionDetailPage /> },
          { path: "/cards", element: <CardManagementPage /> },
          { path: "/cards/:id", element: <CardDetailPage /> },
          { path: "/wallets", element: <WalletsPage /> },
          { path: "/compliance", element: <CompliancePage /> },
          { path: "/compliance/flagged", element: <CompliancePage /> },
          { path: "/compliance/aml", element: <CompliancePage /> },
          { path: "/rates", element: <RatesPage /> },
          { path: "/referrals", element: <ReferralProgramPage /> },
          { path: "/referrals/payouts", element: <ReferralProgramPage /> },
          { path: "/notifications", element: <NotificationsPage /> },
          { path: "/settings", element: <SettingsPage /> },
          { path: "/settings/admins", element: <AdminUsersPage /> },
          { path: "/settings/api-keys", element: <APIKeysPage /> },
          { path: "/settings/audit-logs", element: <AuditLogsPage /> },
          { path: "/kyc", element: <KYCPage /> },
          { path: "/users/activity", element: <UserActivityPage /> },
          { path: "/analytics", element: <AnalyticsPage /> },
          { path: "/analytics/revenue", element: <RevenueAnalyticsPage /> },
          { path: "/analytics/growth", element: <UserGrowthPage /> },
        ],
      },
    ],
  },
  {
    element: <GuestGuard />,
    children: [{ path: "/login", element: <LoginPage /> }],
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);
