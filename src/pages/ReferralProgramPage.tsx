/* eslint-disable @typescript-eslint/no-explicit-any */
import { usePageTitle } from "@/layouts/AppLayout";
import { useState, useMemo } from "react";
import { Download, Settings, Eye } from "lucide-react";

import { StatCard } from "@/components/ui/StatCard";
import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { Row } from "@/components/ui/Row";
import { Stack } from "@/components/ui/Stack";
import { Box } from "@/components/ui/Box";
import { Button } from "@/components/ui/Button";
import { CodeBadge } from "@/components/ui/CodeBadge";
import { DataTable } from "@/components/tables/DataTable";
import { SearchInput } from "@/components/forms/SearchInput";
import { useDebounce } from "@/hooks/ui/useDebounce";
import { useReferralStats, useReferrers, useReferredUsers } from "@/hooks/queries/useReferrals";
import type { ColumnDef } from "@tanstack/react-table";

type Referrer = Record<string, any>;
type ReferredUser = Record<string, any>;
type TabValue = "referrers" | "referred";

function toNumber(value: unknown) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function text(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function ReferrerStatus({ status }: { status: string }) {
  return (
    <Text
      variant="caption"
      weight="medium"
      color={status === "Active" ? "success" : "danger"}
    >
      {status}
    </Text>
  );
}

function fmt(value: unknown): string {
  const n = toNumber(value);
  if (n >= 1_000_000_000) return `₦${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `₦${(n / 1_000).toFixed(1)}K`;
  return `₦${n.toLocaleString()}`;
}

export default function ReferralProgramPage() {
  usePageTitle(
    "Referral Program",
    "Referral program monitoring and commission management",
  );

  const [tab, setTab] = useState<TabValue>("referrers");
  const [search, setSearch] = useState("");
  const debounced = useDebounce(search, 400);
  const { data: stats = {} } = useReferralStats();
  const { data: apiReferrers = [], isLoading: loadingReferrers } = useReferrers();
  const { data: apiReferred = [], isLoading: loadingReferred } = useReferredUsers();
  const referrers = useMemo(
    () =>
      (Array.isArray(apiReferrers) ? apiReferrers : []).map((item) => {
        const r = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
        return {
          name: text(r.name ?? r.full_name ?? r.user_name, "N/A"),
          email: text(r.email, "N/A"),
          referral_code: text(r.referral_code ?? r.code, "N/A"),
          total_referrals: Number(r.total_referrals ?? r.total ?? 0),
          active_referrals: Number(r.active_referrals ?? r.active ?? 0),
          total_earnings: Number(r.total_earnings ?? r.earnings ?? 0),
          pending_earnings: Number(r.pending_earnings ?? r.pending ?? 0),
          status: text(r.status, "Active"),
        };
      }),
    [apiReferrers],
  ) as Referrer[];

  const referredUsers = useMemo(
    () =>
      (Array.isArray(apiReferred) ? apiReferred : []).map((item) => {
        const r = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
        const userField = r.user;
        const userFromField =
          typeof userField === "string"
            ? userField
            : userField && typeof userField === "object"
              ? text((userField as Record<string, unknown>).name ?? (userField as Record<string, unknown>).full_name, "")
              : "";
        return {
          name: text(r.name ?? r.full_name ?? r.user_name, "") || userFromField || "N/A",
          email: text(r.email, "N/A"),
          referred_by: text(r.referred_by ?? r.referrer_name, "N/A"),
          referral_code: text(r.referral_code ?? r.ref_code, "N/A"),
          commission_earned: Number(r.commission_earned ?? r.commission ?? 0),
          user_volume: Number(r.user_volume ?? r.volume ?? 0),
          first_tx_date: text(r.first_tx_date ?? r.first_tx, "N/A"),
          status: text(r.status, "Active"),
        };
      }),
    [apiReferred],
  ) as ReferredUser[];

  const filteredReferrers = useMemo(
    () =>
      referrers.filter(
        (r) =>
          !debounced ||
          text(r.name).toLowerCase().includes(debounced.toLowerCase()) ||
          text(r.referral_code).toLowerCase().includes(debounced.toLowerCase()),
      ),
    [referrers, debounced],
  );

  const filteredReferred = useMemo(
    () =>
      referredUsers.filter(
        (r) =>
          !debounced ||
          text(r.name).toLowerCase().includes(debounced.toLowerCase()) ||
          text(r.referred_by).toLowerCase().includes(debounced.toLowerCase()),
      ),
    [referredUsers, debounced],
  );

  // ── Referrers columns ───────────────────────────────────
  const referrerCols = useMemo<ColumnDef<Referrer, unknown>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Referrer",
        cell: ({ row }) => (
          <Stack gap={0}>
            <Text variant="caption" color="primary" weight="semibold" as="p">
              {row.original.name}
            </Text>
            <Text variant="micro" color="muted" as="p">
              {row.original.email}
            </Text>
          </Stack>
        ),
      },
      {
        accessorKey: "referral_code",
        header: "Referral Code",
        cell: ({ getValue }) => <CodeBadge code={getValue<string>()} />,
      },
      {
        accessorKey: "total_referrals",
        header: "Total Referrals",
        cell: ({ getValue }) => (
          <Text variant="caption" color="primary" weight="semibold">
            {getValue<number>()}
          </Text>
        ),
      },
      {
        accessorKey: "active_referrals",
        header: "Active",
        cell: ({ getValue }) => (
          <Text variant="caption" color="success" weight="semibold">
            {getValue<number>()}
          </Text>
        ),
      },
      {
        accessorKey: "total_earnings",
        header: "Total Earnings",
        cell: ({ getValue }) => (
          <Text variant="caption" color="primary" weight="semibold">
            {fmt(getValue<number>())}
          </Text>
        ),
      },
      {
        accessorKey: "pending_earnings",
        header: "Pending",
        cell: ({ getValue }) => (
          <Text
            variant="caption"
            weight="semibold"
            className="text-(--color-warning-dark)"
          >
            {fmt(getValue<number>())}
          </Text>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => <ReferrerStatus status={getValue<string>()} />,
      },
      {
        id: "actions",
        header: "Actions",
        cell: () => (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 flex items-center justify-center"
          >
            <Eye size={14} className="text-(--color-text-muted)" />
          </Button>
        ),
      },
    ],
    [],
  );

  // ── Referred Users columns ──────────────────────────────
  const referredCols = useMemo<ColumnDef<ReferredUser, unknown>[]>(
    () => [
      {
        accessorKey: "name",
        header: "User",
        cell: ({ row }) => (
          <Stack gap={0}>
            <Text variant="caption" color="primary" weight="semibold" as="p">
              {row.original.name}
            </Text>
            <Text variant="micro" color="muted" as="p">
              {row.original.email}
            </Text>
          </Stack>
        ),
      },
      {
        accessorKey: "referred_by",
        header: "Referred By",
        cell: ({ row }) => (
          <Stack gap={0}>
            <Text variant="caption" color="primary" weight="medium" as="p">
              {row.original.referred_by}
            </Text>
            <Text variant="micro" color="muted" as="p">
              {row.original.referral_code}
            </Text>
          </Stack>
        ),
      },
      {
        accessorKey: "commission_earned",
        header: "Commission Earned",
        cell: ({ getValue }) => (
          <Text variant="caption" color="success" weight="semibold">
            {fmt(getValue<number>())}
          </Text>
        ),
      },
      {
        accessorKey: "user_volume",
        header: "User Volume",
        cell: ({ getValue }) => (
          <Text variant="caption" color="primary" weight="medium">
            {fmt(getValue<number>())}
          </Text>
        ),
      },
      {
        accessorKey: "first_tx_date",
        header: "First TX Date",
        cell: ({ getValue }) => (
          <Text variant="caption" color="secondary">
            {getValue<string>()}
          </Text>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => <ReferrerStatus status={getValue<string>()} />,
      },
    ],
    [],
  );

  const totalEarnings = (stats as any).earnings_paid ?? referrers.reduce((s, r) => s + toNumber(r.total_earnings), 0);
  const totalPending = (stats as any).pending_payouts ?? referrers.reduce((s, r) => s + toNumber(r.pending_earnings), 0);
  const avgReferrals = toNumber((stats as any).avg_referrals ?? (referrers.reduce((s, r) => s + toNumber(r.total_referrals), 0) / Math.max(referrers.length, 1))).toFixed(1);

  return (
    <Box p={6} className="space-y-5">
      {/* 6 stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
        <StatCard label="Total Referrers" value={(stats as any).total_referrers ?? referrers.length} />
        <StatCard
          label="Referred Users"
          value={(stats as any).referred_users ?? referredUsers.length}
        />
        <StatCard
          label="Earnings Paid"
          value={fmt(totalEarnings)}
          status="success"
        />
        <StatCard
          label="Pending Payouts"
          value={fmt(totalPending)}
          status="warning"
        />
        <StatCard label="Avg Referrals" value={avgReferrals} />
        <StatCard label="Conversion Rate" value={(stats as any).conversion_rate ?? "N/A"} />
      </div>

      <Card noPadding>
        {/* Toggle tabs */}
        <Box px={5} py={4} className="border-b border-(--color-border)">
          <Row gap={2} align="center">
            {(["referrers", "referred"] as TabValue[]).map((t) => {
              const label =
                t === "referrers"
                  ? `Referrers (${referrers.length})`
                  : `Referred Users (${referredUsers.length})`;
              return (
                <button
                  key={t}
                  onClick={() => {
                    setTab(t);
                    setSearch("");
                  }}
                  className={[
                    "inline-flex items-center px-4 py-2 rounded-(--radius-sm)",
                    "text-[0.8125rem] font-medium transition-colors",
                    tab === t
                      ? "bg-(--color-brand) text-white"
                      : "bg-(--color-bg-subtle) text-(--color-text-secondary) hover:text-(--color-text-primary)",
                  ].join(" ")}
                >
                  {label}
                </button>
              );
            })}
          </Row>
        </Box>

        {/* Toolbar */}
        <Box px={5} py={3} className="border-b border-(--color-border)">
          <Row justify="between" align="center" gap={3}>
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder={
                tab === "referrers"
                  ? "Search referrers..."
                  : "Search referred users..."
              }
              className="max-w-80 flex-1"
            />
            <Row gap={2} align="center">
              <Button variant="secondary" size="sm">
                <Download size={13} />
                Export Report
              </Button>
              <Button size="sm">
                <Settings size={13} />
                Program Settings
              </Button>
            </Row>
          </Row>
        </Box>

        {/* DataTable — swaps based on active tab */}
        {tab === "referrers" ? (
          <DataTable
            data={filteredReferrers}
            columns={referrerCols}
            total={filteredReferrers.length}
            loading={loadingReferrers}
            emptyTitle="No referrers found"
            emptyMessage="Try adjusting your search"
          />
        ) : (
          <DataTable
            data={filteredReferred}
            columns={referredCols}
            total={filteredReferred.length}
            loading={loadingReferred}
            emptyTitle="No referred users found"
            emptyMessage="Try adjusting your search"
          />
        )}
      </Card>
    </Box>
  );
}
