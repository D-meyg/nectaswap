import { useMemo, useState } from "react";
import { Upload } from "lucide-react";

import { usePageActions, usePageTitle } from "@/layouts/AppLayout";
import { StatCard } from "@/components/ui/StatCard";
import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { Stack } from "@/components/ui/Stack";
import { Box } from "@/components/ui/Box";
import { Button } from "@/components/ui/Button";
import { SearchInput } from "@/components/forms/SearchInput";
import { DataTable } from "@/components/tables/DataTable";
import {
  KycLevelPill,
  RiskScoreBar,
} from "@/components/compliance/CompliancePills";
import { FlaggedUserDrawer } from "@/components/compliance/FlaggedUserDrawer";
import { cn } from "@/lib/utils";
import {
  DUMMY_FLAGGED_USERS_V2,
  DUMMY_FLAGGED_USER_STATS,
  type FlaggedUserRow,
} from "@/lib/dummyData";
import type { ColumnDef } from "@tanstack/react-table";

const PAGE_SIZE = 6;

function statusTone(status: FlaggedUserRow["status"]) {
  return status === "Under Review"
    ? "text-(--color-warning-text) bg-(--color-warning-yellow-bg)"
    : status === "Frozen"
      ? "text-(--color-danger) bg-(--color-danger-subtle)"
      : status === "Active"
        ? "text-(--color-success-mid) bg-(--color-success-subtle)"
        : "text-[#0A85D1] bg-[rgba(10,133,209,0.1)]";
}

export default function FlaggedUsersPage() {
  usePageTitle(
    "Flagged Users",
    "Manage users flagged by AML, fraud detection or compliance rules",
  );

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<FlaggedUserRow | null>(null);

  usePageActions(
    useMemo(
      () => (
        <Button size="sm">
          <Upload size={13} />
          Export Users
        </Button>
      ),
      [],
    ),
  );

  const filtered = useMemo(
    () =>
      DUMMY_FLAGGED_USERS_V2.filter((user) => {
        if (!search) return true;
        const q = search.toLowerCase();
        return user.name.toLowerCase().includes(q) || user.email.toLowerCase().includes(q);
      }),
    [search],
  );

  const pageRows = useMemo(
    () => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filtered, page],
  );

  const columns = useMemo<ColumnDef<FlaggedUserRow, unknown>[]>(
    () => [
      {
        id: "select",
        enableSorting: false,
        header: ({ table }) => (
          <input type="checkbox" aria-label="Select all" checked={table.getIsAllRowsSelected()} onChange={table.getToggleAllRowsSelectedHandler()} className="h-3.5 w-3.5 cursor-pointer rounded border-(--color-border) accent-(--color-brand)" />
        ),
        cell: ({ row }) => (
          <input type="checkbox" aria-label={`Select ${row.original.name}`} checked={row.getIsSelected()} onChange={row.getToggleSelectedHandler()} className="h-3.5 w-3.5 cursor-pointer rounded border-(--color-border) accent-(--color-brand)" />
        ),
      },
      {
        accessorKey: "name",
        header: "User",
        enableSorting: false,
        cell: ({ row }) => (
          <Stack gap={0}>
            <Text variant="caption" color="primary" weight="semibold" as="p">{row.original.name}</Text>
            <Text variant="micro" color="muted" as="p">{row.original.email}</Text>
          </Stack>
        ),
      },
      { accessorKey: "risk_score", header: "Risk Score", enableSorting: false, cell: ({ getValue }) => (<RiskScoreBar score={getValue<number>()} />) },
      { accessorKey: "flags", header: "Flags", enableSorting: false, cell: ({ getValue }) => (<Text variant="caption" color="primary" weight="semibold">{getValue<number>()}</Text>) },
      { accessorKey: "kyc_level", header: "KYC Level", enableSorting: false, cell: ({ getValue }) => (<KycLevelPill level={getValue<1 | 2 | 3>()} />) },
      { accessorKey: "total_volume", header: "Total Volume", enableSorting: false, cell: ({ getValue }) => (<Text variant="caption" color="primary" weight="semibold">{getValue<string>()}</Text>) },
      { accessorKey: "last_trigger", header: "Last Trigger", enableSorting: false, cell: ({ getValue }) => (<Text variant="caption" color="secondary">{getValue<string>()}</Text>) },
      {
        accessorKey: "status",
        header: "Status",
        enableSorting: false,
        cell: ({ getValue }) => {
          const s = getValue<FlaggedUserRow["status"]>();
          return (<span className={cn("inline-flex rounded px-2 py-0.5 text-xs font-medium", statusTone(s))}>{s}</span>);
        },
      },
      {
        accessorKey: "officer",
        header: "Officer",
        enableSorting: false,
        cell: ({ getValue }) => {
          const officer = getValue<string>();
          return (<Text variant="caption" color={officer === "Unassigned" ? "muted" : "secondary"}>{officer}</Text>);
        },
      },
      {
        id: "actions",
        header: "Actions",
        enableSorting: false,
        cell: ({ row }) => (
          <button type="button" onClick={() => setSelected(row.original)} className="font-geom text-xs font-medium text-(--color-brand) transition-opacity hover:opacity-75 focus:outline-none">
            View
          </button>
        ),
      },
    ],
    [],
  );

  return (
    <Box p={6} className="space-y-5">
      {/* 4 stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Flagged Users" value={DUMMY_FLAGGED_USER_STATS.total} valueClassName="text-(--color-danger)" />
        <StatCard label="Critical Users" value={DUMMY_FLAGGED_USER_STATS.critical} valueClassName="text-(--color-brand)" />
        <StatCard label="Accounts Frozen" value={DUMMY_FLAGGED_USER_STATS.frozen} valueClassName="text-(--color-danger)" />
        <StatCard label="Pending Reviews" value={DUMMY_FLAGGED_USER_STATS.pending} valueClassName="text-(--color-warning-text)" />
      </div>

      {/* Table */}
      <Card noPadding>
        <Box px={5} py={4} className="border-b border-(--color-border)">
          <Text variant="subtitle" color="primary" weight="semibold" as="p">Flagged Users</Text>
          <Text variant="micro" color="muted" as="p">{filtered.length} users found</Text>
        </Box>
        <Box px={5} py={3} className="border-b border-(--color-border)">
          <SearchInput
            value={search}
            onChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
            placeholder="Search users..."
            className="h-9 w-full max-w-[16.25rem]"
          />
        </Box>
        <DataTable
          data={pageRows}
          columns={columns}
          total={filtered.length}
          page={page}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
          numberedPagination
          selectable
          emptyTitle="No flagged users"
          emptyMessage="Try adjusting your search"
        />
      </Card>

      <FlaggedUserDrawer user={selected} onClose={() => setSelected(null)} />
    </Box>
  );
}
