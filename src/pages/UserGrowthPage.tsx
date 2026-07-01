import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import {
  ComposedChart, Area, BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { Grid } from "@/components/ui/Grid";
import { Stack } from "@/components/ui/Stack";
import { Row } from "@/components/ui/Row";
import { Text } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { DataTable } from "@/components/tables/DataTable";
import { usePageTitle } from "@/layouts/AppLayout";
import { useAnalyticsUserGrowth } from "@/hooks/queries/useAnalytics";

const KYC_COLORS = ["#4E2BCC", "#06B6D4", "#00A63E", "#F7931A"];
const CHANNEL_COLORS = ["#4E2BCC", "#06B6D4", "#00A63E", "#F7931A", "#E7000B"];

// ── Cohort table ──────────────────────────────────────────

type CohortRow = {
  cohort: string;
  m0: number;
  m1: number | null;
  m2: number | null;
  m3: number | null;
  m4: number | null;
};

function CohortBadge({ value }: { value: number | null }) {
  if (value === null) return <span className="text-(--color-text-muted) text-xs">—</span>;
  const bg =
    value >= 80 ? "rgba(78,43,204,0.85)" :
    value >= 60 ? "rgba(78,43,204,0.55)" :
    value >= 40 ? "rgba(78,43,204,0.30)" :
                  "rgba(78,43,204,0.12)";
  return (
    <span
      className="inline-block px-2.5 py-0.5 rounded text-xs font-medium text-white"
      style={{ background: bg }}
    >
      {value}%
    </span>
  );
}

const cohortColumns: ColumnDef<CohortRow, unknown>[] = [
  {
    accessorKey: "cohort",
    header: "Cohort",
    cell: ({ getValue }) => (
      <Text variant="caption" color="primary" weight="medium">{String(getValue())}</Text>
    ),
  },
  { accessorKey: "m0", header: "Month 0", cell: ({ getValue }) => <CohortBadge value={getValue() as number} /> },
  { accessorKey: "m1", header: "Month 1", cell: ({ getValue }) => <CohortBadge value={getValue() as number | null} /> },
  { accessorKey: "m2", header: "Month 2", cell: ({ getValue }) => <CohortBadge value={getValue() as number | null} /> },
  { accessorKey: "m3", header: "Month 3", cell: ({ getValue }) => <CohortBadge value={getValue() as number | null} /> },
  { accessorKey: "m4", header: "Month 4", cell: ({ getValue }) => <CohortBadge value={getValue() as number | null} /> },
];

// ── Chart Tooltip ─────────────────────────────────────────

function ChartTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: { name: string; value: number | string; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-(--color-border) rounded-(--radius-md) shadow-(--shadow-card) px-3 py-2 min-w-32">
      <Text variant="micro" color="muted" className="mb-1 block">{label}</Text>
      {payload.map((p) => (
        <div key={String(p.name)} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full shrink-0" style={{ background: String(p.color) }} />
          <Text variant="micro" color="secondary" as="span">
            {p.name}:{" "}
            <span className="font-semibold text-(--color-text-primary)">
              {typeof p.value === "number" ? p.value.toLocaleString() : p.value}
            </span>
          </Text>
        </div>
      ))}
    </div>
  );
}

const DATE_FILTERS: { label: string; period: string }[] = [
  { label: "Last month",     period: "1m"  },
  { label: "Last 3 months",  period: "3m"  },
  { label: "Last 6 months",  period: "6m"  },
  { label: "Last 12 months", period: "12m" },
  { label: "All time",       period: "all" },
];

// ── Page ──────────────────────────────────────────────────

