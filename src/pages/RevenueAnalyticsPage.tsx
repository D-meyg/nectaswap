import { useState } from "react";
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
import { useDashboardStats } from "@/hooks/queries/useDashboard";
import { useFeeRevenue } from "@/hooks/queries/useRates";

const revenuePerformanceData: { month: string; gross: number; net: number; fees: number }[] = [];
const dailyRevenueTrend: { day: number; value: number }[] = [];
const cryptoRevenue: { name: string; txns: number; revenue: string; fees: string; share: number; color: string }[] = [];
const feeBreakdown: { name: string; amount: string; share: number; color: string }[] = [];

const DATE_FILTERS = ["Last month", "Last 3 months", "Last 6 months", "Last 12 months", "Year to date"];

function ChartTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: { name: string; value: number | string; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-(--color-border) rounded-(--radius-md) shadow-(--shadow-card) px-3 py-2 min-w-[8.75rem]">
      <Text variant="micro" color="muted" className="mb-1 block">{label}</Text>
      {payload.map((p) => (
        <div key={String(p.name)} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full shrink-0" style={{ background: String(p.color) }} />
          <Text variant="micro" color="secondary" as="span">
            {p.name}:{" "}
            <span className="font-semibold text-(--color-text-primary)">
              {typeof p.value === "number" ? `₦${p.value}M` : p.value}
            </span>
          </Text>
        </div>
      ))}
    </div>
  );
}

