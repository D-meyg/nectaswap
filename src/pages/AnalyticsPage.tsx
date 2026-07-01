import { useMemo, useState } from "react";
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
import { useAnalyticsOverview } from "@/hooks/queries/useAnalytics";

const CRYPTO_COLORS = ["#4E2BCC", "#06B6D4", "#00A63E", "#F7931A", "#E7000B", "#8B5CF6"];

const DATE_FILTERS: { label: string; period: string }[] = [
  { label: "Last 7 days",  period: "7d"  },
  { label: "Last 30 days", period: "30d" },
  { label: "Last 90 days", period: "90d" },
  { label: "Last year",    period: "1y"  },
];

function ChartTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: { name: string; value: number | string; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-(--color-border) rounded-(--radius-md) shadow-(--shadow-card) px-3 py-2 min-w-30">
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

function fmtCurrency(v: number | null | undefined): string {
  if (v == null || !Number.isFinite(v)) return "N/A";
  if (v >= 1_000_000_000) return `₦${(v / 1_000_000_000).toFixed(1)}B`;
  if (v >= 1_000_000) return `₦${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `₦${(v / 1_000).toFixed(1)}K`;
  return `₦${v.toLocaleString()}`;
}

function fmtNum(v: number | null | undefined): string {
  if (v == null || !Number.isFinite(v)) return "N/A";
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K`;
  return v.toLocaleString();
}

export default function AnalyticsPage() {
  usePageTitle(
    "Analytics Overview",
    "Comprehensive analytics dashboard with key performance metrics",
  );
  const [activeFilter, setActiveFilter] = useState(DATE_FILTERS[1]);
  const { data, refetch, isFetching } = useAnalyticsOverview(activeFilter.period);

  const revenueTransactionData = useMemo(
    () => (data?.volume_transaction_trends ?? []).map((t) => ({
      month: t.month,
      revenue: t.volume_ngn,
      transactions: t.transactions,
    })),
    [data],
  );

  const cryptoDistribution = useMemo(
    () => (data?.transactions_by_crypto ?? []).map((c, i) => ({
      name: c.name,
      value: c.count,
      color: CRYPTO_COLORS[i % CRYPTO_COLORS.length],
    })),
    [data],
  );

  const hourlyData = useMemo(
    () => (data?.hourly_transaction_activity ?? []).map((h) => ({
      hour: h.hour,
      txns: h.count,
    })),
    [data],
  );

  const cardStatusData = useMemo(() => {
    const map: Record<string, { type: string; active: number; pending: number; frozen: number }> = {};
    for (const entry of data?.card_status_distribution ?? []) {
      if (!map[entry.card_type]) {
        map[entry.card_type] = { type: entry.card_type, active: 0, pending: 0, frozen: 0 };
      }
      const status = entry.status.toLowerCase() as "active" | "pending" | "frozen";
      if (status in map[entry.card_type]) {
        map[entry.card_type][status] += entry.count;
      }
    }
    return Object.values(map);
  }, [data]);

  const kpis = data?.kpis;
  const bottomStats = data?.bottom_stats;

  return (
    <div className="p-6 space-y-5">
      {/* Toolbar */}
      <Row justify="between" align="center">
        <Row gap={2} align="center">
          <Button
            variant="secondary"
            size="sm"
            className="gap-1.5"
            onClick={() => refetch()}
          >
            <RefreshCw size={13} className={isFetching ? "animate-spin" : ""} />
            Refresh
          </Button>
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
          label="Total Volume (NGN)"
          value={fmtCurrency(kpis?.total_volume_ngn)}
          delta={kpis?.total_volume_ngn_change}
          deltaLabel="vs last period"
          status={kpis?.total_volume_ngn_change != null && kpis.total_volume_ngn_change >= 0 ? "success" : "warning"}
        />
        <StatCard
          label="Total Transactions"
          value={fmtNum(kpis?.total_transactions)}
          delta={kpis?.total_transactions_change}
          deltaLabel="vs last period"
          status="info"
        />
        <StatCard
          label="Active Users"
          value={fmtNum(kpis?.active_users)}
          delta={kpis?.active_users_change}
          deltaLabel="vs last period"
          status={kpis?.active_users_change != null && kpis.active_users_change >= 0 ? "success" : "warning"}
        />
        <StatCard
          label="Active Cards"
          value={fmtNum(kpis?.active_cards)}
          delta={kpis?.active_cards_change}
          deltaLabel="vs last period"
          status={kpis?.active_cards_change != null && kpis.active_cards_change >= 0 ? "success" : "warning"}
        />
      </Grid>

      {/* Revenue Trends + Crypto Distribution */}
      <div className="grid gap-4" style={{ gridTemplateColumns: "1.4fr 1fr" }}>
        <Card noPadding>
          <Card.Header
            title="Volume & Transaction Trends"
            subtitle="Monthly performance over the selected period"
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
                  tickFormatter={(v: number) =>
                    v >= 1_000_000 ? `₦${(v / 1_000_000).toFixed(1)}M` : `₦${(v / 1_000).toFixed(0)}K`
                  }
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
                  name="Volume (NGN)"
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
            {cryptoDistribution.length > 0 ? (
              <>
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
              </>
            ) : (
              <Text variant="caption" color="muted">No crypto data for this period</Text>
            )}
          </Card.Body>
        </Card>
      </div>

      {/* Hourly Activity + Card Status */}
      <Grid cols={2} gap={4}>
        <Card noPadding>
          <Card.Header
            title="Hourly Transaction Activity"
            subtitle="Transaction count by hour of day"
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
                  interval={3}
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
          value={fmtCurrency(bottomStats?.avg_transaction_ngn)}
          deltaLabel="per transaction"
        />
        <StatCard
          label="New Users"
          value={fmtNum(bottomStats?.new_users)}
          deltaLabel="in this period"
        />
        <StatCard
          label="Cards Issued"
          value={fmtNum(bottomStats?.cards_issued)}
          deltaLabel="in this period"
        />
        <StatCard
          label="Success Rate"
          value={bottomStats?.success_rate != null ? `${bottomStats.success_rate}%` : "N/A"}
          deltaLabel="of transactions"
          status={
            bottomStats?.success_rate != null && bottomStats.success_rate >= 90 ? "success" : "warning"
          }
        />
      </Grid>
    </div>
  );
}
