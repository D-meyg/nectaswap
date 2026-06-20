import { useMemo } from "react";
import { DataTable } from "@/components/tables/DataTable";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { useTransactions } from "@/hooks/queries/useTransactions";
import { DUMMY_USER_TRANSACTIONS } from "@/lib/dummyData";
import { formatDateTime, formatNGN } from "@/lib/utils";
import type { ColumnDef } from "@tanstack/react-table";
import type { Transaction } from "@/api/types";

interface TransactionsTabProps {
  userId: string;
}

export function TransactionsTab({ userId }: TransactionsTabProps) {
  const { data, isLoading } = useTransactions({ search: userId });

  const columns = useMemo<ColumnDef<Transaction, unknown>[]>(
    () => [
      {
        accessorKey: "id",
        header: "Transaction ID",
        cell: ({ getValue }) => (
          <Text variant="caption" color="secondary" className="font-mono text-[12px]">
            {getValue<string>()}
          </Text>
        ),
      },
      {
        accessorKey: "time",
        header: "Date",
        cell: ({ getValue }) => (
          <Text variant="caption" color="secondary" className="text-[12px]">
            {formatDateTime(getValue<string>())}
          </Text>
        ),
      },
      {
        accessorKey: "crypto",
        header: "Type",
        cell: ({ getValue }) => (
          <Text variant="caption" color="primary" weight="medium" className="text-[12px]">
            {getValue<string>()} - NGN
          </Text>
        ),
      },
      {
        accessorKey: "amount_ngn",
        header: "Amount (NGN)",
        cell: ({ getValue }) => (
          <Text variant="caption" color="primary" weight="semibold" className="text-[12px]">
            {formatNGN(getValue<number>())}
          </Text>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => {
          const value = getValue<string>();
          const variant =
            value === "completed" ? "success" : value === "pending" ? "warning" : "danger";

          return <Badge variant={variant} label={value} />;
        },
      },
    ],
    [],
  );

  const rows: Transaction[] =
    Array.isArray(data) && data.length ? (data as Transaction[]) : DUMMY_USER_TRANSACTIONS;

  return (
    <Card noPadding>
      <Card.Header
        title="Crypto - Naira Conversions"
        className="px-4 py-3 [&_h4]:text-[12px] [&_h4]:leading-4"
      />
      <DataTable
        data={rows}
        columns={columns}
        loading={isLoading && rows.length === 0}
        emptyTitle="No transactions"
        emptyMessage="This user has no transactions yet"
      />
    </Card>
  );
}
