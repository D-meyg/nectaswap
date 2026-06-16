/* eslint-disable @typescript-eslint/no-explicit-any */
import { Users, ArrowLeftRight, TrendingUp, CheckCircle } from "lucide-react";

import { usePageTitle } from "@/layouts/AppLayout";
import { StatCard } from "@/components/ui";
import { KYCReviewModal } from "@/components/modals/KYCReviewModal";
import { PriorityAlertBanner } from "@/features/dashboard/PriorityAlertBanner";
import { LiquiditySnapshot } from "@/features/dashboard/LiquiditySnapshot";
import { RecentConversions } from "@/features/dashboard/RecentConversions";
import { LiveAlerts } from "@/features/dashboard/LiveAlerts";
import { RecentActivity } from "@/features/dashboard/RecentActivity";
import { KYCReviewQueue } from "@/features/dashboard/KYCReviewQueue";
import { SystemHealthWidget } from "@/features/dashboard/SystemHealthWidget";
import { Box } from "@/components/ui/Box";
import { Stack } from "@/components/ui/Stack";
import { Grid } from "@/components/ui/Grid";

const MOCK_PRIORITY_ALERTS = [
  {
    id: "1",
    type: "danger",
    message: "BTC hot wallet balance below threshold (0.6 BTC remaining)",
  },
  {
    id: "2",
    type: "warning",
    message: "3 transactions stuck in pending for +2 hours",
  },
];

const MOCK_LIQUIDITY = [
  {
    asset: "USDT",
    balance: 1450000,
    usd_value: 1450000,
    threshold: 85,
    health: "HEALTHY",
  },
  {
    asset: "BTC",
    balance: 3.42,
    usd_value: 118400,
    threshold: 45,
    health: "LOW",
  },
  {
    asset: "ETH",
    balance: 124.5,
    usd_value: 285600,
    threshold: 92,
    health: "HEALTHY",
  },
  {
    asset: "USDC",
    balance: 45000,
    usd_value: 45000,
    threshold: 12,
    health: "CRITICAL",
  },
];

const MOCK_ALERTS = [
  {
    id: "1",
    type: "danger",
    title: "High API Latency",
    message: "Liquidity provider endpoints are responding > 2000ms",
    created_at: "2 mins ago",
  },
  {
    id: "2",
    type: "warning",
    title: "Unusual Volume Spike",
    message: "ETH/NGN pair experiencing 300% volume increase",
    created_at: "15 mins ago",
  },
  {
    id: "3",
    type: "info",
    title: "System Update Scheduled",
    message: "Maintenance window opens at 02:00 UTC",
    created_at: "1 hour ago",
  },
];

const MOCK_CONVERSIONS = [
  {
    id: "1",
    user: "johndoe@email.com",
    crypto: "BTC",
    amount_ngn: 2500000,
    status: "completed",
    time: "10:45 AM",
  },
  {
    id: "2",
    user: "alicesmith@email.com",
    crypto: "USDT",
    amount_ngn: 750000,
    status: "pending",
    time: "10:42 AM",
  },
  {
    id: "3",
    user: "bobjones@email.com",
    crypto: "ETH",
    amount_ngn: 1200000,
    status: "failed",
    time: "10:30 AM",
  },
  {
    id: "4",
    user: "sarahw@email.com",
    crypto: "USDC",
    amount_ngn: 500000,
    status: "completed",
    time: "10:15 AM",
  },
];

const MOCK_ACTIVITY = [
  {
    time: "10:42 AM",
    admin: "Super Admin",
    action: "Approved KYC",
    target: "Alice Smith",
  },
  {
    time: "10:15 AM",
    admin: "Support Lead",
    action: "Manual Override",
    target: "Transaction #9928",
  },
  {
    time: "09:30 AM",
    admin: "System",
    action: "Automated Sweep",
    target: "Hot Wallet → Cold",
  },
  {
    time: "09:00 AM",
    admin: "Risk Manager",
    action: "Flagged User",
    target: "Bob Jones",
  },
];

const MOCK_HEALTH = [
  { service: "Core Database", status: "operational", uptime: 99.99 },
  { service: "Liquidity API", status: "degraded", uptime: 98.45 },
  { service: "KYC Provider", status: "operational", uptime: 100 },
  { service: "Email Delivery", status: "operational", uptime: 99.95 },
];

const MOCK_KYC_QUEUE = [
  {
    id: "1",
    user_id: "u1",
    user_name: "Jonathan Doe",
    user_email: "j@e.com",
    tier: "Tier 3",
    submitted_at: "10 mins ago",
    documents: 3,
    total_docs: 3,
    priority: "normal",
    status: "pending",
  },
  {
    id: "2",
    user_id: "u2",
    user_name: "Mary Jane",
    user_email: "m@e.com",
    tier: "Tier 2",
    submitted_at: "45 mins ago",
    documents: 2,
    total_docs: 3,
    priority: "normal",
    status: "pending",
  },
  {
    id: "3",
    user_id: "u3",
    user_name: "Peter Parker",
    user_email: "p@e.com",
    tier: "Tier 3",
    submitted_at: "2 hours ago",
    documents: 3,
    total_docs: 3,
    priority: "high",
    status: "pending",
  },
  {
    id: "4",
    user_id: "u4",
    user_name: "Bruce Wayne",
    user_email: "b@e.com",
    tier: "Tier 2",
    submitted_at: "3 hours ago",
    documents: 1,
    total_docs: 3,
    priority: "normal",
    status: "pending",
  },
];

export default function DashboardPage() {
  usePageTitle(
    "Control Room",
    "Real-time operational awareness and platform health",
  );

  return (
    <Box p={6} className="max-w-[1600px] mx-auto w-full lg:p-8">
      <Stack gap={6}>
        <PriorityAlertBanner alerts={MOCK_PRIORITY_ALERTS as any} />

        <Grid cols={1} sm={2} lg={4} gap={6}>
          <StatCard
            label="24h Volume"
            value="₦45.2M"
            delta={12.5}
            deltaLabel="vs yesterday"
            icon={<TrendingUp size={20} />}
            status="success"
          />
          <StatCard
            label="Active Users"
            value="12,450"
            delta={5.2}
            deltaLabel="this week"
            icon={<Users size={20} />}
          />
          <StatCard
            label="Pending Transactions"
            value="142"
            icon={<ArrowLeftRight size={20} />}
            status="warning"
          />
          <StatCard
            label="Success Rate"
            value="98.4%"
            icon={<CheckCircle size={20} />}
            status="success"
          />
        </Grid>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <LiquiditySnapshot assets={MOCK_LIQUIDITY as any} />
          </div>
          <div>
            <LiveAlerts alerts={MOCK_ALERTS as any} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <RecentConversions conversions={MOCK_CONVERSIONS as any} />
          </div>
          <div>
            <RecentActivity entries={MOCK_ACTIVITY} />
          </div>
        </div>

        <Grid cols={1} lg={2} gap={6}>
          <KYCReviewQueue items={MOCK_KYC_QUEUE as any} />
          <SystemHealthWidget items={MOCK_HEALTH as any} />
        </Grid>

        <KYCReviewModal />
      </Stack>
    </Box>
  );
}
