import { useMemo, useState } from "react";
import { formatDate } from "@/lib/date";
import { useNavigate } from "react-router-dom";
import { Calendar } from "lucide-react";

import { usePageActions, usePageTitle } from "@/layouts/AppLayout";
import { StatCard } from "@/components/ui/StatCard";
import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { Row } from "@/components/ui/Row";
import { Stack } from "@/components/ui/Stack";
import { Box } from "@/components/ui/Box";
// Button was only used by the removed "Create Card" header action.
import { FilterButton } from "@/components/ui/FilterButton";
import { DataTable } from "@/components/tables/DataTable";
import { SearchInput } from "@/components/forms/SearchInput";
import { useDebounce } from "@/hooks/ui/useDebounce";
import {
  CardTypePill,
  KYCStatusPill,
  ApprovalStatusPill,
} from "@/components/cards/CardRequestPills";
import { useCardRequests, useCardRequestStats } from "@/hooks/queries/useCardRequests";
import {
  useApproveCardRequest,
  useRejectCardRequest,
} from "@/hooks/mutations/useCardRequestMutations";
import type { CardRequestRow } from "@/services/cardRequestService";
import type { ColumnDef } from "@tanstack/react-table";

const PAGE_SIZE = 20;

// ── Defensive helpers (response shape unconfirmed) ──
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

function normalizeType(value: unknown): CardRequestRow["card_type"] {
  return String(value ?? "").toLowerCase().includes("phys") ? "Physical" : "Virtual";
}
function normalizeKyc(value: unknown): CardRequestRow["kyc_status"] {
  const v = String(value ?? "").toLowerCase();
  return v.includes("not") || v === "false" || v === "unverified" || v === "pending" ? "Not Verified" : "Verified";
}
function normalizeApproval(value: unknown): CardRequestRow["approval_status"] {
  const v = String(value ?? "").toLowerCase();
  if (v.includes("approv")) return "Approved";
  if (v.includes("reject") || v.includes("declin")) return "Rejected";
  if (v.includes("review")) return "Under Review";
  return "Pending";
}

function normalizeRow(raw: unknown, index: number): CardRequestRow {
  const r = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const nested = r.user && typeof r.user === "object" ? (r.user as Record<string, unknown>) : {};
  return {
    id: str(get(r, ["id", "request_id", "reference"]), `CR-${index}`),
    user_name: str(get(r, ["user_name", "name", "full_name"]) ?? get(nested, ["name", "full_name"]), "Unknown"),
    user_email: str(get(r, ["user_email", "email"]) ?? get(nested, ["email"]), "—"),
    card_type: normalizeType(get(r, ["card_type", "type"])),
    currency: str(get(r, ["currency", "card_currency"]), "—"),
    requested_on: str(get(r, ["requested_on", "created_at", "date", "createdAt"]), "—"),
    kyc_status: normalizeKyc(get(r, ["kyc_status", "kyc", "kyc_verified"])),
    approval_status: normalizeApproval(get(r, ["approval_status", "status", "review_status"])),
    assigned_admin: str(get(r, ["assigned_admin", "assigned_officer", "admin", "officer"]), "Unassigned"),
  };
}

// The list endpoint may return an array or an object { data|items|results, total|meta.total }
function extractList(raw: unknown): { rows: unknown[]; total: number } {
  if (Array.isArray(raw)) return { rows: raw, total: raw.length };
  if (raw && typeof raw === "object") {
    const o = raw as Record<string, unknown>;
    const arr = [o.data, o.items, o.results, o.requests].find(Array.isArray) as unknown[] | undefined;
    const meta = o.meta && typeof o.meta === "object" ? (o.meta as Record<string, unknown>) : {};
    const total = num(o.total ?? o.count ?? meta.total ?? (arr ? arr.length : 0));
    return { rows: arr ?? [], total };
  }
  return { rows: [], total: 0 };
}

