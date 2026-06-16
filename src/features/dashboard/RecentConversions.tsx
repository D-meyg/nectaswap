import { useMemo } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Text } from "@/components/ui/Text";
import { DataTable } from "@/components/tables/DataTable";
import { formatNGN } from "@/lib/utils";
import type { RecentConversion } from "@/api/types";
import type { ColumnDef } from "@tanstack/react-table";

interface RecentConversionsProps {
  conversions: RecentConversion[];
  loading?: boolean;
}

export function RecentConversions({
  conversions,
  loading,
}: RecentConversionsProps) {
  const columns = useMemo<ColumnDef<RecentConversion, unknown>[]>(
    () => [
      {
        accessorKey: "user",
        header: "User",
        cell: ({ getValue }) => (
          <Text variant="caption" color="primary" weight="medium">
            {getValue<string>()}
          </Text>
        ),
      },
      {
        accessorKey: "crypto",
        header: "Crypto",
        cell: ({ getValue }) => (
          <span className="inline-flex items-center rounded-[var(--radius-sm)] bg-[var(--color-bg-subtle)] border border-[var(--color-border)] px-2 py-0.5">
            <Text variant="label" color="secondary" weight="medium">
              {getValue<string>()}
            </Text>
          </span>
        ),
      },
      {
        accessorKey: "amount_ngn",
        header: "Amount (NGN)",
        cell: ({ getValue }) => (
          <Text variant="caption" color="primary" weight="medium">
            {formatNGN(getValue<number>())}
          </Text>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => {
          const v = getValue<string>();
          const variant =
            v === "completed"
              ? "success"
              : v === "pending"
                ? "warning"
                : "danger";
          return <Badge variant={variant} label={v} />;
        },
      },
      {
        accessorKey: "time",
        header: "Time",
        cell: ({ getValue }) => (
          <Text variant="micro" color="muted">
            {getValue<string>()}
          </Text>
        ),
      },
    ],
    [],
  );

  return (
    <Card noPadding>
      <Card.Header
        title="Recent Conversions"
        subtitle="Last 10 crypto → Naira transactions"
      />
      <DataTable
        data={conversions}
        columns={columns}
        loading={loading}
        emptyTitle="No recent conversions"
        emptyMessage=""
      />
    </Card>
  );
}
