import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Plus } from "lucide-react";

import { usePageActions, usePageTitle } from "@/layouts/AppLayout";
import { StatCard } from "@/components/ui/StatCard";
import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { Row } from "@/components/ui/Row";
import { Stack } from "@/components/ui/Stack";
import { Box } from "@/components/ui/Box";
import { Button } from "@/components/ui/Button";
import { FilterButton } from "@/components/ui/FilterButton";
import { DataTable } from "@/components/tables/DataTable";
import { SearchInput } from "@/components/forms/SearchInput";
import { useDebounce } from "@/hooks/ui/useDebounce";
import {
  CardTypePill,
  KYCStatusPill,
  ApprovalStatusPill,
} from "@/components/cards/CardRequestPills";
import {
  DUMMY_CARD_REQUESTS,
  DUMMY_CARD_REQUEST_STATS,
  type CardRequestRow,
} from "@/lib/dummyData";
import type { ColumnDef } from "@tanstack/react-table";

const PAGE_SIZE = 6;

export default function CardRequestsPage() {
  usePageTitle(
    "Card Requests",
    "Review and approve requests for new virtual payment cards",
  );

  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const debounced = useDebounce(search, 400);

  usePageActions(
    useMemo(
      () => (
        <Button size="sm">
          <Plus size={13} />
          Create Card
        </Button>
      ),
      [],
    ),
  );

  const filtered = useMemo(
    () =>
      DUMMY_CARD_REQUESTS.filter((request) => {
        if (!debounced) return true;
        const query = debounced.toLowerCase();
        return (
          request.id.toLowerCase().includes(query) ||
          request.user_name.toLowerCase().includes(query) ||
          request.user_email.toLowerCase().includes(query)
        );
      }),
    [debounced],
  );

  const pageRows = useMemo(
    () => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filtered, page],
  );

  const columns = useMemo<ColumnDef<CardRequestRow, unknown>[]>(
    () => [
      {
        id: "select",
        enableSorting: false,
        header: ({ table }) => (
          <input
            type="checkbox"
            aria-label="Select all requests"
            checked={table.getIsAllRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
            className="h-3.5 w-3.5 cursor-pointer rounded border-(--color-border) accent-(--color-brand)"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            aria-label={`Select ${row.original.id}`}
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
            className="h-3.5 w-3.5 cursor-pointer rounded border-(--color-border) accent-(--color-brand)"
          />
        ),
      },
      {
        accessorKey: "id",
        header: "Request ID",
        enableSorting: false,
        cell: ({ getValue }) => (
          <Text variant="caption" color="primary" weight="semibold">
            {getValue<string>()}
          </Text>
        ),
      },
      {
        accessorKey: "user_name",
        header: "User",
        enableSorting: false,
        cell: ({ row }) => (
          <Stack gap={0}>
            <Text variant="caption" color="primary" weight="medium" as="p">
              {row.original.user_name}
            </Text>
            <Text variant="micro" color="muted" as="p">
              {row.original.user_email}
            </Text>
          </Stack>
        ),
      },
      {
        accessorKey: "card_type",
        header: "Card Type",
        enableSorting: false,
        cell: ({ getValue }) => (
          <CardTypePill type={getValue<CardRequestRow["card_type"]>()} />
        ),
      },
      {
        accessorKey: "currency",
        header: "Currency",
        enableSorting: false,
        cell: ({ getValue }) => (
          <Text variant="caption" color="primary" weight="medium">
            {getValue<string>()}
          </Text>
        ),
      },
      {
        accessorKey: "requested_on",
        header: "Requested On",
        enableSorting: false,
        cell: ({ getValue }) => (
          <Text variant="caption" color="secondary">
            {getValue<string>()}
          </Text>
        ),
      },
      {
        accessorKey: "kyc_status",
        header: "KYC Status",
        enableSorting: false,
        cell: ({ getValue }) => (
          <KYCStatusPill status={getValue<CardRequestRow["kyc_status"]>()} />
        ),
      },
      {
        accessorKey: "approval_status",
        header: "Approval Status",
        enableSorting: false,
        cell: ({ getValue }) => (
          <ApprovalStatusPill
            status={getValue<CardRequestRow["approval_status"]>()}
          />
        ),
      },
      {
        accessorKey: "assigned_admin",
        header: "Assigned Admin",
        enableSorting: false,
        cell: ({ getValue }) => {
          const admin = getValue<string>();
          return (
            <Text
              variant="caption"
              color={admin === "Unassigned" ? "muted" : "secondary"}
            >
              {admin}
            </Text>
          );
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
              className="font-geom text-xs font-medium text-(--color-success-mid) transition-opacity hover:opacity-75 focus:outline-none"
            >
              Approve
            </button>
            <button
              type="button"
              className="font-geom text-xs font-medium text-(--color-danger) transition-opacity hover:opacity-75 focus:outline-none"
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
    [navigate],
  );

  return (
    <Box p={6} className="space-y-5">
      {/* 4 stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Pending Requests"
          value={DUMMY_CARD_REQUEST_STATS.pending}
          valueClassName="text-(--color-warning-text)"
        />
        <StatCard
          label="Approved"
          value={DUMMY_CARD_REQUEST_STATS.approved.toLocaleString()}
          valueClassName="text-(--color-success-mid)"
        />
        <StatCard
          label="Rejected"
          value={DUMMY_CARD_REQUEST_STATS.rejected}
          valueClassName="text-(--color-danger)"
        />
        <StatCard
          label="Active Cards"
          value={DUMMY_CARD_REQUEST_STATS.active_cards}
        />
      </div>

      {/* Requests table */}
      <Card noPadding>
        <Box
          px={5}
          py={4}
          className="border-b border-(--color-border) bg-(--color-bg-subtle)"
        >
          <Text variant="subtitle" color="primary" weight="semibold" as="p">
            Card Requests
          </Text>
          <Text variant="micro" color="muted" as="p">
            {filtered.length} requests found
          </Text>
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
            <FilterButton
              label="Date Picker"
              icon={<Calendar size={13} />}
              className="h-9"
            />
          </Row>
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
          emptyTitle="No card requests found"
          emptyMessage="Try adjusting your search or filters"
        />
      </Card>
    </Box>
  );
}
