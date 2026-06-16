import { usePageTitle } from "@/layouts/AppLayout";
import { useMemo } from "react";
import { RefreshCw, Copy, ExternalLink } from "lucide-react";

import { StatCard } from "@/components/ui/StatCard";
import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { Row } from "@/components/ui/Row";
import { Stack } from "@/components/ui/Stack";
import { Box } from "@/components/ui/Box";
import { Button } from "@/components/ui/Button";
import { CryptoBadge } from "@/components/ui/CryptoBadge";
import { DataTable } from "@/components/tables/DataTable";
import { useClipboard } from "@/hooks/ui/useClipboard";
import {
  DUMMY_WALLETS_V2,
  DUMMY_REBALANCE_HISTORY,
  type WalletRow,
  type RebalanceEntry,
} from "@/lib/dummyData";
import type { ColumnDef } from "@tanstack/react-table";

function ThresholdBar({
  value,
  status,
}: {
  value: number;
  status: WalletRow["status"];
}) {
  const barColor =
    status === "healthy"
      ? "bg-[var(--color-success-mid)]"
      : status === "secure"
        ? "bg-[var(--color-brand)]"
        : "bg-[var(--color-warning)]";
  return (
    <Row gap={2} align="center">
      <div className="w-20 h-1.5 rounded-full bg-[var(--color-border)] overflow-hidden">
        <div
          className={["h-full rounded-full", barColor].join(" ")}
          style={{ width: `${value}%` }}
        />
      </div>
      <Text variant="micro" color="secondary">
        {value}%
      </Text>
    </Row>
  );
}

function WalletAddress({ address }: { address: string }) {
  const { copy } = useClipboard();
  return (
    <Row gap={1} align="center">
      <Text
        variant="micro"
        color="secondary"
        className="font-mono truncate max-w-[120px]"
      >
        {address}
      </Text>
      <button
        onClick={() => copy(address)}
        className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
      >
        <Copy size={11} />
      </button>
      <button className="text-[var(--color-text-muted)] hover:text-[var(--color-brand)]">
        <ExternalLink size={11} />
      </button>
    </Row>
  );
}

export default function WalletsPage() {
  usePageTitle("Wallets & Liquidity", "Asset custody and operational safety");

  const walletCols = useMemo<ColumnDef<WalletRow, unknown>[]>(
    () => [
      {
        accessorKey: "type",
        header: "Wallet Type",
        cell: ({ row }) => (
          <Row gap={2} align="center">
            <span className="text-[16px]">
              {row.original.type === "Hot Wallet"
                ? "🔥"
                : row.original.type === "Cold Wallet"
                  ? "🔒"
                  : "🏦"}
            </span>
            <Stack gap={0}>
              <Text variant="caption" color="primary" weight="semibold" as="p">
                {row.original.type}
              </Text>
              <Text variant="micro" color="muted" as="p">
                {row.original.network}
              </Text>
            </Stack>
          </Row>
        ),
      },
      {
        accessorKey: "asset",
        header: "Asset",
        cell: ({ getValue }) => <CryptoBadge symbol={getValue<string>()} />,
      },
      {
        accessorKey: "address",
        header: "Address",
        cell: ({ getValue }) => <WalletAddress address={getValue<string>()} />,
      },
      {
        accessorKey: "balance",
        header: "Balance",
        cell: ({ row }) => (
          <Stack gap={0}>
            <Text variant="caption" color="primary" weight="semibold" as="p">
              {row.original.balance}
            </Text>
            <Text variant="micro" color="muted" as="p">
              {row.original.unit}
            </Text>
          </Stack>
        ),
      },
      {
        accessorKey: "usd_value",
        header: "USD Value",
        cell: ({ getValue }) => (
          <Text variant="caption" color="primary" weight="medium">
            {getValue<string>()}
          </Text>
        ),
      },
      {
        accessorKey: "threshold",
        header: "Threshold",
        cell: ({ row }) => (
          <ThresholdBar
            value={row.original.threshold}
            status={row.original.status}
          />
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => {
          const v = getValue<WalletRow["status"]>();
          const color =
            v === "healthy"
              ? "text-[var(--color-success-mid)]"
              : v === "secure"
                ? "text-[var(--color-brand)]"
                : "text-[var(--color-warning)]";
          return (
            <span className={["text-[13px] font-medium", color].join(" ")}>
              {v}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: () => (
          <button className="text-[var(--color-brand)] text-[13px] font-medium hover:underline transition-colors">
            Manage
          </button>
        ),
      },
    ],
    [],
  );

  const rebalanceCols = useMemo<ColumnDef<RebalanceEntry, unknown>[]>(
    () => [
      {
        accessorKey: "date",
        header: "Date & Time",
        cell: ({ getValue }) => (
          <Text variant="caption" color="secondary">
            {getValue<string>()}
          </Text>
        ),
      },
      {
        accessorKey: "from",
        header: "From",
        cell: ({ getValue }) => (
          <Text variant="caption" color="primary" weight="medium">
            {getValue<string>()}
          </Text>
        ),
      },
      {
        accessorKey: "to",
        header: "To",
        cell: ({ getValue }) => (
          <Text variant="caption" color="primary" weight="medium">
            {getValue<string>()}
          </Text>
        ),
      },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ getValue }) => (
          <Text variant="caption" color="primary" weight="semibold">
            {getValue<string>()}
          </Text>
        ),
      },
      {
        accessorKey: "reason",
        header: "Reason",
        cell: ({ getValue }) => (
          <Text variant="caption" color="secondary">
            {getValue<string>()}
          </Text>
        ),
      },
      {
        accessorKey: "initiated_by",
        header: "Initiated By",
        cell: ({ getValue }) => (
          <Text variant="caption" color="secondary">
            {getValue<string>()}
          </Text>
        ),
      },
    ],
    [],
  );

  return (
    <Box p={6} className="space-y-5">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Assets (USD)" value="$62.19M" />
        <StatCard label="Hot Wallets" value={3} />
        <StatCard label="Cold Storage" value="$37.6M" />
        <StatCard label="Low Balance Alerts" value={1} status="danger" />
      </div>

      <Card noPadding>
        <Row
          justify="between"
          align="center"
          className="px-5 py-4 border-b border-[var(--color-border)]"
        >
          <Stack gap={0}>
            <Text variant="subtitle" color="primary" weight="semibold" as="p">
              Wallet Management
            </Text>
            <Text variant="micro" color="muted" as="p">
              Real-time balance and custody status
            </Text>
          </Stack>
          <Button size="sm">
            <RefreshCw size={13} />
            Manual Rebalance
          </Button>
        </Row>
        <DataTable
          data={DUMMY_WALLETS_V2}
          columns={walletCols}
          emptyTitle="No wallets"
          emptyMessage="No wallets configured"
        />
      </Card>

      <Card noPadding>
        <Box px={5} py={4} className="border-b border-[var(--color-border)]">
          <Text variant="subtitle" color="primary" weight="semibold" as="p">
            Rebalancing History
          </Text>
          <Text variant="micro" color="muted" as="p">
            Recent manual and automated transfers
          </Text>
        </Box>
        <DataTable
          data={DUMMY_REBALANCE_HISTORY}
          columns={rebalanceCols}
          emptyTitle="No history"
          emptyMessage="No rebalancing history"
        />
      </Card>
    </Box>
  );
}
