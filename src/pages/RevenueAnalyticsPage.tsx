import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from "recharts";
import { Grid } from "@/components/ui/Grid";
import { Stack } from "@/components/ui/Stack";
import { Row } from "@/components/ui/Row";
import { Text } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { usePageTitle } from "@/layouts/AppLayout";
import { useAnalyticsRevenue } from "@/hooks/queries/useAnalytics";

const COIN_COLORS = ["#4E2BCC", "#06B6D4", "#00A63E", "#F7931A", "#E7000B", "#8B5CF6"];

const DATE_FILTERS: { label: string; period: string }[] = [
  { label: "Last month",     period: "1m"  },
  { label: "Last 3 months",  period: "3m"  },
  { label: "Last 6 months",  period: "6m"  },
  { label: "Last 12 months", period: "12m" },
  { label: "Year to date",   period: "ytd" },
];

function ChartTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: { name: string; value: number | string; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-(--color-border) rounded-(--radius-md) shadow-(--shadow-card) px-3 py-2 min-w-35">
      <Text variant="micro" color="muted" className="mb-1 block">{label}</Text>
      {payload.map((p) => (
        <div key={String(p.name)} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full shrink-0" style={{ background: String(p.color) }} />
          <Text variant="micro" color="secondary" as="span">
            {p.name}:{" "}
            <span className="font-semibold text-(--color-text-primary)">
              {typeof p.value === "number" ? `₦${(p.value / 1_000).toFixed(1)}K` : p.value}
            </span>
          </Text>
        </div>
      ))}
    </div>
  );
}