export default function RevenueAnalyticsPage() {
  usePageTitle("Revenue Analytics", "Track revenue, fees, and financial performance over time");
  const [activeDate, setActiveDate] = useState("Last 12 months");
  const { data: dashboardStats = {} } = useDashboardStats();
  const { data: feeRevenue = {} } = useFeeRevenue();
  const stats = { ...(dashboardStats as Record<string, any>), ...(feeRevenue as Record<string, any>) };

  function fmtCur(v: unknown): string {
    if (v == null) return "N/A";
    const n = typeof v === "number" ? v : Number(String(v).replace(/[₦,\s]/g, ""));
    if (!Number.isFinite(n)) return "N/A";
    if (n >= 1_000_000_000) return `₦${(n / 1_000_000_000).toFixed(1)}B`;
    if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `₦${(n / 1_000).toFixed(1)}K`;
    return `₦${n.toLocaleString()}`;
  }

  const totalRevenue = stats.total_revenue ?? stats.totalRevenue ?? stats.revenue ?? stats.revenue_mtd ?? null;
  const netRevenue = stats.net_revenue ?? stats.netRevenue ?? null;
  const transactionFees = stats.revenue_24h ?? stats.transaction_fees ?? stats.transactionFees ?? stats.fees ?? null;
  const avgRevenueDay = stats.avg_revenue_per_day ?? stats.avgRevenuePerDay ?? stats.revenue_mtd ?? null;
  const revenuePerTransaction = stats.avg_fee_per_transaction ?? stats.revenue_per_transaction ?? stats.revenuePerTransaction ?? null;
  const growthRate = stats.growth_rate ?? stats.growthRate ?? null;
  const cardRevenue = stats.card_revenue ?? stats.cardRevenue ?? null;
  const feeMargin = stats.fee_margin ?? stats.feeMargin ?? null;

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

      {/* Top stat cards */}
      <Grid cols={4} gap={4}>
        <StatCard label="Total Revenue (MTD)"  value={fmtCur(totalRevenue)}      delta={18.5}  deltaLabel="vs last period" status="success" />
        <StatCard label="Net Revenue"          value={fmtCur(netRevenue)}         delta={14.3}  deltaLabel="vs last period" status="success" />
        <StatCard label="Revenue (24h)"        value={fmtCur(transactionFees)}    delta={17.8}  deltaLabel="vs yesterday"   status="info" />
        <StatCard label="Avg Revenue/Day"      value={fmtCur(avgRevenueDay)}      delta={-0.35} deltaLabel="vs last period" status="warning" />
      </Grid>

      {/* Revenue Performance Over Time */}
      <Card noPadding>
        <Card.Header title="Revenue Performance Over Time" subtitle="Gross, net revenue, and fees breakdown" />
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
              <YAxis tick={{ fontSize: 11, fill: "var(--color-text-muted)" }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `₦${v}M`} />
              <Tooltip content={<ChartTooltip />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              <Area type="monotone" dataKey="gross" name="Gross Revenue"  stroke="#4E2BCC" strokeWidth={2} fill="url(#gradGross)" dot={false} />
              <Area type="monotone" dataKey="net"   name="Net Revenue"    stroke="#06B6D4" strokeWidth={2} fill="url(#gradNet)"   dot={false} />
              <Area type="monotone" dataKey="fees"  name="Fees Collected" stroke="#00A63E" strokeWidth={2} fill="url(#gradFees)"  dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </Card.Body>
      </Card>

      {/* Revenue by Crypto + Fee Breakdown */}
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
                    <Text variant="micro" color="muted">Avg ₦X,XXX</Text>
                    <Text variant="micro" color="muted">Fees: {c.fees}</Text>
                  </Row>
                </Stack>
              ))}
            </Stack>
          </Card.Body>
        </Card>

        <Card noPadding>
          <Card.Header title="Fee Revenue Breakdown" subtitle="Revenue sources and distribution" />
          <Card.Body padded>
            <Stack gap={4}>
              {feeBreakdown.map((f) => (
                <Row key={f.name} justify="between" align="center">
                  <Text variant="caption" color="primary">{f.name}</Text>
                  <Row gap={3} align="center">
                    <div className="relative h-1.5 w-[7.5rem] bg-(--color-border) rounded-full overflow-hidden">
                      <div className="absolute left-0 top-0 h-full rounded-full" style={{ width: `${f.share}%`, background: f.color }} />
                    </div>
                    <Text variant="caption" color="primary" weight="semibold" className="w-10 text-right">{f.amount}</Text>
                    <Text variant="micro"   color="muted"                     className="w-10 text-right">{f.share}%</Text>
                  </Row>
                </Row>
              ))}
              {feeBreakdown.length === 0 && (
                <Text variant="caption" color="muted">No fee data available</Text>
              )}
              <div className="pt-2 border-t border-(--color-border) flex justify-between items-center">
                <Text variant="caption" color="primary" weight="medium">Total Fee Revenue</Text>
                <Text variant="caption" color="brand"   weight="semibold">{fmtCur(stats.total_fee_revenue ?? stats.totalFeeRevenue ?? null)}</Text>
              </div>
            </Stack>
          </Card.Body>
        </Card>
      </Grid>

      {/* Daily Revenue Trend */}
      <Card noPadding>
        <Card.Header title="Daily Revenue Trend (Last 30 Days)" subtitle="Daily performance vs target" />
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
              <YAxis tick={{ fontSize: 11, fill: "var(--color-text-muted)" }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `₦${v.toFixed(1)}M`} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="value" name="Revenue" stroke="#4E2BCC" strokeWidth={2} fill="url(#gradDaily)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </Card.Body>
      </Card>

      {/* Bottom stats */}
      <Grid cols={4} gap={4}>
        <StatCard label="Avg Fee / Transaction" value={fmtCur(revenuePerTransaction)} deltaLabel="Average fee per transaction" />
        <StatCard label="Growth Rate"           value={growthRate != null ? String(growthRate) : "N/A"} delta={growthRate != null ? 18.5 : undefined} deltaLabel="Month over month" />
        <StatCard label="Card Revenue"          value={fmtCur(cardRevenue)} delta={cardRevenue != null ? 8.4 : undefined} deltaLabel="From card services" />
        <StatCard label="Fee Margin"            value={feeMargin != null ? String(feeMargin) : "N/A"} deltaLabel="Average fee percentage" />
      </Grid>
    </div>
  );
}