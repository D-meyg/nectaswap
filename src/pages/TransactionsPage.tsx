import { usePageTitle } from "@/layouts/AppLayout";
import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Download, SlidersHorizontal, Eye } from "lucide-react";

import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { Row } from "@/components/ui/Row";
import { Stack } from "@/components/ui/Stack";
import { Box } from "@/components/ui/Box";
import { Button } from "@/components/ui/Button";
import { Tooltip } from "@/components/ui/Tooltip";
import { FilterButton } from "@/components/ui/FilterButton";
import { CryptoBadge } from "@/components/ui/CryptoBadge";
import { DataTable } from "@/components/tables/DataTable";
import { SearchInput } from "@/components/forms/SearchInput";

import { useDebounce } from "@/hooks/ui/useDebounce";
import { DUMMY_TRANSACTIONS, type TransactionRow } from "@/lib/dummyData";
import { useTransactions } from "@/hooks/queries/useTransactions";
import type { ColumnDef } from "@tanstack/react-table";

// Status pill — matches image 1 exactly (green/yellow/red filled pills)
function TxStatus({ status }: { status: "completed" | "pending" | "failed" }) {
  const styles = {
    completed:
      "bg-(--color-success-subtle) text-(--color-success-dark) border border-(--color-success-muted)",
    pending:
      "bg-(--color-warning-subtle) text-(--color-warning-dark) border border-(--color-warning-border)",
    failed:
      "bg-(--color-danger-subtle)  text-(--color-danger)       border border-(--color-danger-muted)",
  };
  return (
    <span
      className={[
        "inline-flex items-center px-2.5 py-1 rounded-[4px]",
        "text-[11px] font-semibold uppercase tracking-[0.5px]",
        styles[status],
      ].join(" ")}
    >
      {status}
    </span>
  );
}

export default function TransactionsPage() {
  usePageTitle(
    "Transactions & Conversions",
    "Crypto-to-Naira conversion tracking and resolution",
  );

  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search, 400);
  const { data: apiTransactions = [], isLoading } = useTransactions({
    page,
    search: debouncedSearch || undefined,
    status: statusFilter || undefined,
    type: typeFilter || undefined,
  });
  const transactions = apiTransactions.length ? (apiTransactions as TransactionRow[]) : DUMMY_TRANSACTIONS;

  const handleView = useCallback(
    (id: string) => {
      navigate(`/transactions/${id}`);
    },
    [navigate],
  );

  const filtered = useMemo(
    () =>
      transactions.filter((t) => {
        const matchSearch =
          !debouncedSearch ||
          t.id.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          t.user_name.toLowerCase().includes(debouncedSearch.toLowerCase());
        const matchStatus = !statusFilter || t.status === statusFilter;
        const matchType = !typeFilter || t.crypto === typeFilter;
        return matchSearch && matchStatus && matchType;
      }),
    [transactions, debouncedSearch, statusFilter, typeFilter],
  );

  const columns = useMemo<ColumnDef<TransactionRow, unknown>[]>(
    () => [
      {
        // TRANSACTION ID — ID + time stacked
        accessorKey: "id",
        header: "Transaction ID",
        cell: ({ row }) => (
          <Stack gap={0}>
            <Text variant="caption" color="primary" weight="semibold" as="p">
              {row.original.id}
            </Text>
            <Text variant="micro" color="muted" as="p">
              {row.original.time}
            </Text>
          </Stack>
        ),
      },
      {
        // USER — name + ID stacked
        accessorKey: "user_name",
        header: "User",
        cell: ({ row }) => (
          <Stack gap={0}>
            <Text variant="caption" color="primary" weight="medium" as="p">
              {row.original.user_name}
            </Text>
            <Text variant="micro" color="muted" as="p">
              ID: {row.original.user_id}
            </Text>
          </Stack>
        ),
      },
      {
        // TYPE — crypto badge + "to NGN" stacked
        accessorKey: "crypto",
        header: "Type",
        cell: ({ row }) => (
          <Stack gap={0}>
            <Row gap={1} align="center">
              <CryptoBadge symbol={row.original.crypto} />
            </Row>
            <Text variant="micro" color="muted" as="p">
              to NGN
            </Text>
          </Stack>
        ),
      },
      {
        // CRYPTO AMOUNT — amount + rate stacked
        accessorKey: "crypto_amount",
        header: "Crypto Amount",
        cell: ({ row }) => (
          <Stack gap={0}>
            <Text variant="caption" color="primary" weight="medium" as="p">
              {row.original.crypto_amount}
            </Text>
            <Text variant="micro" color="muted" as="p">
              {row.original.crypto_rate}
            </Text>
          </Stack>
        ),
      },
      {
        // NGN AMOUNT — amount + fee stacked
        accessorKey: "ngn_amount",
        header: "NGN Amount",
        cell: ({ row }) => (
          <Stack gap={0}>
            <Text variant="caption" color="primary" weight="semibold" as="p">
              {row.original.ngn_amount}
            </Text>
            <Text variant="micro" color="muted" as="p">
              {row.original.fee}
            </Text>
          </Stack>
        ),
      },
      {
        // STATUS — colored pill
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => (
          <TxStatus status={getValue<"completed" | "pending" | "failed">()} />
        ),
      },
      {
        // DATE — date + time stacked
        accessorKey: "date",
        header: "Date",
        cell: ({ row }) => (
          <Stack gap={0}>
            <Text variant="caption" color="secondary" as="p">
              {row.original.date}
            </Text>
            <Text variant="micro" color="muted" as="p">
              {row.original.time}
            </Text>
          </Stack>
        ),
      },
      {
        // ACTIONS — eye icon
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <Tooltip content="View transaction" side="left">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 flex items-center justify-center"
              onClick={() => handleView(row.original.id)}
            >
              <Eye size={15} className="text-(--color-text-muted)" />
            </Button>
          </Tooltip>
        ),
      },
    ],
    [handleView],
  );

  return (
    <Box p={6}>
      {/* Filter bar — matches image 1: search left, buttons right */}
      <Card className="mb-4">
        <Box px={5} py={3}>
          <Row justify="between" align="center" gap={3}>
            <SearchInput
              value={search}
              onChange={(v) => {
                setSearch(v);
                setPage(1);
              }}
              placeholder="Search by transaction ID or user..."
              className="flex-1 max-w-[420px]"
            />
            <Row gap={2} align="center">
              <FilterButton
                label="All Status"
                active={!!statusFilter}
                onClick={() => setStatusFilter("")}
              />
              <FilterButton
                label="All Types"
                active={!!typeFilter}
                onClick={() => setTypeFilter("")}
              />
              <FilterButton label="Export" icon={<Download size={13} />} />
              <FilterButton
                label="More Filters"
                icon={<SlidersHorizontal size={13} />}
              />
            </Row>
          </Row>
        </Box>
      </Card>

      {/* Table card — "All Transactions / N found" header + table */}
      <Card noPadding>
        <Box px={5} py={4} className="border-b border-(--color-border)">
          <Text variant="subtitle" color="primary" weight="semibold" as="p">
            All Transactions
          </Text>
          <Text variant="micro" color="muted" as="p">
            {filtered.length} transactions found
          </Text>
        </Box>

        <DataTable
          data={filtered}
          columns={columns}
          loading={isLoading}
          total={filtered.length}
          page={page}
          pageSize={10}
          onPageChange={setPage}
          emptyTitle="No transactions found"
          emptyMessage="Try adjusting your search or filters"
          stickyHeader
        />
      </Card>
    </Box>
  );
}