export default function CardRequestsPage() {
  usePageTitle(
    "Card Requests",
    "Review and approve requests for new virtual payment cards",
  );

  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const debounced = useDebounce(search, 400);

  const { data: rawStats } = useCardRequestStats();
  const { data: rawList, isLoading } = useCardRequests({
    page,
    limit: PAGE_SIZE,
    search: debounced || undefined,
  });

  const approve = useApproveCardRequest();
  const reject = useRejectCardRequest();

  usePageActions(
    // "Create Card" removed from the page header actions.
    useMemo(() => null, []),
  );

  const stats = useMemo(() => {
    const s = rawStats && typeof rawStats === "object" ? (rawStats as Record<string, unknown>) : {};
    return {
      pending: num(get(s, ["pending", "pending_requests"])),
      approved: num(get(s, ["approved", "approved_requests"])),
      rejected: num(get(s, ["rejected", "rejected_requests"])),
      active_cards: num(get(s, ["active_cards", "active"])),
    };
  }, [rawStats]);

  const { rows: rawRows, total } = useMemo(() => extractList(rawList), [rawList]);
  const requests = useMemo(() => rawRows.map(normalizeRow), [rawRows]);

  const columns = useMemo<ColumnDef<CardRequestRow, unknown>[]>(
    () => [
      {
        id: "select",
        enableSorting: false,
        header: ({ table }) => (
          <input type="checkbox" aria-label="Select all requests" checked={table.getIsAllRowsSelected()} onChange={table.getToggleAllRowsSelectedHandler()} className="h-3.5 w-3.5 cursor-pointer rounded border-(--color-border) accent-(--color-brand)" />
        ),
        cell: ({ row }) => (
          <input type="checkbox" aria-label={`Select ${row.original.id}`} checked={row.getIsSelected()} onChange={row.getToggleSelectedHandler()} className="h-3.5 w-3.5 cursor-pointer rounded border-(--color-border) accent-(--color-brand)" />
        ),
      },
      { accessorKey: "id", header: "Request ID", enableSorting: false, cell: ({ getValue }) => (<Text variant="caption" color="primary" weight="semibold">{getValue<string>()}</Text>) },
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
      { accessorKey: "card_type", header: "Card Type", enableSorting: false, cell: ({ getValue }) => (<CardTypePill type={getValue<CardRequestRow["card_type"]>()} />) },
      { accessorKey: "currency", header: "Currency", enableSorting: false, cell: ({ getValue }) => (<Text variant="caption" color="primary" weight="medium">{getValue<string>()}</Text>) },
      { accessorKey: "requested_on", header: "Requested On", enableSorting: false, cell: ({ getValue }) => (<Text variant="caption" color="secondary">{formatDate(getValue<string>())}</Text>) },
      { accessorKey: "kyc_status", header: "KYC Status", enableSorting: false, cell: ({ getValue }) => (<KYCStatusPill status={getValue<CardRequestRow["kyc_status"]>()} />) },
      { accessorKey: "approval_status", header: "Approval Status", enableSorting: false, cell: ({ getValue }) => (<ApprovalStatusPill status={getValue<CardRequestRow["approval_status"]>()} />) },
      {
        accessorKey: "assigned_admin",
        header: "Assigned Admin",
        enableSorting: false,
        cell: ({ getValue }) => {
          const admin = getValue<string>();
          return (<Text variant="caption" color={admin === "Unassigned" ? "muted" : "secondary"}>{admin}</Text>);
        },
      },
      {
        id: "actions",
        header: "Actions",
        enableSorting: false,
        cell: ({ row }) => (
          <Row gap={3} align="center">
            <button
              type="button"
              disabled={approve.isPending}
              onClick={() => approve.mutate(row.original.id)}
              className="font-geom text-xs font-medium text-(--color-success-mid) transition-opacity hover:opacity-75 disabled:opacity-50 focus:outline-none"
            >
              Approve
            </button>
            <button
              type="button"
              disabled={reject.isPending}
              onClick={() => reject.mutate(row.original.id)}
              className="font-geom text-xs font-medium text-(--color-danger) transition-opacity hover:opacity-75 disabled:opacity-50 focus:outline-none"
            >
              Reject
            </button>
            <button
              type="button"
              onClick={() => navigate(`/cards/requests/${row.original.id}`)}
              className="font-geom text-xs font-medium text-(--color-brand) transition-opacity hover:opacity-75 focus:outline-none"
            >
              Details
            </button>
          </Row>
        ),
      },
    ],
    [navigate, approve, reject],
  );

  return (
    <Box p={6} className="space-y-5">
      {/* 4 stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Pending Requests" value={stats.pending.toLocaleString()} valueClassName="text-(--color-warning-text)" />
        <StatCard label="Approved" value={stats.approved.toLocaleString()} valueClassName="text-(--color-success-mid)" />
        <StatCard label="Rejected" value={stats.rejected.toLocaleString()} valueClassName="text-(--color-danger)" />
        <StatCard label="Active Cards" value={stats.active_cards.toLocaleString()} />
      </div>

      {/* Requests table */}
      <Card noPadding>
        <Box px={5} py={4} className="border-b border-(--color-border) bg-(--color-bg-subtle)">
          <Text variant="subtitle" color="primary" weight="semibold" as="p">Card Requests</Text>
          <Text variant="micro" color="muted" as="p">{total} requests found</Text>
        </Box>

        <Box px={5} py={3} className="border-b border-(--color-border)">
          <Row gap={3} align="center">
            <SearchInput
              value={search}
              onChange={(value) => {
                setSearch(value);
                setPage(1);
              }}
              placeholder="Search by user, ID..."
              className="h-9 w-full max-w-[16.25rem]"
            />
            <FilterButton label="Date Picker" icon={<Calendar size={13} />} className="h-9" />
          </Row>
        </Box>

        <DataTable
          data={requests}
          columns={columns}
          total={total}
          page={page}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
          numberedPagination
          selectable
          loading={isLoading}
          emptyTitle="No card requests found"
          emptyMessage="There are no card requests to review right now."
        />
      </Card>
    </Box>
  );
}
