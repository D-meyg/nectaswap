import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { DataTable } from "@/components/tables/DataTable";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { Stack } from "@/components/ui/Stack";
import { Button } from "@/components/ui/Button";
import { Eye } from "lucide-react";
import { useUserTransactions } from "@/hooks/queries/useUserDetail";
import type { ColumnDef } from "@tanstack/react-table";

interface TransactionsTabProps {
  userId: string;
}

interface TxRow {
  transaction_id: string;
  reference: string;
  created_at: string;
  type: string;
  amount: string;
  fee: string;
  status: string;
  description: string;
}

function str(value: unknown, fallback = "N/A") {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function formatDate(value: unknown) {
  const raw = str(value, "");
  if (!raw || raw === "N/A") return "N/A";
  try {
    return new Intl.DateTimeFormat("en-NG", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(raw));
  } catch {
    return raw;
  }
}

function normalizeStatus(value: unknown) {
  const s = str(value, "pending").toLowerCase();
  if (s === "success" || s === "completed") return "completed";
  if (s === "failed" || s === "failure") return "failed";
  return "pending";
}

function normalizeTx(item: unknown): TxRow {
  const tx = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
  const receipt = tx.receipt && typeof tx.receipt === "object"
    ? (tx.receipt as Record<string, unknown>)
    : {};

  return {
    transaction_id: str(tx.transaction_id ?? tx.id, ""),
    reference: str(tx.reference ?? receipt.reference, "N/A"),
    created_at: str(tx.created_at ?? tx.updated_at, ""),
    type: str(tx.kind ?? tx.method ?? tx.transaction_type ?? receipt.method, "transaction").toUpperCase(),
    amount: str(tx.amount ?? receipt.amount, "0"),
    fee: str(tx.fee ?? receipt.fee, "0"),
    status: normalizeStatus(tx.status ?? receipt.status),
    description: str(tx.description ?? receipt.note ?? receipt.title, "N/A"),
  };
}

export function TransactionsTab({ userId }: TransactionsTabProps) {
  const navigate = useNavigate();
  const { data, isLoading } = useUserTransactions(userId);

  const rows = useMemo<TxRow[]>(
    () => (Array.isArray(data) ? data.map(normalizeTx) : []),
    [data],
  );

  const columns = useMemo<ColumnDef<TxRow, unknown>[]>(
    () => [
      {
        accessorKey: "reference",
        header: "Reference",
        cell: ({ row }) => (
          <Stack gap={0}>
            <Text variant="caption" color="secondary" className="font-mono text-xs">
              {row.original.reference}
            </Text>
            <Text variant="micro" color="muted" className="text-[0.625rem]">
              {row.original.transaction_id}
            </Text>
          </Stack>
        ),
      },
      {
        accessorKey: "created_at",
        header: "Date",
        cell: ({ getValue }) => (
          <Text variant="caption" color="secondary" className="text-xs">
            {formatDate(getValue<string>())}
          </Text>
        ),
      },
      {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => (
          <Stack gap={0}>
            <Text variant="caption" color="primary" weight="medium" className="text-xs">
              {row.original.type}
            </Text>
            <Text variant="micro" color="muted" className="text-[0.625rem]">
              {row.original.description}
            </Text>
          </Stack>
        ),
      },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => (
          <Stack gap={0}>
            <Text variant="caption" color="primary" weight="semibold" className="text-xs">
              ₦{Number(row.original.amount).toLocaleString()}
            </Text>
            <Text variant="micro" color="muted" className="text-[0.625rem]">
              Fee: ₦{Number(row.original.fee).toLocaleString()}
            </Text>
          </Stack>
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
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => {
              const txId = row.original.transaction_id || row.original.reference;
              if (txId) navigate(`/transactions/${txId}`);
            }}
          >
            <Eye size={13} />
          </Button>
        ),
      },
    ],
    [navigate],
  );

  return (
    <Card noPadding>
      <Card.Header
        title="Transactions"
        className="px-4 py-3 [&_h4]:text-xs [&_h4]:leading-4"
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
