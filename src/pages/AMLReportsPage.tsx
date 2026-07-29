import { useMemo, useState } from "react";
import { formatDate } from "@/lib/date";
import {
  FolderOpen,
  Users,
  Receipt,
  AlertCircle,
  CheckCircle2,
  Clock,
  Upload,
  Calendar,
  ShieldAlert,
} from "lucide-react";
import type { ReactNode } from "react";

import { usePageActions, usePageTitle } from "@/layouts/AppLayout";
import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { Row } from "@/components/ui/Row";
import { Stack } from "@/components/ui/Stack";
import { Box } from "@/components/ui/Box";
import { Button } from "@/components/ui/Button";
import { FilterButton } from "@/components/ui/FilterButton";
import { SearchInput } from "@/components/forms/SearchInput";
import { EmptyState } from "@/components/ui/EmptyState";
import { DataTable } from "@/components/tables/DataTable";
import { RiskPill, CaseStatusPill, type RiskLevel } from "@/components/compliance/CompliancePills";
import { useAmlStats, useAmlRecentActivity } from "@/hooks/queries/useCompliance";
import type { ColumnDef } from "@tanstack/react-table";

// ── Helpers ───────────────────────────────────────────────
function num(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value ?? 0);
  return Number.isFinite(n) ? n : 0;
}

