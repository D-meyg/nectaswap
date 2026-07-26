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
import { useFlaggedUsers, useAmlStats } from "@/hooks/queries/useCompliance";
import type { ColumnDef } from "@tanstack/react-table";

const PAGE_SIZE = 6;

export interface FlaggedUserRow {
  id: string;
  name: string;
  email: string;
  risk_score: number;
  flags: number;
  kyc_level: 1 | 2 | 3;
  total_volume: string;
  last_trigger: string;
  status: "Under Review" | "Frozen" | "Active" | "Flagged";
  officer: string;
}

// ── Defensive helpers (flagged-users response shape unconfirmed) ──
function num(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value ?? 0);
  return Number.isFinite(n) ? n : 0;
}

function str(value: unknown, fallback = ""): string {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function get(obj: Record<string, unknown>, keys: string[]): unknown {
  for (const k of keys) if (obj[k] !== undefined && obj[k] !== null) return obj[k];
  return undefined;
}

function parseKyc(value: unknown): 1 | 2 | 3 {
  const m = String(value ?? "").match(/[123]/);
  const n = m ? Number(m[0]) : 1;
  return (n === 2 ? 2 : n === 3 ? 3 : 1) as 1 | 2 | 3;
}

function normalizeStatus(value: unknown): FlaggedUserRow["status"] {
  const v = String(value ?? "").toLowerCase();
  if (v.includes("frozen") || v.includes("freez")) return "Frozen";
  if (v.includes("review")) return "Under Review";
  if (v.includes("active")) return "Active";
  return "Flagged";
}

function formatVolume(value: unknown): string {
  if (typeof value === "number") return `₦ ${value.toLocaleString()}`;
  const s = str(value, "");
  if (!s) return "—";
  return /^[₦$]/.test(s) ? s : `₦ ${s}`;
}

function normalizeUser(raw: unknown, index: number): FlaggedUserRow {
  const u = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const nested = u.user && typeof u.user === "object" ? (u.user as Record<string, unknown>) : {};
  return {
    id: str(get(u, ["id", "user_id", "flag_id"]) ?? get(nested, ["id"]), `fu-${index}`),
    name: str(get(u, ["name", "full_name", "user_name"]) ?? get(nested, ["name", "full_name"]), "Unknown"),
    email: str(get(u, ["email", "user_email"]) ?? get(nested, ["email"]), "—"),
    risk_score: num(get(u, ["risk_score", "riskScore", "score"])),
    flags: num(get(u, ["flags", "flag_count", "number_of_flags", "num_flags"])),
    kyc_level: parseKyc(get(u, ["kyc_level", "kyc_tier", "kyc", "kyc_status"]) ?? get(nested, ["kyc_level", "kyc_tier"])),
    total_volume: formatVolume(get(u, ["total_volume", "volume", "total_volume_ngn"])),
    last_trigger: str(get(u, ["last_trigger", "trigger", "reason", "last_reason"]), "—"),
    status: normalizeStatus(get(u, ["status", "flag_status", "review_status"])),
    officer: str(get(u, ["officer", "assigned_officer", "assigned_admin"]), "Unassigned"),
  };
}

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

  const { data: rawUsers = [], isLoading } = useFlaggedUsers();
  const { data: rawStats } = useAmlStats();

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

  const users = useMemo(
    () => (Array.isArray(rawUsers) ? rawUsers.map(normalizeUser) : []),
    [rawUsers],
  );

  // Stats: global counts from aml/stats where available; Critical / Frozen
  // derived from the loaded list (no dedicated flagged-users stats endpoint yet).
  const stats = useMemo(() => {
    const s = rawStats && typeof rawStats === "object" ? (rawStats as Record<string, unknown>) : {};
    const total = num(s.flagged_users);
    const pending = num(s.pending_reviews);
    const critical = users.filter((u) => u.risk_score >= 90).length;
    const frozen = users.filter((u) => u.status === "Frozen").length;
    return {
      total: total || users.length,
      critical,
      frozen,
      pending,
    };
  }, [rawStats, users]);

  const filtered = useMemo(
    () =>
      users.filter((user) => {
        if (!search) return true;
        const q = search.toLowerCase();
        return user.name.toLowerCase().includes(q) || user.email.toLowerCase().includes(q);
      }),
    [users, search],
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
        <StatCard label="Total Flagged Users" value={stats.total.toLocaleString()} valueClassName="text-(--color-danger)" />
        <StatCard label="Critical Users" value={stats.critical.toLocaleString()} valueClassName="text-(--color-brand)" />
        <StatCard label="Accounts Frozen" value={stats.frozen.toLocaleString()} valueClassName="text-(--color-danger)" />
        <StatCard label="Pending Reviews" value={stats.pending.toLocaleString()} valueClassName="text-(--color-warning-text)" />
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
          loading={isLoading}
          emptyTitle="No flagged users"
          emptyMessage="No users are currently flagged."
        />
      </Card>

      <FlaggedUserDrawer user={selected} onClose={() => setSelected(null)} />
    </Box>
  );
}
