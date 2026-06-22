/* eslint-disable @typescript-eslint/no-explicit-any */
import { usePageTitle } from "@/layouts/AppLayout";
import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Eye, Lock, SlidersHorizontal } from "lucide-react";

import { StatCard } from "@/components/ui/StatCard";
import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { Row } from "@/components/ui/Row";
import { Stack } from "@/components/ui/Stack";
import { Box } from "@/components/ui/Box";
import { Button } from "@/components/ui/Button";
import { Tooltip } from "@/components/ui/Tooltip";
import { FilterButton } from "@/components/ui/FilterButton";
import { DataTable } from "@/components/tables/DataTable";
import { SearchInput } from "@/components/forms/SearchInput";
import { useDebounce } from "@/hooks/ui/useDebounce";
import { useCards, useCardStats } from "@/hooks/queries/useCards";
import type { ColumnDef } from "@tanstack/react-table";

// Card type pill — "Virtual" purple, "Physical" brand blue
function CardTypePill({ type }: { type: "Virtual" | "Physical" }) {
  const style =
    type === "Virtual"
      ? "text-(--color-brand) bg-[rgba(78,43,204,0.08)]"
      : "text-[#0A85D1] bg-[rgba(10,133,209,0.08)]";
  return (
    <span
      className={[
        "inline-flex px-2 py-0.5 rounded-full text-xs font-medium",
        style,
      ].join(" ")}
    >
      {type}
    </span>
  );
}

// Card status text — plain colored text matching image 1
function CardStatus({ status }: { status: CardRow["status"] }) {
  const colors: Record<CardRow["status"], string> = {
    Active: "text-(--color-success-mid)",
    Frozen: "text-(--color-warning-dark)",
    Pending: "text-(--color-warning)",
    Blocked: "text-(--color-danger)",
  };
  return (
    <span className={["text-[0.8125rem] font-medium", colors[status]].join(" ")}>
      {status}
    </span>
  );
}

// Format NGN compact
function fmt(n: number) {
  if (n === 0) return "₦ 0";
  if (n >= 1_000_000) return `₦ ${(n / 1_000_000).toFixed(1)}M`;
  return `₦ ${n.toLocaleString()}`;
}

export default function CardManagementPage() {
  usePageTitle(
    "Card Management",
    "Virtual and physical card issuance and management",
  );

  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [typeFilter] = useState("");
  const [page, setPage] = useState(1);
  const debounced = useDebounce(search, 400);
  const { data: apiCards = [], isLoading } = useCards({
    page,
    search: debounced || undefined,
    type: typeFilter || undefined,
  });
  const { data: cardStats = {} } = useCardStats();
  const cards = apiCards as CardRow[];

  const filtered = useMemo(
    () =>
      cards.filter((c) => {
        const matchSearch =
          !debounced ||
          c.masked.includes(debounced) ||
          c.user_name.toLowerCase().includes(debounced.toLowerCase()) ||
          c.id.includes(debounced);
        const matchType = !typeFilter || c.type === typeFilter;
        return matchSearch && matchType;
      }),
    [cards, debounced, typeFilter],
  );

  const handleView = useCallback(
    (id: string) => navigate(`/cards/${id}`),
    [navigate],
  );

  const totalCards = (cardStats as any).total_cards ?? cards.length;
  const activeCards = (cardStats as any).active_cards ?? cards.filter((c) => c.status === "Active").length;
  const blockedCards = (cardStats as any).blocked_cards ?? cards.filter((c) => c.status === "Blocked" || c.status === "Frozen").length;
  const totalSpend = (cardStats as any).total_spend_24h ?? cards.reduce((s, c) => s + c.spend_30d, 0);

  const columns = useMemo<ColumnDef<CardRow, unknown>[]>(
    () => [
      {
        // CARD DETAILS — masked + expiry stacked
        accessorKey: "masked",
        header: "Card Details",
        cell: ({ row }) => (
          <Stack gap={0}>
            <Text
              variant="caption"
              color="primary"
              weight="semibold"
              className="font-mono"
              as="p"
            >
              {row.original.masked}
            </Text>
            <Text variant="micro" color="muted" as="p">
              Exp: {row.original.expiry}
            </Text>
          </Stack>
        ),
      },
      {
        // USER — name + email stacked
        accessorKey: "user_name",
        header: "User",
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
        // TYPE — Virtual/Physical pill
        accessorKey: "type",
        header: "Type",
        cell: ({ getValue }) => (
          <CardTypePill type={getValue<"Virtual" | "Physical">()} />
        ),
      },
      {
        // BALANCE
        accessorKey: "balance",
        header: "Balance",
        cell: ({ getValue }) => (
          <Text variant="caption" color="primary" weight="medium">
            {fmt(getValue<number>())}
          </Text>
        ),
      },
      {
        // SPEND (30D)
        accessorKey: "spend_30d",
        header: "Spend (30D)",
        cell: ({ getValue }) => (
          <Text variant="caption" color="secondary">
            {fmt(getValue<number>())}
          </Text>
        ),
      },
      {
        // STATUS
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => (
          <CardStatus status={getValue<CardRow["status"]>()} />
        ),
      },
      {
        // ACTIONS — eye + lock icons
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <Row gap={1} align="center">
            <Tooltip content="View card" side="top">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 flex items-center justify-center"
                onClick={() => handleView(row.original.id)}
              >
                <Eye size={14} className="text-(--color-text-muted)" />
              </Button>
            </Tooltip>
            <Tooltip content="Freeze card" side="top">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 flex items-center justify-center"
              >
                <Lock size={14} className="text-(--color-text-muted)" />
              </Button>
            </Tooltip>
          </Row>
        ),
      },
    ],
    [handleView],
  );

  return (
    <Box p={6} className="space-y-5">
      {/* 4 stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Cards" value={totalCards} />
        <StatCard label="Active Cards" value={activeCards} status="success" />
        <StatCard label="Blocked Cards" value={blockedCards} status="danger" />
        <StatCard
          label="Total Spend (24h)"
          value={`₦ ${(totalSpend / 1_000_000).toFixed(1)}M`}
        />
      </div>

      {/* Filter bar */}
      <Card>
        <Box px={5} py={3}>
          <Row justify="between" align="center" gap={3}>
            <SearchInput
              value={search}
              onChange={(v) => {
                setSearch(v);
                setPage(1);
              }}
              placeholder="Search by card number, user, or ID..."
              className="flex-1 max-w-[23.75rem]"
            />
            <Row gap={2} align="center">
              <FilterButton
                label="More Filters"
                icon={<SlidersHorizontal size={13} />}
              />
              <Button size="sm">
                <Plus size={13} />
                New Card
              </Button>
            </Row>
          </Row>
        </Box>
      </Card>

      {/* Table */}
      <Card noPadding>
        <Box px={5} py={4} className="border-b border-(--color-border)">
          <Text variant="subtitle" color="primary" weight="semibold" as="p">
            All Cards
          </Text>
          <Text variant="micro" color="muted" as="p">
            {filtered.length} cards found
          </Text>
        </Box>
        <DataTable
          data={filtered}
          columns={columns}
          total={filtered.length}
          page={page}
          pageSize={10}
          onPageChange={setPage}
          emptyTitle="No cards found"
          emptyMessage="Try adjusting your search or filters"
          loading={isLoading}
          stickyHeader
        />
      </Card>
    </Box>
  );
}
