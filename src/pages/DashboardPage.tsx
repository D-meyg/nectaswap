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
import {
  useDashboardStats,
  useDashboardLiquidity,
  useDashboardAlerts,
  useDashboardRecentConversions,
  useDashboardRecentActivity,
  useDashboardKYCQueue,
  useSystemHealth,
} from "@/hooks/queries/useDashboard";

export default function DashboardPage() {
  usePageTitle(
    "Control Room",
    "Real-time operational awareness and platform health",
  );

  const { data: stats = {} } = useDashboardStats();
  const { data: liquidity = [] } = useDashboardLiquidity();
  const { data: alerts = [] } = useDashboardAlerts(5);
  const { data: conversions = [] } = useDashboardRecentConversions(10);
  const { data: activity = [] } = useDashboardRecentActivity(10);
  const { data: kycQueue = [] } = useDashboardKYCQueue(10);
  const { data: health = [] } = useSystemHealth();

 

  return (
    <Box p={6} className="max-w-400 mx-auto w-full lg:p-8">
      <Stack gap={6}>
        <PriorityAlertBanner alerts={alerts as any} />

        <Grid cols={1} sm={2} lg={4} gap={6}>
          <StatCard
            label="24h Volume"
            value={
              (stats as any).volume_24h ??
              (stats as any).total_volume_24h ??
              "—"
            }
            delta={(stats as any).volume_change}
            deltaLabel="vs yesterday"
            icon={<TrendingUp size={20} />}
            status="success"
          />
          <StatCard
            label="Active Users"
            value={(stats as any).active_users ?? (stats as any).users ?? "—"}
            delta={(stats as any).users_change}
            deltaLabel="this week"
            icon={<Users size={20} />}
          />
          <StatCard
            label="Pending Transactions"
            value={
              (stats as any).pending_transactions ??
              (stats as any).pending_txns ??
              "—"
            }
            icon={<ArrowLeftRight size={20} />}
            status="warning"
          />
          <StatCard
            label="Success Rate"
            value={(stats as any).success_rate ?? "—"}
            icon={<CheckCircle size={20} />}
            status="success"
          />
        </Grid>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <LiquiditySnapshot assets={liquidity as any} />
          </div>
          <div>
            <LiveAlerts alerts={alerts as any} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <RecentConversions conversions={conversions as any} />
          </div>
          <div>
            <RecentActivity entries={activity as any} />
          </div>
        </div>

        <Grid cols={1} lg={2} gap={6}>
          <KYCReviewQueue items={kycQueue as any} />
          <SystemHealthWidget items={health as any} />
        </Grid>

        <KYCReviewModal />
      </Stack>
    </Box>
  );
}