function fmtCur(v: number | null | undefined): string {
  if (v == null || !Number.isFinite(v)) return "N/A";
  if (v >= 1_000_000_000) return `₦${(v / 1_000_000_000).toFixed(1)}B`;
  if (v >= 1_000_000) return `₦${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `₦${(v / 1_000).toFixed(1)}K`;
  return `₦${v.toLocaleString()}`;
}

export default function RevenueAnalyticsPage() {
  usePageTitle("Revenue Analytics", "Track revenue, fees, and financial performance over time");
  const [activeFilter, setActiveFilter] = useState(DATE_FILTERS[3]);
  const { data } = useAnalyticsRevenue(activeFilter.period);

  const kpis = data?.kpis;

  const revenuePerformanceData = useMemo(
    () => (data?.volume_over_time ?? []).map((m) => ({
      month: m.month,
      gross: m.volume_ngn,
      net: m.volume_ngn - m.fees,
      fees: m.fees,
    })),
    [data],
  );

  const dailyRevenueTrend = useMemo(
    () => (data?.daily_volume_last_30 ?? []).map((d) => ({
      day: d.date.slice(5),
      value: d.volume_ngn,
    })),
    [data],
  );

  const cryptoRevenue = useMemo(
    () => (data?.crypto_volume?.by_coin ?? []).map((c, i) => ({
      name: c.name,
      txns: c.transaction_count,
      revenue: fmtCur(c.volume_ngn),
      fees: fmtCur(c.fees_ngn),
      share: c.percentage,
      color: COIN_COLORS[i % COIN_COLORS.length],
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

      {/* Top stat cards */}
      <Grid cols={4} gap={4}>
        <StatCard
          label="Total Volume (NGN)"
          value={fmtCur(kpis?.total_volume_ngn)}
          delta={kpis?.total_volume_ngn_change}
          deltaLabel="vs last period"
          status={kpis?.total_volume_ngn_change != null && kpis.total_volume_ngn_change >= 0 ? "success" : "warning"}
        />
        <StatCard
          label="Total Fees Collected"
          value={fmtCur(kpis?.total_fees_collected)}
          delta={kpis?.fees_change}
          deltaLabel="vs last period"
          status={kpis?.fees_change != null && kpis.fees_change >= 0 ? "success" : "warning"}
        />
        <StatCard
          label="Total Transactions"
          value={kpis?.total_transactions?.toLocaleString() ?? "N/A"}
          delta={kpis?.total_transactions_change}
          deltaLabel="vs last period"
          status="info"
        />
        <StatCard
          label="Avg Volume / Day"
          value={fmtCur(kpis?.avg_volume_per_day)}
          deltaLabel="daily average"
        />
      </Grid>

      {/* Revenue Performance Over Time */}
      <Card noPadding>
        <Card.Header title="Revenue Performance Over Time" subtitle="Gross volume, net volume, and fees breakdown" />
        <Card.Body className="p-4">
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={revenuePerformanceData} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gradGross" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#4E2BCC" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#4E2BCC" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradNet" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#06B6D4" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradFees" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#00A63E" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#00A63E" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--color-text-muted)" }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 11, fill: "var(--color-text-muted)" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) =>
                  v >= 1_000_000 ? `₦${(v / 1_000_000).toFixed(1)}M` : `₦${(v / 1_000).toFixed(0)}K`
                }
              />
              <Tooltip content={<ChartTooltip />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              <Area type="monotone" dataKey="gross" name="Gross Volume"   stroke="#4E2BCC" strokeWidth={2} fill="url(#gradGross)" dot={false} />
              <Area type="monotone" dataKey="net"   name="Net Volume"     stroke="#06B6D4" strokeWidth={2} fill="url(#gradNet)"   dot={false} />
              <Area type="monotone" dataKey="fees"  name="Fees Collected" stroke="#00A63E" strokeWidth={2} fill="url(#gradFees)"  dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </Card.Body>
      </Card>

      {/* Revenue by Crypto + Platform Stats */}
      <Grid cols={2} gap={4}>
        <Card noPadding>
          <Card.Header title="Revenue by Cryptocurrency" subtitle="Asset performance breakdown" />
          <Card.Body padded>
            <Stack gap={4}>
              {cryptoRevenue.length === 0 && (
                <Text variant="caption" color="muted">No crypto revenue data available</Text>
              )}
              {cryptoRevenue.map((c) => (
                <Stack key={c.name} gap={1}>
                  <Row justify="between" align="center">
                    <Row gap={2} align="center">
                      <span className="h-3 w-3 rounded-full shrink-0" style={{ background: c.color }} />
                      <Text variant="caption" color="primary" weight="medium">{c.name}</Text>
                    </Row>
                    <Row gap={4} align="center">
                      <Text variant="micro" color="muted">{c.txns.toLocaleString()} txns</Text>
                      <Text variant="caption" color="primary" weight="semibold">{c.revenue}</Text>
                    </Row>
                  </Row>
                  <div className="relative h-1.5 w-full bg-(--color-border) rounded-full overflow-hidden">
                    <div className="absolute left-0 top-0 h-full rounded-full" style={{ width: `${c.share}%`, background: c.color }} />
                  </div>
                  <Row justify="between">
                    <Text variant="micro" color="muted">{c.share}% of volume</Text>
                    <Text variant="micro" color="muted">Fees: {c.fees}</Text>
                  </Row>
                </Stack>
              ))}
            </Stack>
          </Card.Body>
        </Card>

        <Card noPadding>
          <Card.Header title="Platform Stats" subtitle="Card and balance overview" />
          <Card.Body padded>
            <Stack gap={4}>
              <Row justify="between" align="center">
                <Text variant="caption" color="secondary">Platform NGN Balance</Text>
                <Text variant="caption" color="primary" weight="semibold">{fmtCur(kpis?.platform_ngn_balance)}</Text>
              </Row>
              <Row justify="between" align="center">
                <Text variant="caption" color="secondary">Card Volume</Text>
                <Text variant="caption" color="primary" weight="semibold">{fmtCur(data?.card_stats?.total_volume)}</Text>
              </Row>
              <Row justify="between" align="center">
                <Text variant="caption" color="secondary">Card Fees</Text>
                <Text variant="caption" color="primary" weight="semibold">{fmtCur(data?.card_stats?.total_fees)}</Text>
              </Row>
              <Row justify="between" align="center">
                <Text variant="caption" color="secondary">Card Transactions</Text>
                <Text variant="caption" color="primary" weight="semibold">{data?.card_stats?.total_transactions?.toLocaleString() ?? "N/A"}</Text>
              </Row>
              <div className="pt-2 border-t border-(--color-border) flex justify-between items-center">
                <Text variant="caption" color="primary" weight="medium">Success Rate</Text>
                <Text variant="caption" color="brand" weight="semibold">{kpis?.success_rate != null ? `${kpis.success_rate}%` : "N/A"}</Text>
              </div>
            </Stack>
          </Card.Body>
        </Card>
      </Grid>

      {/* Daily Revenue Trend */}
      <Card noPadding>
        <Card.Header title="Daily Volume Trend (Last 30 Days)" subtitle="Daily NGN volume performance" />
        <Card.Body className="p-4">
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={dailyRevenueTrend} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gradDaily" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#4E2BCC" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#4E2BCC" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--color-text-muted)" }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 11, fill: "var(--color-text-muted)" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) =>
                  v >= 1_000_000 ? `₦${(v / 1_000_000).toFixed(1)}M` : `₦${(v / 1_000).toFixed(0)}K`
                }
              />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="value" name="Volume" stroke="#4E2BCC" strokeWidth={2} fill="url(#gradDaily)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </Card.Body>
      </Card>

      {/* Bottom stats */}
      <Grid cols={4} gap={4}>
        <StatCard label="Total Volume (USD)" value={kpis?.total_volume_usd != null ? `$${kpis.total_volume_usd.toLocaleString()}` : "N/A"} deltaLabel="USD equivalent" />
        <StatCard label="Total Transactions"  value={kpis?.total_transactions?.toLocaleString() ?? "N/A"} deltaLabel="in selected period" />
        <StatCard label="Platform Balance"    value={fmtCur(kpis?.platform_ngn_balance)} deltaLabel="current NGN balance" />
        <StatCard label="Success Rate"        value={kpis?.success_rate != null ? `${kpis.success_rate}%` : "N/A"} deltaLabel="transaction success" status={kpis?.success_rate != null && kpis.success_rate >= 90 ? "success" : "warning"} />
      </Grid>
    </div>
  );
}