function str(value: unknown, fallback = ""): string {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function normSeverity(value: unknown): RiskLevel {
  const v = String(value ?? "").toLowerCase();
  if (v.includes("crit")) return "Critical";
  if (v.includes("high")) return "High";
  if (v.includes("med")) return "Medium";
  return "Low";
}

// ── Stats shape (from /compliance/aml/stats) ──────────────
interface AmlStats {
  open_cases: number;
  flagged_users: number;
  flagged_transactions: number;
  high_risk_accounts: number;
  cases_closed_today: number;
  pending_reviews: number;
  risk_distribution: { low: number; medium: number; high: number; critical: number; total: number };
}

function normalizeStats(raw: unknown): AmlStats {
  const s = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const rd = s.risk_distribution && typeof s.risk_distribution === "object"
    ? (s.risk_distribution as Record<string, unknown>)
    : {};
  return {
    open_cases: num(s.open_cases),
    flagged_users: num(s.flagged_users),
    flagged_transactions: num(s.flagged_transactions),
    high_risk_accounts: num(s.high_risk_accounts),
    cases_closed_today: num(s.cases_closed_today),
    pending_reviews: num(s.pending_reviews),
    risk_distribution: {
      low: num(rd.low),
      medium: num(rd.medium),
      high: num(rd.high),
      critical: num(rd.critical),
      total: num(rd.total),
    },
  };
}

// ── Recent activity (shape unconfirmed — defensive) ───────
interface SuspiciousItem {
  id: string;
  title: string;
  user: string;
  age: string;
  severity: RiskLevel;
}

function normalizeActivity(raw: unknown, index: number): SuspiciousItem {
  const a = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const user = a.user && typeof a.user === "object"
    ? str((a.user as Record<string, unknown>).name ?? (a.user as Record<string, unknown>).full_name)
    : str(a.user ?? a.user_name ?? a.username);
  return {
    id: str(a.id ?? a.activity_id, `act-${index}`),
    title: str(a.title ?? a.type ?? a.activity_type ?? a.trigger ?? a.name, "Suspicious Activity"),
    user: user || "—",
    age: str(a.age ?? a.time_ago ?? a.created_at ?? a.timestamp ?? a.date, ""),
    severity: normSeverity(a.severity ?? a.risk ?? a.risk_level),
  };
}

// ── Stat card (no fabricated deltas — API doesn't return them) ──
function AmlStatCard({
  label,
  value,
  icon,
  loading,
}: {
  label: string;
  value: number;
  icon: ReactNode;
  loading: boolean;
}) {
  return (
    <Box className="rounded-lg border border-(--color-border) bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
      <Row justify="between" align="center" className="mb-2.5">
        <Text variant="caption" color="secondary" weight="medium" className="text-[0.75rem]">{label}</Text>
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-(--color-bg-subtle) text-(--color-text-secondary)">{icon}</span>
      </Row>
      {loading ? (
        <div className="h-8 w-16 animate-pulse rounded bg-(--color-border)" />
      ) : (
        <Text variant="display" color="primary" weight="semibold" as="p" className="text-[1.625rem] leading-8">
          {value.toLocaleString()}
        </Text>
      )}
    </Box>
  );
}

function SuspiciousCard({ item }: { item: SuspiciousItem }) {
  return (
    <Box className="rounded-lg border border-(--color-border) px-4 py-3">
      <Row justify="between" align="start" className="mb-1">
        <Text variant="caption" color="primary" weight="semibold" className="text-[0.75rem]">{item.title}</Text>
        <RiskPill level={item.severity} />
      </Row>
      <Text variant="micro" color="secondary" className="text-[0.6875rem]" as="p">{item.user}</Text>
      <Row justify="between" align="center" className="mt-2">
        <Text variant="micro" color="muted" className="text-[0.625rem]">{formatDate(item.age)}</Text>
        <button type="button" className="font-geom text-[0.6875rem] font-semibold text-(--color-brand) transition-opacity hover:opacity-75 focus:outline-none">
          View Investigation
        </button>
      </Row>
    </Box>
  );
}

// Recent AML Alerts table row (no confirmed endpoint yet — renders empty)
interface AmlAlertRow {
  id: string;
  user_name: string;
  user_email: string;
  trigger: string;
  risk: RiskLevel;
  amount: string;
  date: string;
  status: "Open" | "Escalated" | "Under Review" | "Closed";
  officer: string;
}

export default function AMLReportsPage() {
  usePageTitle(
    "AML Reports",
    "Monitor suspicious activities, AML investigations, and regulatory compliance",
  );

  const [search, setSearch] = useState("");
  const { data: rawStats, isLoading: statsLoading } = useAmlStats();
  const { data: rawActivity = [], isLoading: activityLoading } = useAmlRecentActivity(4);

  usePageActions(
    useMemo(
      () => (
        <Button size="sm">
          <Upload size={13} />
          Export Report
        </Button>
      ),
      [],
    ),
  );

  const stats = useMemo(() => normalizeStats(rawStats), [rawStats]);

  const statCards = useMemo(
    () => [
      { label: "Open AML Cases", value: stats.open_cases, icon: <FolderOpen size={15} /> },
      { label: "Flagged Users", value: stats.flagged_users, icon: <Users size={15} /> },
      { label: "Flagged Transactions", value: stats.flagged_transactions, icon: <Receipt size={15} /> },
      { label: "High Risk Accounts", value: stats.high_risk_accounts, icon: <AlertCircle size={15} /> },
      { label: "Cases Closed Today", value: stats.cases_closed_today, icon: <CheckCircle2 size={15} /> },
      { label: "Pending Reviews", value: stats.pending_reviews, icon: <Clock size={15} /> },
    ],
    [stats],
  );

  const rd = stats.risk_distribution;
  const riskRows = useMemo(
    () => [
      { label: "Low Risk", count: rd.low, color: "var(--color-success-mid)" },
      { label: "Medium Risk", count: rd.medium, color: "var(--color-warning)" },
      { label: "High Risk", count: rd.high, color: "var(--color-danger)" },
      { label: "Critical", count: rd.critical, color: "var(--color-brand)" },
    ],
    [rd],
  );

  const activity = useMemo(
    () => (Array.isArray(rawActivity) ? rawActivity.map(normalizeActivity) : []),
    [rawActivity],
  );

  const alertColumns = useMemo<ColumnDef<AmlAlertRow, unknown>[]>(
    () => [
      { accessorKey: "id", header: "Alert ID", enableSorting: false, cell: ({ getValue }) => (<Text variant="caption" color="primary" weight="semibold">{getValue<string>()}</Text>) },
      {
        accessorKey: "user_name",
        header: "User",
        enableSorting: false,
        cell: ({ row }) => (
          <Stack gap={0}>
            <Text variant="caption" color="primary" weight="medium" as="p">{row.original.user_name}</Text>
            <Text variant="micro" color="muted" as="p">{row.original.user_email}</Text>
          </Stack>
        ),
      },
      { accessorKey: "trigger", header: "Trigger", enableSorting: false, cell: ({ getValue }) => (<Text variant="caption" color="secondary">{getValue<string>()}</Text>) },
      { accessorKey: "risk", header: "Risk Level", enableSorting: false, cell: ({ getValue }) => (<RiskPill level={getValue<RiskLevel>()} />) },
      { accessorKey: "amount", header: "Transaction Amount", enableSorting: false, cell: ({ getValue }) => (<Text variant="caption" color="primary" weight="semibold">{getValue<string>()}</Text>) },
      { accessorKey: "date", header: "Date", enableSorting: false, cell: ({ getValue }) => (<Text variant="caption" color="secondary">{getValue<string>()}</Text>) },
      { accessorKey: "status", header: "Status", enableSorting: false, cell: ({ getValue }) => (<CaseStatusPill status={getValue<AmlAlertRow["status"]>()} />) },
      { accessorKey: "officer", header: "Assigned Officer", enableSorting: false, cell: ({ getValue }) => (<Text variant="caption" color="secondary">{getValue<string>()}</Text>) },
    ],
    [],
  );

  const alertRows: AmlAlertRow[] = [];

  return (
    <Box p={6} className="space-y-5">
      {/* 6 stat cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {statCards.map((s) => (
          <AmlStatCard key={s.label} label={s.label} value={s.value} icon={s.icon} loading={statsLoading} />
        ))}
      </div>

      {/* Risk Distribution + Recent Suspicious Activity */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="self-start">
          <Card.Header title="Risk Distribution" className="border-b-0 px-5 pb-1 pt-4 [&_h4]:text-[0.8125rem] [&_h4]:leading-5" />
          <Card.Body className="px-5 pb-5 pt-2">
            <Stack gap={4}>
              {riskRows.map((row) => {
                const pct = rd.total > 0 ? Math.round((row.count / rd.total) * 100) : 0;
                return (
                  <Box key={row.label}>
                    <Row justify="between" align="center" className="mb-1.5">
                      <Row gap={2} align="center">
                        <span className="h-2 w-2 rounded-full" style={{ background: row.color }} />
                        <Text variant="caption" color="secondary" className="text-[0.75rem]">{row.label}</Text>
                      </Row>
                      <Row gap={2} align="center">
                        <Text variant="caption" color="primary" weight="semibold" className="text-[0.75rem]">{row.count.toLocaleString()}</Text>
                        <Text variant="micro" color="muted" className="text-[0.625rem]">{pct}%</Text>
                      </Row>
                    </Row>
                    <div className="h-1 w-full overflow-hidden rounded-full bg-(--color-border)">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: row.color }} />
                    </div>
                  </Box>
                );
              })}
            </Stack>
            <Row justify="between" align="center" className="mt-5 border-t border-(--color-border) pt-4">
              <Text variant="caption" color="secondary" weight="medium">Total Cases</Text>
              <Text variant="subtitle" color="primary" weight="semibold">{rd.total.toLocaleString()}</Text>
            </Row>
          </Card.Body>
        </Card>

        <Card className="lg:col-span-2 self-start">
          <Card.Header title="Recent Suspicious Activity" className="border-b-0 px-5 pb-1 pt-4 [&_h4]:text-[0.8125rem] [&_h4]:leading-5" />
          <Card.Body className="px-5 pb-5 pt-2">
            {activityLoading ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-20 animate-pulse rounded-lg bg-(--color-border)" />
                ))}
              </div>
            ) : activity.length === 0 ? (
              <EmptyState icon={ShieldAlert} title="No recent activity" description="Suspicious activity will appear here as it is detected." />
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {activity.map((item) => (
                  <SuspiciousCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </Card.Body>
        </Card>
      </div>

      {/* Recent AML Alerts (endpoint pending — empty state) */}
      <Card noPadding>
        <Box px={5} py={4} className="border-b border-(--color-border)">
          <Text variant="subtitle" color="primary" weight="semibold" as="p">Recent AML Alerts</Text>
          <Text variant="micro" color="muted" as="p">{alertRows.length} alerts found</Text>
        </Box>
        <Box px={5} py={3} className="border-b border-(--color-border)">
          <Row justify="between" align="center" gap={3}>
            <Row gap={3} align="center" className="flex-1">
              <SearchInput value={search} onChange={setSearch} placeholder="Search by alert ID, user..." className="h-9 w-full max-w-[22rem]" />
              <FilterButton label="Date Range" icon={<Calendar size={13} />} className="h-9" />
            </Row>
            <Button variant="secondary" size="sm" className="h-9 px-3 text-[0.6875rem]">
              <Upload size={13} />
              Export
            </Button>
          </Row>
        </Box>
        <DataTable
          data={alertRows}
          columns={alertColumns}
          emptyTitle="No AML alerts"
          emptyMessage="Alerts will appear here once the alerts endpoint is available."
        />
      </Card>
    </Box>
  );
}
