import { useState } from "react";
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
import { useDashboardStats } from "@/hooks/queries/useDashboard";

// ── Data ─────────────────────────────────────────────────

const growthTrendData: { month: string; totalUsers: number; newUsers: number; activeUsers: number }[] = [];
const usersByRegion: { region: string; users: number; growth: number; color: string }[] = [];
const maxRegion = 1;
const kycDistribution: { name: string; value: number; share: number; color: string }[] = [];
const weeklyActivityData: { day: string; active: number; inactive: number }[] = [];
const acquisitionChannels: { name: string; users: number; share: number; cac: string; color: string }[] = [];

// ── Cohort table data + columns ───────────────────────────

type CohortRow = {
  cohort: string;
  m0: number;
  m1: number | null;
  m2: number | null;
  m3: number | null;
  m4: number | null;
  m5: number | null;
  m6: number | null;
};

const cohortData: CohortRow[] = [];

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
  { accessorKey: "m5", header: "Month 5", cell: ({ getValue }) => <CohortBadge value={getValue() as number | null} /> },
  { accessorKey: "m6", header: "Month 6", cell: ({ getValue }) => <CohortBadge value={getValue() as number | null} /> },
];

// ── Chart Tooltip ─────────────────────────────────────────

function ChartTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: { name: string; value: number | string; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-(--color-border) rounded-(--radius-md) shadow-(--shadow-card) px-3 py-2 min-w-[8.125rem]">
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

const DATE_FILTERS = ["Last month", "Last 6 weeks", "Last 6 months", "Last 12 months", "All time"];

// ── Page ──────────────────────────────────────────────────

export default function UserGrowthPage() {
  usePageTitle("User Growth Analytics", "Analyse user acquisition, retention, and growth trends");
  const [activeDate, setActiveDate] = useState("Last 12 months");
  const { data: dashboardStats = {} } = useDashboardStats();
  const stats = dashboardStats as Record<string, any>;

  const totalUsers = stats.total_users ?? stats.totalUsers ?? null;
  const newUsers = stats.new_users ?? stats.newUsers ?? null;
  const activeUsers = stats.active_users ?? stats.activeUsers ?? null;
  const churnRate = stats.churn_rate ?? stats.churnRate ?? null;

  return (
    <div className="p-6 space-y-5">
      {/* Toolbar */}
      <Row justify="between" align="center">
        <div className="flex items-center border border-(--color-border) rounded-(--radius-sm) overflow-hidden">
          {DATE_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setActiveDate(f)}
              className={`px-3 py-1.5 text-xs font-medium border-r border-(--color-border) last:border-r-0 transition-colors ${
                activeDate === f
                  ? "bg-(--color-brand) text-white"
                  : "bg-white text-(--color-text-secondary) hover:bg-(--color-bg-subtle)"
              }`}
            >
              {f}
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
        <StatCard label="Total Users"  value={totalUsers != null ? String(totalUsers) : "N/A"} delta={9.5}  deltaLabel="vs last month"      status="success" />
        <StatCard label="New Users"    value={newUsers != null ? String(newUsers) : "N/A"}  delta={13.8} deltaLabel="this month"         status="success" />
        <StatCard label="Active Users" value={activeUsers != null ? String(activeUsers) : "N/A"}  delta={3.9}  deltaLabel="vs last 6 months"   status="info" />
        <StatCard label="Churn Rate"   value={churnRate != null ? String(churnRate) : "N/A"}  delta={-4.4} deltaLabel="improved"           status="danger" />
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
          <Card.Header title="Users by Region" subtitle="Geographic distribution across Nigeria" />
          <Card.Body padded>
            <Stack gap={3}>
              {usersByRegion.map((r) => (
                <Stack key={r.region} gap={1}>
                  <Row justify="between" align="center">
                    <Text variant="caption" color="primary">{r.region}</Text>
                    <Row gap={3} align="center">
                      <Text variant="caption" color="primary" weight="medium">{r.users.toLocaleString()}</Text>
                      <span className={`text-[0.6875rem] font-medium ${r.growth > 0 ? "text-(--color-success-mid)" : "text-(--color-danger)"}`}>
                        {r.growth > 0 ? "+" : ""}{r.growth}%
                      </span>
                    </Row>
                  </Row>
                  <div className="relative h-1.5 w-full bg-(--color-border) rounded-full overflow-hidden">
                    <div className="absolute left-0 top-0 h-full bg-(--color-brand) rounded-full" style={{ width: `${(r.users / maxRegion) * 100}%` }} />
                  </div>
                </Stack>
              ))}
            </Stack>
          </Card.Body>
        </Card>

        <Card noPadding>
          <Card.Header title="KYC Level Distribution" subtitle="Verified users across KYC levels" />
          <Card.Body className="p-4">
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
                <YAxis tick={{ fontSize: 11, fill: "var(--color-text-muted)" }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} />
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

      {/* Retention Cohort — uses DataTable */}
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
        <StatCard label="Avg Lifetime Value" value="N/A" deltaLabel="Per user" />
        <StatCard label="Avg CAC"            value="N/A" deltaLabel="Cost to acquire" />
        <StatCard label="Mobile Users"       value="N/A" deltaLabel="Access via mobile" />
        <StatCard label="30-Day Retention"   value="N/A" deltaLabel="Still active after 30 days" />
      </Grid>
    </div>
  );
}