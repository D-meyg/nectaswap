import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Ban, Mail, UserPlus, SlidersHorizontal } from "lucide-react";

import { usePageTitle } from "@/layouts/AppLayout";
import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { Row } from "@/components/ui/Row";
import { Box } from "@/components/ui/Box";
import { Button } from "@/components/ui/Button";
import { Tooltip } from "@/components/ui/Tooltip";
import { FilterButton } from "@/components/ui/FilterButton";
import { KYCBadge } from "@/components/ui/KYCBadge";
import { StatusText } from "@/components/ui/StatusText";
import { RiskScore } from "@/components/ui/RiskScore";
import { DataTable } from "@/components/tables/DataTable";
import { SearchInput } from "@/components/forms/SearchInput";
import { Stack } from "@/components/ui/Stack";

import { useDebounce } from "@/hooks/ui/useDebounce";
import { useFreezeAccount } from "@/hooks/mutations/useUserMutations";
import { useUsers } from "@/hooks/queries/useUsers";
import type { ColumnDef } from "@tanstack/react-table";

interface UserRow {
  id: string;
  name: string;
  email: string;
  kyc_status: string;
  balance: number;
  total_volume: number;
  risk_score: number;
  status: string;
  kyc_tier: string;
}

function toNumber(value: unknown) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function stringValue(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function buildName(item: Record<string, unknown>, nested: Record<string, unknown>): string {
  const firstName = stringValue(item.first_name ?? nested.first_name, "");
  const lastName = stringValue(item.last_name ?? nested.last_name, "");
  const joined = [firstName, lastName].filter(Boolean).join(" ");
  return (
    joined ||
    stringValue(item.name ?? nested.name ?? item.full_name ?? nested.full_name, "") ||
    stringValue(item.username ?? nested.username, "") ||
    stringValue(item.admin ?? nested.admin, "") ||
    "Unknown User"
  );
}

function fmtBalance(n: number): string {
  if (n >= 1_000_000_000) return `₦${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `₦${(n / 1_000).toFixed(1)}K`;
  return `₦${n.toLocaleString()}`;
}

function normalizeUser(value: unknown): UserRow {
  const item =
    value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  const nestedUser =
    item.user && typeof item.user === "object"
      ? (item.user as Record<string, unknown>)
      : {};
  const id = stringValue(
    item.user_id ?? nestedUser.user_id ?? item.id ?? nestedUser.id,
    "unknown",
  );
  const name = buildName(item, nestedUser);

  return {
    id,
    name,
    email: stringValue(item.email ?? nestedUser.email, "N/A"),
    kyc_status: stringValue(item.kyc_status ?? item.kycStatus, "pending"),
    balance: toNumber(item.balance ?? item.wallet_balance),
    total_volume: toNumber(item.total_volume ?? item.totalVolume ?? item.transactions_count),
    risk_score: toNumber(item.risk_score ?? item.riskScore),
    status: stringValue(item.status, "active"),
    kyc_tier: stringValue(item.kyc_tier ?? item.kyc_level ?? item.tier, "N/A"),
  };
}

export default function UsersPage() {
  usePageTitle(
    "Users & Accounts",
    "User control, risk review, and lifecycle management",
  );

  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [kycFilter, setKycFilter] = useState("");
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search, 400);
  const freeze = useFreezeAccount();
  const { data: apiUsers = [], isLoading } = useUsers({
    page,
    search: debouncedSearch || undefined,
    status: statusFilter || undefined,
    kyc_status: kycFilter || undefined,
  });

  const users = useMemo(
    () => (Array.isArray(apiUsers) ? apiUsers.map(normalizeUser) : []),
    [apiUsers],
  );

  const filtered = useMemo(
    () =>
      users.filter((u) => {
        const matchSearch =
          !debouncedSearch ||
          u.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          u.email.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          u.id.toLowerCase().includes(debouncedSearch.toLowerCase());
        const matchStatus =
          !statusFilter ||
          u.status.toLowerCase() === statusFilter.toLowerCase();
        const matchKyc =
          !kycFilter || u.kyc_status.toLowerCase() === kycFilter.toLowerCase();
        return matchSearch && matchStatus && matchKyc;
      }),
    [users, debouncedSearch, statusFilter, kycFilter],
  );

  const handleView = useCallback(
    (id: string) => navigate(`/users/${id}`),
    [navigate],
  );

  const handleFreeze = useCallback((id: string) => freeze.mutate(id), [freeze]);

  const columns = useMemo<ColumnDef<UserRow, unknown>[]>(
    () => [
      {
        accessorKey: "name",
        header: "User",
        cell: ({ row }) => (
          <button
            className="flex items-center gap-3.5 text-left hover:opacity-80 transition-opacity outline-none"
            onClick={() => handleView(row.original.id)}
          >
            <Stack gap={0}>
              <Text variant="caption" color="primary" weight="semibold">
                {row.original.name}
              </Text>
              <Text variant="micro" color="tertiary" className="mt-0.5">
                {row.original.email}
              </Text>
            </Stack>
          </button>
        ),
      },
      {
        accessorKey: "kyc_status",
        header: "KYC",
        cell: ({ getValue }) => <KYCBadge status={getValue<string>()} />,
      },
      {
        accessorKey: "balance",
        header: "Balance",
        cell: ({ getValue }) => (
          <Text variant="caption" color="primary" weight="semibold">
            {fmtBalance(getValue<number>())}
          </Text>
        ),
      },
      {
        accessorKey: "total_volume",
        header: "Total Volume",
        cell: ({ getValue }) => (
          <Text variant="caption" color="secondary" weight="medium">
            {getValue<number>()} txns
          </Text>
        ),
      },
      {
        accessorKey: "risk_score",
        header: "Risk Score",
        cell: ({ getValue }) => <RiskScore score={getValue<number>()} />,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => <StatusText status={getValue<string>()} />,
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <Row gap={1} align="center">
            <Tooltip content="View profile" side="top">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 flex items-center justify-center hover:bg-(--color-bg-subtle) rounded-(--radius-sm)"
                onClick={() => handleView(row.original.id)}
              >
                <Eye size={16} className="text-(--color-text-secondary)" />
              </Button>
            </Tooltip>
            <Tooltip content="Freeze account" side="top">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 flex items-center justify-center hover:bg-(--color-danger-subtle) rounded-(--radius-sm)"
                onClick={() => handleFreeze(row.original.id)}
              >
                <Ban size={16} className="text-(--color-danger)" />
              </Button>
            </Tooltip>
            <Tooltip content="Send message" side="top">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 flex items-center justify-center hover:bg-(--color-bg-subtle) rounded-(--radius-sm)"
              >
                <Mail size={16} className="text-(--color-text-secondary)" />
              </Button>
            </Tooltip>
            <Tooltip content="Assign role" side="top">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 flex items-center justify-center hover:bg-(--color-bg-subtle) rounded-(--radius-sm)"
              >
                <UserPlus size={16} className="text-(--color-text-secondary)" />
              </Button>
            </Tooltip>
          </Row>
        ),
      },
    ],
    [handleView, handleFreeze],
  );

  return (
    <Box p={6} className="mx-auto w-full max-w-[100rem] lg:p-8">
      <Card className="mb-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
        <Box px={5} py={4}>
          <Row
            justify="between"
            align="center"
            gap={4}
            className="flex-col sm:flex-row"
          >
            <SearchInput
              value={search}
              onChange={(v) => {
                setSearch(v);
                setPage(1);
              }}
              placeholder="Search by name, email, or user ID..."
              className="w-full sm:max-w-[23.75rem]"
            />

            <Row
              gap={3}
              align="center"
              className="w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 scrollbar-hide"
            >
              <FilterButton
                label="All Status"
                active={!!statusFilter}
                onClick={() => setStatusFilter("")}
              />
              <FilterButton
                label="All KYC Levels"
                active={!!kycFilter}
                onClick={() => setKycFilter("")}
              />
              <FilterButton
                label="More Filters"
                icon={<SlidersHorizontal size={14} className="text-inherit" />}
              />
            </Row>
          </Row>
        </Box>
      </Card>

      <Card noPadding className="shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
        <Box px={5} py={5} className="border-b border-(--color-border)">
          <Stack gap={1}>
            <Text variant="subtitle" color="primary" weight="semibold">
              All Users
            </Text>
            <Text variant="caption" color="muted">
              {filtered.length} users found
            </Text>
          </Stack>
        </Box>

        <DataTable
          data={filtered}
          columns={columns}
          loading={isLoading}
          total={filtered.length}
          page={page}
          pageSize={10}
          onPageChange={setPage}
          emptyTitle="No users found"
          emptyMessage="Try adjusting your search or filters"
          stickyHeader
        />
      </Card>
    </Box>
  );
}
