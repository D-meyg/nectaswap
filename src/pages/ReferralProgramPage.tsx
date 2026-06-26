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
import { DUMMY_REFERRERS, DUMMY_REFERRED_USERS_FULL } from "@/lib/dummyData";
import type { ColumnDef } from "@tanstack/react-table";

type Referrer = (typeof DUMMY_REFERRERS)[0];
type ReferredUser = (typeof DUMMY_REFERRED_USERS_FULL)[0];
type TabValue = "referrers" | "referred";

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

function fmt(n: number) {
  return `₦ ${n.toLocaleString()}`;
}

export default function ReferralProgramPage() {
  usePageTitle(
    "Referral Program",
    "Referral program monitoring and commission management",
  );

  const [tab, setTab] = useState<TabValue>("referrers");
  const [search, setSearch] = useState("");
  const debounced = useDebounce(search, 400);

  const filteredReferrers = useMemo(
    () =>
      DUMMY_REFERRERS.filter(
        (r) =>
          !debounced ||
          r.name.toLowerCase().includes(debounced.toLowerCase()) ||
          r.code.toLowerCase().includes(debounced.toLowerCase()),
      ),
    [debounced],
  );

  const filteredReferred = useMemo(
    () =>
      DUMMY_REFERRED_USERS_FULL.filter(
        (r) =>
          !debounced ||
          r.name.toLowerCase().includes(debounced.toLowerCase()) ||
          r.referred_by.toLowerCase().includes(debounced.toLowerCase()),
      ),
    [debounced],
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
        accessorKey: "code",
        header: "Referral Code",
        cell: ({ getValue }) => <CodeBadge code={getValue<string>()} />,
      },
      {
        accessorKey: "total",
        header: "Total Referrals",
        cell: ({ getValue }) => (
          <Text variant="caption" color="primary" weight="semibold">
            {getValue<number>()}
          </Text>
        ),
      },
      {
        accessorKey: "active",
        header: "Active",
        cell: ({ getValue }) => (
          <Text variant="caption" color="success" weight="semibold">
            {getValue<number>()}
          </Text>
        ),
      },
      {
        accessorKey: "earnings",
        header: "Total Earnings",
        cell: ({ getValue }) => (
          <Text variant="caption" color="primary" weight="semibold">
            {fmt(getValue<number>())}
          </Text>
        ),
      },
      {
        accessorKey: "pending",
        header: "Pending",
        cell: ({ getValue }) => (
          <Text
            variant="caption"
            weight="semibold"
            className="text-[var(--color-warning-dark)]"
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
            <Eye size={14} className="text-[var(--color-text-muted)]" />
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
              {row.original.ref_code}
            </Text>
          </Stack>
        ),
      },
      {
        accessorKey: "commission",
        header: "Commission Earned",
        cell: ({ getValue }) => (
          <Text variant="caption" color="success" weight="semibold">
            {fmt(getValue<number>())}
          </Text>
        ),
      },
      {
        accessorKey: "volume",
        header: "User Volume",
        cell: ({ getValue }) => (
          <Text variant="caption" color="primary" weight="medium">
            {fmt(getValue<number>())}
          </Text>
        ),
      },
      {
        accessorKey: "first_tx",
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

  const totalEarnings = DUMMY_REFERRERS.reduce((s, r) => s + r.earnings, 0);
  const totalPending = DUMMY_REFERRERS.reduce((s, r) => s + r.pending, 0);
  const avgReferrals = (
    DUMMY_REFERRERS.reduce((s, r) => s + r.total, 0) / DUMMY_REFERRERS.length
  ).toFixed(1);

  return (
    <Box p={6} className="space-y-5">
      {/* 6 stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
        <StatCard label="Total Referrers" value={DUMMY_REFERRERS.length} />
        <StatCard
          label="Referred Users"
          value={DUMMY_REFERRED_USERS_FULL.length}
        />
        <StatCard
          label="Earnings Paid"
          value={`₦ ${(totalEarnings / 1_000_000).toFixed(1)}M`}
          status="success"
        />
        <StatCard
          label="Pending Payouts"
          value={`₦ ${(totalPending / 1000).toFixed(0)}K`}
          status="warning"
        />
        <StatCard label="Avg Referrals" value={avgReferrals} />
        <StatCard label="Conversion Rate" value="85.2%" />
      </div>

      <Card noPadding>
        {/* Toggle tabs */}
        <Box px={5} py={4} className="border-b border-[var(--color-border)]">
          <Row gap={2} align="center">
            {(["referrers", "referred"] as TabValue[]).map((t) => {
              const label =
                t === "referrers"
                  ? `Referrers (${DUMMY_REFERRERS.length})`
                  : `Referred Users (${DUMMY_REFERRED_USERS_FULL.length})`;
              return (
                <button
                  key={t}
                  onClick={() => {
                    setTab(t);
                    setSearch("");
                  }}
                  className={[
                    "inline-flex items-center px-4 py-2 rounded-[var(--radius-sm)]",
                    "text-[13px] font-medium transition-colors",
                    tab === t
                      ? "bg-[var(--color-brand)] text-white"
                      : "bg-[var(--color-bg-subtle)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]",
                  ].join(" ")}
                >
                  {label}
                </button>
              );
            })}
          </Row>
        </Box>

        {/* Toolbar */}
        <Box px={5} py={3} className="border-b border-[var(--color-border)]">
          <Row justify="between" align="center" gap={3}>
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder={
                tab === "referrers"
                  ? "Search referrers..."
                  : "Search referred users..."
              }
              className="max-w-[320px] flex-1"
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
            emptyTitle="No referrers found"
            emptyMessage="Try adjusting your search"
          />
        ) : (
          <DataTable
            data={filteredReferred}
            columns={referredCols}
            total={filteredReferred.length}
            emptyTitle="No referred users found"
            emptyMessage="Try adjusting your search"
          />
        )}
      </Card>
    </Box>
  );
}
