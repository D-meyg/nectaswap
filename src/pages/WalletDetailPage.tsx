import { useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ChevronRight, Copy, Wallet } from "lucide-react";

import { usePageActions, usePageTitle } from "@/layouts/AppLayout";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { StatCard } from "@/components/ui/StatCard";
import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { Row } from "@/components/ui/Row";
import { Stack } from "@/components/ui/Stack";
import { Box } from "@/components/ui/Box";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { AssetIcon } from "@/components/wallets/AssetIcon";
import { DataTable } from "@/components/tables/DataTable";
import { useClipboard } from "@/hooks/ui/useClipboard";
import { DUMMY_WALLET_DETAILS, type WalletDetailData } from "@/lib/dummyData";
import type { ColumnDef } from "@tanstack/react-table";

type SettlementRow = WalletDetailData["settlements"][number];

function settlementTone(status: SettlementRow["status"]) {
  return status === "Pending"
    ? "text-(--color-warning-text) bg-(--color-warning-yellow-bg)"
    : status === "Confirming"
      ? "text-[#0A85D1] bg-[rgba(10,133,209,0.1)]"
      : "text-(--color-success-mid) bg-(--color-success-subtle)";
}

export default function WalletDetailPage() {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { copy } = useClipboard();
  const wallet = DUMMY_WALLET_DETAILS[id];

  usePageTitle(
    wallet ? wallet.name : "Wallet",
    wallet ? `${wallet.type} · ${wallet.health}` : "Wallet detail",
  );

  usePageActions(
    useMemo(
      () => (
        <Button
          variant="secondary"
          size="sm"
          className="h-8 px-3 text-[0.6875rem]"
          onClick={() => navigate("/wallets/liquidity")}
        >
          <ArrowLeft size={13} />
          Back
        </Button>
      ),
      [navigate],
    ),
  );

  const columns = useMemo<ColumnDef<SettlementRow, unknown>[]>(
    () => [
      { accessorKey: "id", header: "ID", enableSorting: false, cell: ({ getValue }) => (<Text variant="caption" color="primary" weight="semibold" className="font-mono">{getValue<string>()}</Text>) },
      {
        accessorKey: "amount",
        header: "Amount",
        enableSorting: false,
        cell: ({ getValue }) => {
          const v = getValue<string>();
          return (
            <Text variant="caption" weight="semibold" className={v.startsWith("-") ? "text-(--color-danger)" : "text-(--color-success-mid)"}>
              {v}
            </Text>
          );
        },
      },
      { accessorKey: "date", header: "Date", enableSorting: false, cell: ({ getValue }) => (<Text variant="caption" color="secondary">{getValue<string>()}</Text>) },
      {
        accessorKey: "status",
        header: "Status",
        enableSorting: false,
        cell: ({ getValue }) => {
          const s = getValue<SettlementRow["status"]>();
          return (<span className={`inline-flex rounded px-2 py-0.5 text-xs font-medium ${settlementTone(s)}`}>{s}</span>);
        },
      },
    ],
    [],
  );

  if (!wallet) {
    return (
      <Box p={6}>
        <EmptyState icon={Wallet} title="Wallet not found" description="This wallet does not exist." />
      </Box>
    );
  }

  return (
    <Box p={6}>
      <Breadcrumbs
        items={[
          { label: "Home", to: "/" },
          { label: "Wallets", to: "/wallets" },
          { label: wallet.name },
        ]}
      />

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Balance" value={wallet.balance} />
        <StatCard label="Min Threshold" value={wallet.min_threshold} valueClassName="text-(--color-warning-text)" />
        <StatCard label="Health" value={wallet.health} valueClassName="text-(--color-success-mid)" />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Stack gap={5} className="lg:col-span-2">
          {/* Wallet address */}
          <Card>
            <Card.Header title="WALLET ADDRESS" className="border-b-0 px-5 pb-1 pt-4 [&_h4]:text-[0.625rem] [&_h4]:uppercase [&_h4]:tracking-[0.06em] [&_h4]:text-(--color-text-tertiary)" />
            <Card.Body className="px-5 pb-5 pt-1">
              <Row justify="between" align="center" gap={3} className="rounded-(--radius-sm) border border-(--color-border) bg-(--color-bg-subtle) px-3.5 py-3">
                <Text variant="caption" color="primary" className="font-mono truncate text-[0.75rem]">{wallet.address}</Text>
                <button
                  type="button"
                  onClick={() => copy(wallet.address)}
                  className="inline-flex shrink-0 items-center gap-1 font-geom text-[0.6875rem] font-medium text-(--color-brand) transition-opacity hover:opacity-75 focus:outline-none"
                >
                  <Copy size={12} />
                  Copy
                </button>
              </Row>
            </Card.Body>
          </Card>

          {/* Asset holdings */}
          <Card>
            <Card.Header title="Asset Holdings" className="border-b-0 px-5 pb-1 pt-4 [&_h4]:text-[0.8125rem] [&_h4]:leading-5" />
            <Card.Body className="px-5 pb-4 pt-1">
              <Stack gap={0}>
                {wallet.holdings.map((holding) => (
                  <Row key={holding.symbol} justify="between" align="center" className="border-b border-(--color-border) py-3 last:border-b-0">
                    <Row gap={3} align="center">
                      <AssetIcon symbol={holding.symbol} size="sm" />
                      <Stack gap={0}>
                        <Text variant="caption" color="brand" weight="semibold" className="text-[0.75rem]" as="p">{holding.symbol}</Text>
                        <Text variant="micro" color="muted" className="text-[0.625rem]" as="p">{holding.amount}</Text>
                      </Stack>
                    </Row>
                    <Text variant="caption" color="primary" weight="semibold" className="text-[0.75rem]">{holding.value}</Text>
                  </Row>
                ))}
              </Stack>
            </Card.Body>
          </Card>

          {/* Recent settlements */}
          <Card noPadding>
            <Box px={5} py={4} className="border-b border-(--color-border)">
              <Text variant="subtitle" color="primary" weight="semibold" as="p">Recent Settlements</Text>
            </Box>
            <DataTable
              data={wallet.settlements}
              columns={columns}
              emptyTitle="No settlements"
              emptyMessage="No recent settlements for this wallet"
            />
          </Card>
        </Stack>

        <Stack gap={5}>
          <Card>
            <Card.Header title="QUICK LINKS" className="border-b-0 px-4 pb-1 pt-3 [&_h4]:text-[0.625rem] [&_h4]:uppercase [&_h4]:tracking-[0.06em] [&_h4]:text-(--color-text-tertiary)" />
            <Card.Body className="px-4 pb-3 pt-0">
              <Link to="/wallets/liquidity" className="group flex items-center justify-between py-2.5">
                <Text variant="caption" color="brand" weight="semibold" className="text-[0.75rem]">Liquidity Monitor</Text>
                <ChevronRight size={13} className="shrink-0 text-(--color-text-muted) transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Card.Body>
          </Card>

          <Card>
            <Card.Header title="ACTIONS" className="border-b-0 px-4 pb-1 pt-3 [&_h4]:text-[0.625rem] [&_h4]:uppercase [&_h4]:tracking-[0.06em] [&_h4]:text-(--color-text-tertiary)" />
            <Card.Body className="px-4 pb-4 pt-1">
              <Stack gap={2}>
                <Button variant="secondary" size="sm" className="h-9 w-full justify-center text-xs">Sweep Funds</Button>
                <Button
                  size="sm"
                  className="h-9 w-full justify-center border-(--color-warning-border) bg-(--color-warning-yellow-bg) text-xs text-(--color-warning-text) hover:opacity-90"
                >
                  Set Threshold Alert
                </Button>
              </Stack>
            </Card.Body>
          </Card>
        </Stack>
      </div>
    </Box>
  );
}
