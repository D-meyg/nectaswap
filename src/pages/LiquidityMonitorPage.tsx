import { useMemo, useState } from "react";

import { usePageTitle } from "@/layouts/AppLayout";
import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { Row } from "@/components/ui/Row";
import { Stack } from "@/components/ui/Stack";
import { Box } from "@/components/ui/Box";
import { DataTable } from "@/components/tables/DataTable";
import { AssetIcon } from "@/components/wallets/AssetIcon";
import { cn } from "@/lib/utils";
import {
  DUMMY_LIQUIDITY_STATS,
  DUMMY_LIQUIDITY_ASSETS,
  DUMMY_WALLET_DISTRIBUTION,
  DUMMY_SETTLEMENT_QUEUE,
  DUMMY_LIQUIDITY_ALERTS,
  DUMMY_LIQUIDITY_TRENDS,
  type SettlementQueueRow,
  type WalletDistribution,
} from "@/lib/dummyData";
import type { ColumnDef } from "@tanstack/react-table";

type TrendRange = "7D" | "30D" | "90D";

const TOP_STATS: Array<{ label: string; key: keyof typeof DUMMY_LIQUIDITY_STATS; tone: string }> = [
  { label: "Total Liquidity", key: "total_liquidity", tone: "text-(--color-text-primary)" },
  { label: "Available Liquidity", key: "available_liquidity", tone: "text-(--color-success-mid)" },
  { label: "Locked Funds", key: "locked_funds", tone: "text-(--color-danger)" },
  { label: "Pending Settlements", key: "pending_settlements", tone: "text-(--color-warning-text)" },
  { label: "Reserve Ratio", key: "reserve_ratio", tone: "text-(--color-text-primary)" },
  { label: "Liquidity Health", key: "liquidity_health", tone: "text-(--color-success-mid)" },
];

function healthTone(health: WalletDistribution["health"]) {
  return health === "Healthy"
    ? "text-(--color-success-mid) bg-(--color-success-subtle)"
    : health === "Warning"
      ? "text-(--color-warning-text) bg-(--color-warning-yellow-bg)"
      : "text-(--color-danger) bg-(--color-danger-subtle)";
}

function barTone(health: WalletDistribution["health"]) {
  return health === "Healthy"
    ? "bg-(--color-success-mid)"
    : health === "Warning"
      ? "bg-(--color-warning)"
      : "bg-(--color-danger)";
}

function queueStatusTone(status: SettlementQueueRow["status"]) {
  return status === "Pending"
    ? "text-(--color-warning-text) bg-(--color-warning-yellow-bg)"
    : status === "Active"
      ? "text-[#0A85D1] bg-[rgba(10,133,209,0.1)]"
      : status === "Failed"
        ? "text-(--color-danger) bg-(--color-danger-subtle)"
        : "text-(--color-success-mid) bg-(--color-success-subtle)";
}

