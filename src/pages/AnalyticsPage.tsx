import { useState } from "react";
import { RefreshCw, SlidersHorizontal, Download } from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Grid } from "@/components/ui/Grid";
import { Row } from "@/components/ui/Row";
import { Text } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { usePageTitle } from "@/layouts/AppLayout";
import { useCardStats } from "@/hooks/queries/useCards";
import { useDashboardStats } from "@/hooks/queries/useDashboard";

const revenueTransactionData: { month: string; revenue: number; transactions: number }[] = [];
const cryptoDistribution: { name: string; value: number; color: string }[] = [];
const hourlyData: { hour: string; txns: number }[] = [];
const cardStatusData: { type: string; active: number; pending: number; frozen: number }[] = [];

const DATE_FILTERS = [
  "Last 7 days",
  "Last 30 days",
  "Last 90 days",
  "Last year",
];

function ChartTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: { name: string; value: number | string; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-(--color-border) rounded-(--radius-md) shadow-(--shadow-card) px-3 py-2 min-w-[7.5rem]">
      <Text variant="micro" color="muted" className="mb-1 block">
        {label}
      </Text>
      {payload.map((p) => (
        <div key={String(p.name)} className="flex items-center gap-2">
          <span
            className="h-2 w-2 rounded-full shrink-0"
            style={{ background: String(p.color) }}
          />
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

export default function AnalyticsPage() {
  usePageTitle(
    "Analytics Overview",
    "Comprehensive analytics dashboard with key performance metrics",
  );
  const [activeDate, setActiveDate] = useState("Last 30 days");
  const { data: dashboardStats = {} } = useDashboardStats();
  const { data: cardStats = {} } = useCardStats();
  const stats = dashboardStats as Record<string, any>;
  const cards = cardStats as Record<string, any>;

  function fmtCurrency(v: unknown): string {
    if (v == null) return "N/A";
    const n = typeof v === "number" ? v : Number(String(v).replace(/[₦,\s]/g, ""));
    if (!Number.isFinite(n)) return "N/A";
    if (n >= 1_000_000_000) return `₦${(n / 1_000_000_000).toFixed(1)}B`;
    if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `₦${(n / 1_000).toFixed(1)}K`;
    return `₦${n.toLocaleString()}`;
  }

  function fmtNum(v: unknown): string {
    if (v == null) return "N/A";
    const n = typeof v === "number" ? v : Number(String(v).replace(/[,\s]/g, ""));
    if (!Number.isFinite(n)) return "N/A";
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return n.toLocaleString();
  }

  const totalRevenue = stats.total_revenue ?? stats.totalRevenue ?? stats.revenue ?? null;
  const totalTransactions = stats.total_transactions ?? stats.totalTransactions ?? stats.transactions ?? null;
  const activeUsers = stats.active_users ?? stats.activeUsers ?? stats.users ?? null;
  const activeCards = cards.active_cards ?? cards.activeCards ?? cards.active ?? null;
  const avgTransaction = stats.average_transaction ?? stats.avgTransaction ?? null;
  const successRate = stats.success_rate ?? stats.successRate ?? null;

  return (
    <div className="p-6 space-y-5">
      {/* Toolbar */}
      <Row justify="between" align="center">
        <Row gap={2} align="center">
          <Button variant="secondary" size="sm" className="gap-1.5">
            <RefreshCw size={13} />
            Refresh
          </Button>
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
        </Row>
        <Row gap={2}>
          <Button variant="secondary" size="sm" className="gap-1.5">
            <SlidersHorizontal size={13} />
            Filters
          </Button>
          <Button variant="primary" size="sm" className="gap-1.5">
            <Download size={13} />
            Export Report
          </Button>
        </Row>
      </Row>

      {/* Stat Cards */}
      <Grid cols={4} gap={4}>
        <StatCard
          label="Total Revenue"
          value={fmtCurrency(totalRevenue)}
          delta={18.5}
          deltaLabel="vs last month"
          status="success"
        />
        <StatCard
          label="Total Transactions"
          value={fmtNum(totalTransactions)}
          delta={12.3}
          deltaLabel="vs last month"
          status="info"
        />
        <StatCard
          label="Active Users"
          value={fmtNum(activeUsers)}
          delta={9.7}
          deltaLabel="vs last month"
          status="success"
        />
        <StatCard
          label="Active Cards"
          value={fmtNum(activeCards)}
          delta={-5.4}
          deltaLabel="vs last month"
          status="warning"
        />
      </Grid>

      {/* Revenue Trends + Crypto Distribution */}
      <div className="grid gap-4" style={{ gridTemplateColumns: "1.4fr 1fr" }}>
        <Card noPadding>
          <Card.Header
            title="Revenue & Transaction Trends"
            subtitle="Monthly performance over the past year"
          />
          <Card.Body className="p-4">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart
                data={revenueTransactionData}
                margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4E2BCC" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#4E2BCC" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradTxns" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--color-border)"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: "var(--color-text-muted)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 11, fill: "var(--color-text-muted)" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => `₦${v}M`}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 11, fill: "var(--color-text-muted)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<ChartTooltip />} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 11 }}
                />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue"
                  stroke="#4E2BCC"
                  strokeWidth={2}
                  fill="url(#gradRevenue)"
                  dot={false}
                />
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="transactions"
                  name="Transactions"
                  stroke="#06B6D4"
                  strokeWidth={2}
                  fill="url(#gradTxns)"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card.Body>
        </Card>

        <Card noPadding>
          <Card.Header
            title="Transactions by Crypto"
            subtitle="Distribution across assets"
          />
          <Card.Body className="p-4">
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={cryptoDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {cryptoDistribution.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-2 space-y-1.5">
              {cryptoDistribution.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between"
                >
                  <Row gap={2} align="center">
                    <span
                      className="h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ background: item.color }}
                    />
                    <Text variant="caption" color="secondary">
                      {item.name}
                    </Text>
                  </Row>
                  <Text variant="caption" color="primary" weight="medium">
                    {item.value.toLocaleString()}
                  </Text>
                </div>
              ))}
            </div>
          </Card.Body>
        </Card>
      </div>

      {/* Hourly Activity + Card Status */}
      <Grid cols={2} gap={4}>
        <Card noPadding>
          <Card.Header
            title="Hourly Transaction Activity"
            subtitle="Transaction volume by hour (24h average)"
          />
          <Card.Body className="p-4">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart
                data={hourlyData}
                margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--color-border)"
                  vertical={false}
                />
                <XAxis
                  dataKey="hour"
                  tick={{ fontSize: 11, fill: "var(--color-text-muted)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "var(--color-text-muted)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<ChartTooltip />} />
                <Bar
                  dataKey="txns"
                  name="Transactions"
                  fill="#4E2BCC"
                  radius={[3, 3, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Card.Body>
        </Card>

        <Card noPadding>
          <Card.Header
            title="Card Status Distribution"
            subtitle="Active, pending, and frozen cards by type"
          />
          <Card.Body className="p-4">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart
                data={cardStatusData}
                margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--color-border)"
                  vertical={false}
                />
                <XAxis
                  dataKey="type"
                  tick={{ fontSize: 11, fill: "var(--color-text-muted)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "var(--color-text-muted)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<ChartTooltip />} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 11 }}
                />
                <Bar
                  dataKey="active"
                  name="Active"
                  fill="#00A63E"
                  radius={[3, 3, 0, 0]}
                />
                <Bar
                  dataKey="pending"
                  name="Pending"
                  fill="#F7931A"
                  radius={[3, 3, 0, 0]}
                />
                <Bar
                  dataKey="frozen"
                  name="Frozen"
                  fill="#E7000B"
                  radius={[3, 3, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Card.Body>
        </Card>
      </Grid>

      {/* Bottom stat row */}
      <Grid cols={4} gap={4}>
        <StatCard
          label="Avg Transaction"
          value={fmtCurrency(avgTransaction)}
          delta={5.3}
          deltaLabel="vs last period"
        />
        <StatCard
          label="Total Users"
          value={fmtNum(stats.new_users ?? stats.newUsers ?? stats.total_users ?? null)}
          delta={12.8}
          deltaLabel="this month"
        />
        <StatCard
          label="Cards Issued"
          value={fmtNum(cards.issued_cards ?? cards.issuedCards ?? cards.total_cards ?? null)}
          delta={8.4}
          deltaLabel="this month"
        />
        <StatCard
          label="Success Rate"
          value={successRate != null ? String(successRate) : "N/A"}
          delta={0.3}
          deltaLabel="improved"
        />
      </Grid>
    </div>
  );
}
