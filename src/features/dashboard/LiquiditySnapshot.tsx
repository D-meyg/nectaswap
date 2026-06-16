import { useMemo } from "react";
import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { DataTable } from "@/components/tables/DataTable";
import { formatNGN } from "@/lib/utils";
import type { WalletAsset } from "@/api/types";
import type { ColumnDef } from "@tanstack/react-table";

interface LiquiditySnapshotProps {
  assets: WalletAsset[];
  loading?: boolean;
}

export function LiquiditySnapshot({ assets, loading }: LiquiditySnapshotProps) {
  const columns = useMemo<ColumnDef<WalletAsset, unknown>[]>(
    () => [
      {
        accessorKey: "asset",
        header: "Asset",
        cell: ({ getValue }) => (
          <Text variant="caption" color="primary" weight="medium">
            {getValue<string>()}
          </Text>
        ),
      },
      {
        accessorKey: "balance",
        header: "Balance",
        cell: ({ getValue }) => (
          <Text variant="caption" color="primary">
            {getValue<number>().toLocaleString()}
          </Text>
        ),
      },
      {
        accessorKey: "usd_value",
        header: "USD Value",
        cell: ({ getValue }) => (
          <Text variant="caption" color="secondary">
            {formatNGN(getValue<number>())}
          </Text>
        ),
      },
      {
        accessorKey: "threshold",
        header: "Threshold",
        cell: ({ getValue }) => {
          const pct = Math.min(100, getValue<number>());
          return (
            <div className="flex items-center gap-2 w-40">
              <ProgressBar value={pct} max={100} className="flex-1" />
              <Text variant="micro" color="muted">
                {pct}%
              </Text>
            </div>
          );
        },
      },
      {
        accessorKey: "health",
        header: "Status",
        cell: ({ getValue }) => {
          const h = getValue<string>();
          const variant =
            h === "HEALTHY" ? "success" : h === "LOW" ? "warning" : "danger";
          return <Badge variant={variant} label={h} />;
        },
      },
    ],
    [],
  );

  return (
    <Card noPadding>
      <Card.Header
        title="Liquidity Snapshot"
        subtitle="Balance near thresholds"
      />
      <DataTable
        data={assets}
        columns={columns}
        loading={loading}
        emptyTitle="No wallet data"
        emptyMessage=""
      />
    </Card>
  );
}