export default function LiquidityMonitorPage() {
  usePageTitle(
    "Liquidity Monitor",
    "Monitor platform reserves, settlement balances, liquidity health and operational risk",
  );

  const [range, setRange] = useState<TrendRange>("30D");
  const trend = DUMMY_LIQUIDITY_TRENDS[range];

  const queueColumns = useMemo<ColumnDef<SettlementQueueRow, unknown>[]>(
    () => [
      { accessorKey: "id", header: "Queue ID", enableSorting: false, cell: ({ getValue }) => (<Text variant="caption" color="primary" weight="semibold">{getValue<string>()}</Text>) },
      { accessorKey: "user", header: "User", enableSorting: false, cell: ({ getValue }) => (<Text variant="caption" color="primary" weight="medium">{getValue<string>()}</Text>) },
      { accessorKey: "type", header: "Type", enableSorting: false, cell: ({ getValue }) => (<Text variant="caption" color="secondary">{getValue<string>()}</Text>) },
      { accessorKey: "asset", header: "Asset", enableSorting: false, cell: ({ getValue }) => (<Text variant="caption" color="primary" weight="medium">{getValue<string>()}</Text>) },
      { accessorKey: "amount", header: "Amount", enableSorting: false, cell: ({ getValue }) => (<Text variant="caption" color="primary" weight="semibold">{getValue<string>()}</Text>) },
      { accessorKey: "stage", header: "Stage", enableSorting: false, cell: ({ getValue }) => (<Text variant="caption" color="secondary">{getValue<string>()}</Text>) },
      { accessorKey: "network", header: "Network", enableSorting: false, cell: ({ getValue }) => (<Text variant="caption" color="secondary">{getValue<string>()}</Text>) },
      { accessorKey: "created", header: "Created", enableSorting: false, cell: ({ getValue }) => (<Text variant="caption" color="secondary">{getValue<string>()}</Text>) },
      {
        accessorKey: "status",
        header: "Status",
        enableSorting: false,
        cell: ({ getValue }) => {
          const s = getValue<SettlementQueueRow["status"]>();
          return (
            <span className={cn("inline-flex rounded px-2 py-0.5 text-xs font-medium", queueStatusTone(s))}>
              {s}
            </span>
          );
        },
      },
    ],
    [],
  );

  return (
    <Box p={6} className="space-y-5">
      {/* Top stat row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {TOP_STATS.map((stat) => (
          <Box
            key={stat.key}
            className="rounded-lg border border-(--color-border) bg-white px-4 py-3.5 shadow-[0_2px_12px_rgba(0,0,0,0.03)]"
          >
            <Text variant="micro" color="tertiary" className="block mb-1.5 text-[0.625rem]">
              {stat.label}
            </Text>
            <Text variant="title" weight="semibold" as="p" className={cn("text-[1.375rem] leading-7", stat.tone)}>
              {DUMMY_LIQUIDITY_STATS[stat.key]}
            </Text>
          </Box>
        ))}
      </div>

      {/* Asset Allocation + Wallet Distribution */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2 self-start">
          <Card.Header title="Asset Allocation" className="border-b-0 px-5 pb-1 pt-4 [&_h4]:text-[0.8125rem] [&_h4]:leading-5" />
          <Card.Body className="px-5 pb-5 pt-2">
            <Stack gap={3}>
              {DUMMY_LIQUIDITY_ASSETS.map((asset) => (
                <Box key={asset.symbol} className="rounded-lg border border-(--color-border) px-4 py-3.5">
                  <Row justify="between" align="start">
                    <Row gap={3} align="center">
                      <AssetIcon symbol={asset.symbol} />
                      <Stack gap={0}>
                        <Text variant="caption" color="primary" weight="semibold" as="p">{asset.symbol}</Text>
                        <Text variant="micro" color="muted" as="p">{asset.name}</Text>
                      </Stack>
                    </Row>
                    <Text
                      variant="caption"
                      weight="semibold"
                      className={cn(
                        "text-[0.75rem]",
                        asset.change > 0 ? "text-(--color-success-mid)" : asset.change < 0 ? "text-(--color-danger)" : "text-(--color-text-muted)",
                      )}
                    >
                      {asset.change > 0 ? "+" : ""}{asset.change.toFixed(1)}%
                    </Text>
                  </Row>
                  <div className="mt-3 grid grid-cols-3 gap-4">
                    {[
                      ["Balance", asset.balance],
                      ["Available", asset.available],
                      ["Locked", asset.locked],
                    ].map(([label, value]) => (
                      <Stack key={label} gap={0}>
                        <Text variant="micro" color="muted" className="text-[0.625rem]" as="p">{label}</Text>
                        <Text variant="caption" color="primary" weight="medium" className="text-[0.75rem]" as="p">{value}</Text>
                      </Stack>
                    ))}
                  </div>
                </Box>
              ))}
            </Stack>
          </Card.Body>
        </Card>

        <Stack gap={4}>
          <Text variant="micro" color="tertiary" weight="semibold" uppercase className="tracking-[0.06em] text-[0.625rem] px-1">
            Wallet Distribution
          </Text>
          {DUMMY_WALLET_DISTRIBUTION.map((wallet) => (
            <Card key={wallet.id}>
              <Box className="px-4 py-3.5">
                <Row justify="between" align="center" className="mb-1.5">
                  <Text variant="caption" color="primary" weight="semibold">{wallet.name}</Text>
                  <span className={cn("inline-flex rounded px-2 py-0.5 text-[0.625rem] font-semibold", healthTone(wallet.health))}>
                    {wallet.health}
                  </span>
                </Row>
                <Text variant="title" color="primary" weight="semibold" as="p" className="text-[1.25rem] leading-7">
                  {wallet.balance}
                </Text>
                <Text variant="micro" color="muted" className="mt-1 mb-2 block text-[0.625rem]">
                  Threshold: {wallet.threshold}
                </Text>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-(--color-border)">
                  <div className={cn("h-full rounded-full", barTone(wallet.health))} style={{ width: `${wallet.pct}%` }} />
                </div>
                <Text variant="micro" color="muted" className="mt-1.5 block text-[0.625rem]">
                  {wallet.pct}% of threshold
                </Text>
              </Box>
            </Card>
          ))}
        </Stack>
      </div>

      {/* Settlement Queue */}
      <Card noPadding>
        <Box px={5} py={4} className="border-b border-(--color-border)">
          <Text variant="subtitle" color="primary" weight="semibold" as="p">Settlement Queue</Text>
          <Text variant="micro" color="muted" as="p">{DUMMY_SETTLEMENT_QUEUE.length} items in queue</Text>
        </Box>
        <DataTable
          data={DUMMY_SETTLEMENT_QUEUE}
          columns={queueColumns}
          emptyTitle="No settlements queued"
          emptyMessage="The settlement queue is empty"
        />
      </Card>

      {/* Liquidity Alerts */}
      <Card noPadding>
        <Box px={5} py={4} className="border-b border-(--color-border)">
          <Text variant="subtitle" color="primary" weight="semibold" as="p">Liquidity Alerts</Text>
        </Box>
        <Box px={5} py={1}>
          <Stack gap={0}>
            {DUMMY_LIQUIDITY_ALERTS.map((alert) => {
              const sev = alert.severity === "High"
                ? "text-(--color-danger) bg-(--color-danger-subtle)"
                : alert.severity === "Medium"
                  ? "text-(--color-warning-text) bg-(--color-warning-yellow-bg)"
                  : "text-(--color-success-mid) bg-(--color-success-subtle)";
              const stat = alert.status === "Active"
                ? "text-(--color-danger) bg-(--color-danger-subtle)"
                : alert.status === "Acknowledged"
                  ? "text-(--color-warning-text) bg-(--color-warning-yellow-bg)"
                  : "text-(--color-success-mid) bg-(--color-success-subtle)";
              const dot = alert.severity === "High"
                ? "bg-(--color-danger)"
                : alert.severity === "Medium"
                  ? "bg-(--color-warning)"
                  : "bg-(--color-success-mid)";
              return (
                <Row key={alert.id} justify="between" align="center" gap={4} className="border-b border-(--color-border) py-3.5 last:border-b-0">
                  <Row gap={3} align="center" className="min-w-0">
                    <span className={cn("h-2 w-2 shrink-0 rounded-full", dot)} />
                    <Stack gap={0} className="min-w-0">
                      <Text variant="caption" color="primary" weight="semibold" className="text-[0.75rem]" as="p">{alert.title}</Text>
                      <Text variant="micro" color="muted" className="text-[0.625rem]" as="p">Asset: {alert.asset} · {alert.age}</Text>
                    </Stack>
                  </Row>
                  <Row gap={3} align="center" className="shrink-0">
                    <span className={cn("inline-flex rounded px-2 py-0.5 text-[0.625rem] font-semibold", sev)}>{alert.severity}</span>
                    <span className={cn("inline-flex rounded px-2 py-0.5 text-[0.625rem] font-semibold", stat)}>{alert.status}</span>
                    <button type="button" className="font-geom text-[0.6875rem] font-medium text-(--color-brand) transition-opacity hover:opacity-75 focus:outline-none">
                      Resolve
                    </button>
                  </Row>
                </Row>
              );
            })}
          </Stack>
        </Box>
      </Card>

      {/* Liquidity Trends */}
      <Card>
        <Box px={5} py={4}>
          <Row justify="between" align="center" className="mb-5">
            <Text variant="subtitle" color="primary" weight="semibold" as="p">Liquidity Trends</Text>
            <Row gap={1} align="center" className="rounded-(--radius-sm) bg-(--color-bg-subtle) p-0.5">
              {(["7D", "30D", "90D"] as TrendRange[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRange(r)}
                  className={cn(
                    "rounded-[0.3125rem] px-2.5 py-1 font-geom text-[0.6875rem] font-semibold transition-colors focus:outline-none",
                    r === range ? "bg-(--color-brand) text-white shadow-sm" : "text-(--color-text-secondary) hover:text-(--color-text-primary)",
                  )}
                >
                  {r}
                </button>
              ))}
            </Row>
          </Row>
          <div className="flex h-40 items-end gap-1.5">
            {trend.map((height, index) => (
              <div
                key={index}
                className={cn(
                  "flex-1 rounded-t-[0.1875rem] transition-all",
                  index === trend.length - 1 ? "bg-(--color-brand)" : "bg-[rgba(78,43,204,0.15)]",
                )}
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
          <Text variant="micro" color="muted" className="mt-2 block text-[0.625rem]">Dec 16</Text>
        </Box>
      </Card>
    </Box>
  );
}