export default function UserGrowthPage() {
  usePageTitle("User Growth Analytics", "Analyse user acquisition, retention, and growth trends");
  const [activeFilter, setActiveFilter] = useState(DATE_FILTERS[3]);
  const { data } = useAnalyticsUserGrowth(activeFilter.period);

  const kpis = data?.kpis;
  const bottomStats = data?.bottom_stats;

  const growthTrendData = useMemo(
    () => (data?.user_growth_trends ?? []).map((t) => ({
      month: t.month,
      totalUsers: t.total_users,
      newUsers: t.new_users,
      activeUsers: t.active_users,
    })),
    [data],
  );

  const usersByRegion = useMemo(
    () => data?.users_by_region ?? [],
    [data],
  );
  const maxRegionCount = useMemo(
    () => Math.max(1, ...usersByRegion.map((r) => r.count)),
    [usersByRegion],
  );

  const kycDistribution = useMemo(
    () => (data?.kyc_level_distribution ?? []).map((k, i) => ({
      name: k.level,
      value: k.count,
      share: k.percentage,
      color: KYC_COLORS[i % KYC_COLORS.length],
    })),
    [data],
  );

  const weeklyActivityData = useMemo(
    () => data?.weekly_user_activity ?? [],
    [data],
  );

  const acquisitionChannels = useMemo(
    () => (data?.user_acquisition_channels ?? []).map((c, i) => ({
      name: c.channel,
      users: c.count,
      share: c.percentage,
      cac: c.cac > 0 ? `₦${c.cac.toLocaleString()}` : "Free",
      color: CHANNEL_COLORS[i % CHANNEL_COLORS.length],
    })),
    [data],
  );

  const cohortData = useMemo<CohortRow[]>(
    () => (data?.cohort_retention ?? []).map((c) => ({
      cohort: c.cohort,
      m0: c.month_0,
      m1: c.month_1 ?? null,
      m2: c.month_2 ?? null,
      m3: c.month_3 ?? null,
      m4: c.month_4 ?? null,
    })),
    [data],
  );

  return (
    <div className="p-6 space-y-5">
      {/* Toolbar */}
      <Row justify="between" align="center">
        <div className="flex items-center border border-(--color-border) rounded-(--radius-sm) overflow-hidden">
          {DATE_FILTERS.map((f) => (
            <button
              key={f.period}
              onClick={() => setActiveFilter(f)}
              className={`px-3 py-1.5 text-xs font-medium border-r border-(--color-border) last:border-r-0 transition-colors ${
                activeFilter.period === f.period
                  ? "bg-(--color-brand) text-white"
                  : "bg-white text-(--color-text-secondary) hover:bg-(--color-bg-subtle)"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <Row gap={2}>
          <Button variant="secondary" size="sm">Custom Range</Button>
          <Button variant="primary" size="sm" className="gap-1.5">
            <Download size={13} />
            Export
          </Button>
        </Row>
      </Row>

      {/* Top stats */}
      <Grid cols={4} gap={4}>
        <StatCard
          label="Total Users"
          value={kpis?.total_users?.toLocaleString() ?? "N/A"}
          delta={kpis?.total_users_change}
          deltaLabel="vs last period"
          status="success"
        />
        <StatCard
          label="New Users"
          value={kpis?.new_users?.toLocaleString() ?? "N/A"}
          delta={kpis?.new_users_change}
          deltaLabel="vs last period"
          status={kpis?.new_users_change != null && kpis.new_users_change >= 0 ? "success" : "warning"}
        />
        <StatCard
          label="Active Users"
          value={kpis?.active_users?.toLocaleString() ?? "N/A"}
          delta={kpis?.active_users_change}
          deltaLabel="vs last period"
          status="info"
        />
        <StatCard
          label="Churn Rate"
          value={kpis?.churn_rate != null ? `${kpis.churn_rate}%` : "N/A"}
          deltaLabel="of users churned"
          status="danger"
        />
      </Grid>

      {/* Growth & Activity Trends */}
      <Card noPadding>
        <Card.Header title="User Growth & Activity Trends" subtitle="New user acquisition, active users, and total user base" />
        <Card.Body className="p-4">
          <ResponsiveContainer width="100%" height={260}>
            <ComposedChart data={growthTrendData} margin={{ top: 5, right: 20, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="gradTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#4E2BCC" stopOpacity={0.10} />
                  <stop offset="95%" stopColor="#4E2BCC" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradActive" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#06B6D4" stopOpacity={0.10} />
                  <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--color-text-muted)" }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="users" tick={{ fontSize: 11, fill: "var(--color-text-muted)" }} axisLine={false} tickLine={false} tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)} />
              <YAxis yAxisId="new"   orientation="right" tick={{ fontSize: 11, fill: "var(--color-text-muted)" }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              <Area  yAxisId="users" type="monotone" dataKey="totalUsers"  name="Total Users"  stroke="#4E2BCC" strokeWidth={2} fill="url(#gradTotal)"  dot={false} />
              <Area  yAxisId="users" type="monotone" dataKey="activeUsers" name="Active Users" stroke="#06B6D4" strokeWidth={2} fill="url(#gradActive)" dot={false} />
              <Area  yAxisId="new"   type="monotone" dataKey="newUsers"    name="New Users"    stroke="#00A63E" strokeWidth={2} fill="none"              dot={false} />
              <Bar   yAxisId="new"   dataKey="newUsers" name="New (bars)" fill="#00C950" opacity={0.25} radius={[2, 2, 0, 0]} />
            </ComposedChart>
          </ResponsiveContainer>
        </Card.Body>
      </Card>

      {/* Users by Region + KYC Distribution */}
      <Grid cols={2} gap={4}>
        <Card noPadding>
          <Card.Header title="Users by Region" subtitle="Geographic distribution" />
          <Card.Body padded>
            <Stack gap={3}>
              {usersByRegion.length === 0 && (
                <Text variant="caption" color="muted">No region data available</Text>
              )}
              {usersByRegion.map((r) => (
                <Stack key={r.region} gap={1}>
                  <Row justify="between" align="center">
                    <Text variant="caption" color="primary">{r.region}</Text>
                    <Row gap={3} align="center">
                      <Text variant="caption" color="primary" weight="medium">{r.count.toLocaleString()}</Text>
                      <Text variant="micro" color="muted">{r.percentage}%</Text>
                    </Row>
                  </Row>
                  <div className="relative h-1.5 w-full bg-(--color-border) rounded-full overflow-hidden">
                    <div
                      className="absolute left-0 top-0 h-full bg-(--color-brand) rounded-full"
                      style={{ width: `${(r.count / maxRegionCount) * 100}%` }}
                    />
                  </div>
                </Stack>
              ))}
            </Stack>
          </Card.Body>
        </Card>

        <Card noPadding>
          <Card.Header title="KYC Level Distribution" subtitle="Verified users across KYC levels" />
          <Card.Body className="p-4">
            {kycDistribution.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={kycDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={2} dataKey="value">
                      {kycDistribution.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-2 space-y-1.5">
                  {kycDistribution.map((item) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <Row gap={2} align="center">
                        <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: item.color }} />
                        <Text variant="caption" color="secondary">{item.name}</Text>
                      </Row>
                      <Row gap={3}>
                        <Text variant="caption" color="primary" weight="medium">{item.value.toLocaleString()}</Text>
                        <Text variant="micro"   color="muted">{item.share}%</Text>
                      </Row>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <Text variant="caption" color="muted">No KYC data available</Text>
            )}
          </Card.Body>
        </Card>
      </Grid>

      {/* Weekly Activity + Acquisition Channels */}
      <Grid cols={2} gap={4}>
        <Card noPadding>
          <Card.Header title="Weekly User Activity" subtitle="Active vs inactive users by day" />
          <Card.Body className="p-4">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weeklyActivityData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--color-text-muted)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--color-text-muted)" }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="active"   name="Active"   stackId="a" fill="#4E2BCC" />
                <Bar dataKey="inactive" name="Inactive" stackId="a" fill="#06B6D4" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card.Body>
        </Card>

        <Card noPadding>
          <Card.Header title="User Acquisition Channels" subtitle="Source performance and CAC" />
          <Card.Body padded>
            <Stack gap={3}>
              {acquisitionChannels.length === 0 && (
                <Text variant="caption" color="muted">No acquisition data available</Text>
              )}
              {acquisitionChannels.map((c) => (
                <Stack key={c.name} gap={1}>
                  <Row justify="between" align="center">
                    <Row gap={2} align="center">
                      <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: c.color }} />
                      <Text variant="caption" color="primary">{c.name}</Text>
                    </Row>
                    <Row gap={3} align="center">
                      <Text variant="caption" color="primary" weight="medium">{c.users.toLocaleString()}</Text>
                      <Text variant="micro"   color="muted" className="w-10 text-right">{c.share}%</Text>
                    </Row>
                  </Row>
                  <div className="flex items-center gap-2">
                    <div className="relative h-1 flex-1 bg-(--color-border) rounded-full overflow-hidden">
                      <div className="absolute left-0 top-0 h-full rounded-full" style={{ width: `${c.share}%`, background: c.color }} />
                    </div>
                    <Text variant="micro" color="muted" className="shrink-0">CAC: {c.cac}</Text>
                  </div>
                </Stack>
              ))}
            </Stack>
          </Card.Body>
        </Card>
      </Grid>

      {/* Retention Cohort */}
      <Card noPadding>
        <Card.Header title="User Retention Cohort Analysis" subtitle="Percentage of users still active after signup" />
        <DataTable
          data={cohortData}
          columns={cohortColumns}
          emptyTitle="No cohort data"
        />
      </Card>

      {/* Bottom stats */}
      <Grid cols={4} gap={4}>
        <StatCard
          label="Avg Lifetime Value"
          value={bottomStats?.avg_lifetime_value != null ? `₦${bottomStats.avg_lifetime_value.toLocaleString()}` : "N/A"}
          deltaLabel="per user"
        />
        <StatCard
          label="Avg CAC"
          value={bottomStats?.avg_cac != null ? `₦${bottomStats.avg_cac.toLocaleString()}` : "N/A"}
          deltaLabel="cost to acquire"
        />
        <StatCard
          label="Mobile Users"
          value={bottomStats?.mobile_users_pct != null ? `${bottomStats.mobile_users_pct}%` : "N/A"}
          deltaLabel="access via mobile"
        />
        <StatCard
          label="30-Day Retention"
          value={bottomStats?.retention_30d != null ? `${bottomStats.retention_30d}%` : "N/A"}
          deltaLabel="still active after 30 days"
          status={bottomStats?.retention_30d != null && bottomStats.retention_30d > 0 ? "success" : "warning"}
        />
      </Grid>
    </div>
  );
}
