import { useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, CreditCard } from "lucide-react";

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
import { DataTable } from "@/components/tables/DataTable";
import { DUMMY_ASSET_DETAILS, type AssetDetailData } from "@/lib/dummyData";
import type { ColumnDef } from "@tanstack/react-table";

type TxRow = AssetDetailData["transactions"][number];

export default function AssetDetailPage() {
  const { symbol = "" } = useParams<{ symbol: string }>();
  const navigate = useNavigate();
  const asset = DUMMY_ASSET_DETAILS[symbol.toUpperCase()];

  usePageTitle(
    asset ? `${asset.symbol} — ${asset.name}` : "Asset",
    asset ? `${asset.name} · ${asset.decimals} decimals` : "Asset detail",
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

  const columns = useMemo<ColumnDef<TxRow, unknown>[]>(
    () => [
      { accessorKey: "id", header: "ID", enableSorting: false, cell: ({ getValue }) => (<Text variant="caption" color="primary" weight="semibold" className="font-mono">{getValue<string>()}</Text>) },
      { accessorKey: "type", header: "Type", enableSorting: false, cell: ({ getValue }) => (<Text variant="caption" color="secondary">{getValue<string>()}</Text>) },
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
        cell: ({ getValue }) => (
          <span className="inline-flex rounded px-2 py-0.5 text-xs font-medium text-(--color-success-mid) bg-(--color-success-subtle)">
            {getValue<string>()}
          </span>
        ),
      },
    ],
    [],
  );

  if (!asset) {
    return (
      <Box p={6}>
        <EmptyState icon={CreditCard} title="Asset not found" description="This asset does not exist or is not tracked." />
      </Box>
    );
  }

  return (
    <Box p={6}>
      <Breadcrumbs
        items={[
          { label: "Home", to: "/" },
          { label: "Wallets", to: "/wallets" },
          { label: "Assets", to: "/wallets/liquidity" },
          { label: asset.symbol },
        ]}
      />

      <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Balance" value={asset.total_balance} delta={asset.change_24h} deltaLabel="24h" />
        <StatCard label="Available" value={asset.available} valueClassName="text-(--color-success-mid)" />
        <StatCard label="Locked" value={asset.locked} valueClassName="text-(--color-danger)" />
        <StatCard label="Total Value (NGN)" value={asset.total_value_ngn} valueClassName="text-(--color-brand)" />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card noPadding className="lg:col-span-2 self-start">
          <Box px={5} py={4} className="border-b border-(--color-border)">
            <Text variant="subtitle" color="primary" weight="semibold" as="p">Recent Transactions</Text>
          </Box>
          <DataTable
            data={asset.transactions}
            columns={columns}
            emptyTitle="No transactions"
            emptyMessage="No recent transactions for this asset"
          />
        </Card>

        <Card>
          <Card.Header title="WALLET DISTRIBUTION" className="border-b-0 px-4 pb-1 pt-3 [&_h4]:text-[0.625rem] [&_h4]:uppercase [&_h4]:tracking-[0.06em] [&_h4]:text-(--color-text-tertiary)" />
          <Card.Body className="px-4 pb-3 pt-0">
            <Stack gap={0}>
              {asset.distribution.map((row) => (
                <Row key={row.name} justify="between" align="center" className="border-b border-(--color-border) py-3 last:border-b-0">
                  <Text variant="caption" color="brand" weight="semibold" className="text-[0.75rem]">{row.name}</Text>
                  <Text variant="caption" color="primary" weight="semibold" className="text-[0.75rem]">{row.amount}</Text>
                </Row>
              ))}
            </Stack>
            <Link to="/wallets/liquidity" className="mt-3 inline-flex items-center gap-1.5 font-geom text-[0.6875rem] font-medium text-(--color-brand) transition-opacity hover:opacity-75">
              View Liquidity Monitor
              <ArrowRight size={12} />
            </Link>
          </Card.Body>
        </Card>
      </div>
    </Box>
  );
}
