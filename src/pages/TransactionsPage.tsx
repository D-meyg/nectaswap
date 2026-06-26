﻿import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  Clock,
  Download,
  Eye,
  Filter,
  RotateCcw,
  XCircle,
} from "lucide-react";
import type { ReactNode } from "react";
import type { ColumnDef } from "@tanstack/react-table";

import { usePageTitle } from "@/layouts/AppLayout";
import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { Row } from "@/components/ui/Row";
import { Stack } from "@/components/ui/Stack";
import { Box } from "@/components/ui/Box";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/tables/DataTable";
import { SearchInput } from "@/components/forms/SearchInput";
import { Modal } from "@/components/ui/Modal";
import {
  useTransactions,
  usePendingTransactionApprovals,
  useFailedTransactions,
} from "@/hooks/queries/useTransactions";

type PageMode = "all" | "pending" | "failed";

interface PendingTx {
  id: string;
  timestamp: string;
  user: string;
  userId: string;
  amount: string;
  crypto: string;
  reason: string;
  risk: "low" | "medium" | "high";
  waitTime: string;
}

interface FailedTx {
  id: string;
  timestamp: string;
  user: string;
  userId: string;
  amount: string;
  crypto: string;
  failureReason: string;
  errorCode: string;
  retryable: boolean;
}

interface TransactionRow {
  id: string;
  time: string;
  user_name: string;
  user_id: string;
  type: string;
  rate: string;
  crypto_amount: string;
  ngn_amount: string;
  fee: string;
  status: "completed" | "pending" | "failed";
  date: string;
}

function toNumber(value: unknown) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatNaira(value: unknown) {
  return `₦${toNumber(value).toLocaleString()}`;
}

function stringValue(value: unknown, fallback = "N/A") {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function dateParts(value: unknown) {
  const raw = stringValue(value, "");
  const [date = ""] = raw.replace("T", " ").split(".");
  const [datePart = "", timePart = ""] = date.split(" ");
  return { date: datePart || "N/A", time: timePart || "" };
}

function normalizeTransaction(value: unknown): TransactionRow {
  const item =
    value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  const user =
    item.user && typeof item.user === "object"
      ? (item.user as Record<string, unknown>)
      : {};
  const created = dateParts(item.created_at ?? item.timestamp ?? item.date);
  const receipt =
    item.receipt && typeof item.receipt === "object"
      ? (item.receipt as Record<string, unknown>)
      : {};
  const status = stringValue(item.status ?? receipt.status, "pending").toLowerCase();
  const rawType = stringValue(
    item.kind ?? item.method ?? item.transaction_type ?? receipt.method,
    "transaction",
  );
  const amount = item.amount ?? receipt.amount ?? item.ngn_amount ?? item.amount_ngn;
  const fee = item.fee ?? receipt.fee;

  return {
    id: stringValue(item.reference ?? receipt.reference ?? item.transaction_id ?? item.id, "TX-N/A"),
    time: created.time,
    user_name: stringValue(item.sender ?? receipt.sender ?? item.user_name ?? item.customer_name ?? user.full_name ?? user.name, "Unknown User"),
    user_id: stringValue(item.user_id ?? user.user_id ?? user.id, "N/A"),
    type: rawType.toUpperCase(),
    rate: stringValue(item.crypto_currency ?? item.payment_method ?? item.beneficiary_type, "to NGN"),
    crypto_amount: stringValue(item.crypto_amount ?? item.amount_crypto ?? item.asset_value, "0"),
    ngn_amount: formatNaira(amount),
    fee: `Fee: ${formatNaira(fee)}`,
    status: (status === "success" ? "completed" : status) as TransactionRow["status"],
    date: created.date,
  };
}

function normalizePending(value: unknown): PendingTx {
  const item =
    value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  const user =
    item.user && typeof item.user === "object"
      ? (item.user as Record<string, unknown>)
      : {};
  const created = dateParts(item.created_at ?? item.timestamp ?? item.date);

  return {
    id: stringValue(item.id ?? item.transaction_id, "TX-N/A"),
    timestamp: `${created.date} ${created.time}`.trim(),
    user: stringValue(item.user_name ?? user.full_name ?? user.name, "Unknown User"),
    userId: stringValue(item.user_id ?? user.user_id ?? user.id, "N/A"),
    amount: item.amount ?? item.ngn_amount ? formatNaira(item.amount ?? item.ngn_amount) : "₦0",
    crypto: stringValue(item.crypto ?? item.crypto_amount ?? item.asset, "N/A"),
    reason: stringValue(item.reason ?? item.review_reason, "Manual review required"),
    risk: stringValue(item.risk ?? item.risk_level, "medium").toLowerCase() as PendingTx["risk"],
    waitTime: stringValue(item.wait_time ?? item.waitTime, "N/A"),
  };
}

function normalizeFailed(value: unknown): FailedTx {
  const item =
    value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  const created = dateParts(item.created_at ?? item.timestamp ?? item.date);

  return {
    id: stringValue(item.id ?? item.transaction_id, "TX-N/A"),
    timestamp: `${created.date} ${created.time}`.trim(),
    user: stringValue(item.user_name ?? item.user, "Unknown User"),
    userId: stringValue(item.user_id, "N/A"),
    amount: item.amount ?? item.ngn_amount ? formatNaira(item.amount ?? item.ngn_amount) : "₦0",
    crypto: stringValue(item.crypto ?? item.crypto_amount ?? item.asset, "N/A"),
    failureReason: stringValue(item.failureReason ?? item.failure_reason ?? item.reason, "N/A"),
    errorCode: stringValue(item.errorCode ?? item.error_code, "N/A"),
    retryable: Boolean(item.retryable),
  };
}


function getMode(pathname: string): PageMode {
  if (pathname.endsWith("/pending")) return "pending";
  if (pathname.endsWith("/failed")) return "failed";
  return "all";
}

function StatusPill({
  children,
  tone,
}: {
  children: string;
  tone: "success" | "warning" | "danger" | "neutral";
}) {
  const toneClass = {
    success: "bg-(--color-success-bg) text-(--color-success-dark)",
    warning: "bg-(--color-warning-subtle) text-(--color-warning-dark)",
    danger: "bg-(--color-danger-subtle) text-(--color-danger)",
    neutral: "bg-(--color-bg-subtle) text-(--color-text-secondary)",
  }[tone];

  return (
    <span className={`inline-flex rounded-sm px-2 py-1 font-geom text-[0.625rem] font-semibold leading-none ${toneClass}`}>
      {children}
    </span>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon?: ReactNode;
}) {
  return (
    <Card>
      <Box px={4} py={4}>
        <Row justify="between" align="center">
          <Stack gap={1}>
            <Text variant="micro" color="muted" className="text-[0.625rem] leading-3">
              {label}
            </Text>
            <Text variant="heading" color="primary" weight="semibold" className="text-[1.375rem] leading-7">
              {value}
            </Text>
          </Stack>
          {icon}
        </Row>
      </Box>
    </Card>
  );
}

function FilterBar({
  search,
  setSearch,
  showExport = true,
}: {
  search: string;
  setSearch: (value: string) => void;
  showExport?: boolean;
}) {
  return (
    <Card className="mb-4 rounded-[8px] shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
      <Box px={5} py={5}>
        <Row gap={4} align="center">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search by transaction ID or user..."
            className="min-w-0 flex-1 [&_input]:bg-(--color-bg-subtle)"
          />
          <Button variant="secondary" size="sm" className="h-9 min-w-[7.5rem] justify-center text-[0.75rem]">
            All Status
          </Button>
          <Button variant="secondary" size="sm" className="h-9 min-w-[7.5rem] justify-center text-[0.75rem]">
            All Types
          </Button>
          {showExport && (
            <Button variant="secondary" size="sm" className="h-9 px-4 text-[0.75rem]">
              <Download size={13} />
              Export
            </Button>
          )}
          <Button variant="secondary" size="sm" className="h-9 px-4 text-[0.75rem]">
            <Filter size={13} />
            More Filters
          </Button>
        </Row>
      </Box>
    </Card>
  );
}

function FailedDetailsModal({
  tx,
  onClose,
}: {
  tx: FailedTx | null;
  onClose: () => void;
}) {
  if (!tx) return null;

  return (
    <Modal open={Boolean(tx)} onClose={onClose} size="lg" className="rounded-lg bg-white shadow-xl">
      <Modal.Header
        title="Failed Transaction Details"
        subtitle="Review and resolve failed transaction"
        onClose={onClose}
        className="px-5 py-4 [&_h4]:text-xl [&_h4]:leading-6 [&_span]:text-[0.6875rem]"
      />
      <Modal.Body className="px-5 py-4">
        <Stack gap={4}>
          <Card>
            <Card.Header
              title="Transaction Details"
              className="border-b-0 px-4 pb-2 pt-3 [&_h4]:text-xs"
            />
            <Card.Body className="grid grid-cols-2 gap-x-16 gap-y-4 px-4 pb-4 pt-0">
              <Info label="Transaction ID" value={tx.id} />
              <Info label="Timestamp" value={tx.timestamp} />
              <Info label="User" value={tx.user} />
              <Info label="User ID" value={`#${tx.userId}`} />
              <Info label="Crypto Amount" value={tx.crypto} />
              <Info label="NGN Amount" value={tx.amount} />
            </Card.Body>
          </Card>

          <Card className="border-(--color-danger-muted) bg-(--color-danger-subtle)">
            <Card.Header
              title="Failure Information"
              className="border-b-0 px-4 pb-2 pt-3 [&_h4]:text-xs"
            />
            <Card.Body className="space-y-3 px-4 pb-4 pt-0">
              <Info label="Error Code" value={tx.errorCode} valueClassName="text-(--color-danger)" />
              <Info label="Failure Reason" value={tx.failureReason} />
              <Info label="Retry Status" value={tx.retryable ? "Retryable" : "Non-Retryable"} valueClassName={tx.retryable ? "text-(--color-success-dark)" : "text-(--color-text-secondary)"} />
            </Card.Body>
          </Card>
        </Stack>
      </Modal.Body>
      <Modal.Footer className="px-5 py-4">
        <Button variant="secondary" size="sm" className="h-8 px-4 text-[0.6875rem]" onClick={onClose}>
          Close
        </Button>
        <Button size="sm" className="h-8 px-4 text-[0.6875rem]">
          <RotateCcw size={13} />
          Retry Transaction
        </Button>
        <Button variant="secondary" size="sm" className="h-8 px-4 text-[0.6875rem]">
          <AlertTriangle size={13} />
          Manual Resolve
        </Button>
        <Button size="sm" className="h-8 bg-[#F97316] px-4 text-[0.6875rem] text-white hover:bg-[#EA580C]">
          Issue Refund
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

function Info({
  label,
  value,
  valueClassName = "",
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <Stack gap={0}>
      <Text variant="micro" color="muted" className="text-[0.625rem] leading-3">
        {label}
      </Text>
      <Text variant="caption" color="primary" weight="semibold" className={`text-xs leading-4 ${valueClassName}`}>
        {value}
      </Text>
    </Stack>
  );
}

export default function TransactionsPage() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const mode = getMode(pathname);
  const [search, setSearch] = useState("");
  const [selectedFailed, setSelectedFailed] = useState<FailedTx | null>(null);

  const title =
    mode === "pending"
      ? "Pending Approvals"
      : mode === "failed"
        ? "Failed Transactions"
        : "Transactions & Conversions";
  const subtitle =
    mode === "pending"
      ? "Review and approve transactions requiring manual intervention."
      : mode === "failed"
        ? "Investigate and resolve failed transaction cases."
        : "Crypto-to-Naira conversion tracking and resolution";

  usePageTitle(title, subtitle);

  const { data: apiAll = [] } = useTransactions({ search: search || undefined });
  const { data: apiPending = [] } = usePendingTransactionApprovals();
  const { data: apiFailed = [] } = useFailedTransactions();

  const allRows = useMemo(
    () => (Array.isArray(apiAll) ? apiAll.map(normalizeTransaction) : []),
    [apiAll],
  );
  const pendingTransactions = useMemo(
    () => (Array.isArray(apiPending) ? apiPending.map(normalizePending) : []),
    [apiPending],
  );
  const failedTransactions = useMemo(
    () => (Array.isArray(apiFailed) ? apiFailed.map(normalizeFailed) : []),
    [apiFailed],
  );


  console.log(failedTransactions);

  const pendingCols = useMemo<ColumnDef<PendingTx, unknown>[]>(
    () => [
      {
        accessorKey: "id",
        header: "Transaction",
        cell: ({ row }) => (
          <Stack gap={0}>
            <Text variant="caption" color="primary" className="text-xs leading-4">{row.original.id}</Text>
            <Text variant="micro" color="muted" className="text-[0.625rem] leading-3">{row.original.timestamp}</Text>
          </Stack>
        ),
      },
      {
        accessorKey: "user",
        header: "User",
        cell: ({ row }) => (
          <Stack gap={0}>
            <Text variant="caption" color="primary" weight="semibold" className="text-xs leading-4">{row.original.user}</Text>
            <Text variant="micro" color="muted" className="text-[0.625rem] leading-3">ID: {row.original.userId}</Text>
          </Stack>
        ),
      },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => (
          <Stack gap={0}>
            <Text variant="caption" color="primary" weight="semibold" className="text-xs">{row.original.amount}</Text>
            <Text variant="micro" color="muted" className="text-[0.625rem]">{row.original.crypto}</Text>
          </Stack>
        ),
      },
      { accessorKey: "reason", header: "Reason" },
      {
        accessorKey: "risk",
        header: "Risk",
        cell: ({ getValue }) => {
          const value = getValue<PendingTx["risk"]>();
          return <StatusPill tone={value === "high" ? "danger" : value === "medium" ? "warning" : "success"}>{value}</StatusPill>;
        },
      },
      { accessorKey: "waitTime", header: "Wait Time" },
      {
        id: "actions",
        header: "Actions",
        cell: () => (
          <Button size="sm" className="h-7 px-3 text-[0.6875rem]">
            <Eye size={12} />
            Review
          </Button>
        ),
      },
    ],
    [],
  );

  const failedCols = useMemo<ColumnDef<FailedTx, unknown>[]>(
    () => [
      {
        accessorKey: "id",
        header: "Transaction",
        cell: ({ row }) => (
          <Stack gap={0}>
            <Text variant="caption" color="primary" className="text-xs leading-4">{row.original.id}</Text>
            <Text variant="micro" color="muted" className="text-[0.625rem] leading-3">{row.original.timestamp}</Text>
          </Stack>
        ),
      },
      {
        accessorKey: "user",
        header: "User",
        cell: ({ row }) => (
          <Stack gap={0}>
            <Text variant="caption" color="primary" weight="semibold" className="text-xs leading-4">{row.original.user}</Text>
            <Text variant="micro" color="muted" className="text-[0.625rem] leading-3">ID: {row.original.userId}</Text>
          </Stack>
        ),
      },
      { accessorKey: "amount", header: "Amount" },
      { accessorKey: "failureReason", header: "Failure Reason" },
      {
        accessorKey: "errorCode",
        header: "Error Code",
        cell: ({ getValue }) => <StatusPill tone="danger">{getValue<string>()}</StatusPill>,
      },
      {
        accessorKey: "retryable",
        header: "Status",
        cell: ({ getValue }) =>
          getValue<boolean>() ? <StatusPill tone="success">Retryable</StatusPill> : <StatusPill tone="neutral">Non-Retryable</StatusPill>,
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <Button size="sm" className="h-7 px-3 text-[0.6875rem]" onClick={() => setSelectedFailed(row.original)}>
            <Eye size={12} />
            Review
          </Button>
        ),
      },
    ],
    [],
  );

  const allCols = useMemo<ColumnDef<TransactionRow, unknown>[]>(
    () => [
      {
        accessorKey: "id",
        header: "Transaction ID",
        cell: ({ row }) => (
          <Stack gap={0}>
            <Text variant="caption" color="primary" weight="semibold" className="text-xs">{row.original.id}</Text>
            <Text variant="micro" color="muted" className="text-[0.625rem]">{row.original.time}</Text>
          </Stack>
        ),
      },
      {
        accessorKey: "user_name",
        header: "User",
        cell: ({ row }) => (
          <Stack gap={0}>
            <Text variant="caption" color="primary" weight="semibold" className="text-xs">{row.original.user_name}</Text>
            <Text variant="micro" color="muted" className="text-[0.625rem]">ID: {row.original.user_id.slice(0, 8)}</Text>
          </Stack>
        ),
      },
      {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => (
          <Stack gap={0}>
            <Text variant="caption" color="primary" weight="semibold" className="text-xs">{row.original.type}</Text>
            <Text variant="micro" color="muted" className="text-[0.625rem]">{row.original.rate}</Text>
          </Stack>
        ),
      },
      {
        accessorKey: "crypto_amount",
        header: "Crypto Amount",
        cell: ({ row }) => (
          <Stack gap={0}>
            <Text variant="caption" color="primary" weight="semibold" className="text-xs">{row.original.crypto_amount}</Text>
            <Text variant="micro" color="muted" className="text-[0.625rem]">{row.original.rate}</Text>
          </Stack>
        ),
      },
      {
        accessorKey: "ngn_amount",
        header: "NGN Amount",
        cell: ({ row }) => (
          <Stack gap={0}>
            <Text variant="caption" color="primary" weight="semibold" className="text-xs">{row.original.ngn_amount}</Text>
            <Text variant="micro" color="muted" className="text-[0.625rem]">{row.original.fee}</Text>
          </Stack>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => {
          const value = getValue<TransactionRow["status"]>();
          return <StatusPill tone={value === "completed" ? "success" : value === "pending" ? "warning" : "danger"}>{value}</StatusPill>;
        },
      },
      {
        accessorKey: "date",
        header: "Date",
        cell: ({ row }) => (
          <Stack gap={0}>
            <Text variant="caption" color="primary" className="text-xs">{row.original.date}</Text>
            <Text variant="micro" color="muted" className="text-[0.625rem]">{row.original.time}</Text>
          </Stack>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => navigate(`/transactions/${row.original.id}`)}
          >
            <Eye size={14} />
          </Button>
        ),
      },
    ],
    [navigate],
  );

  return (
    <Box className="min-h-full w-full px-4 py-6 lg:px-5 xl:px-6">
      {mode === "pending" && (
        <div className="mb-4 grid grid-cols-4 gap-4">
          <StatCard label="Pending Approval" value={pendingTransactions.length} icon={<Clock size={20} className="text-(--color-warning)" />} />
          <StatCard label="Total Value" value={formatNaira(pendingTransactions.reduce((sum, tx) => sum + toNumber(tx.amount.replace(/[^\d.]/g, "")), 0))} />
          <StatCard label="High Risk" value={pendingTransactions.filter((t) => t.risk === "high").length} icon={<AlertTriangle size={20} className="text-(--color-danger)" />} />
          <StatCard label="Avg Wait Time" value={pendingTransactions[0]?.waitTime ?? "N/A"} icon={<Clock size={20} className="text-(--color-text-secondary)" />} />
        </div>
      )}

      {mode === "failed" && (
        <div className="mb-4 grid grid-cols-4 gap-4">
          <StatCard label="Failed Transactions" value={failedTransactions.length} icon={<XCircle size={20} className="text-(--color-danger)" />} />
          <StatCard label="Retryable" value={failedTransactions.filter((t) => t.retryable).length} icon={<RotateCcw size={20} className="text-(--color-success-dark)" />} />
          <StatCard label="Non-Retryable" value={failedTransactions.filter((t) => !t.retryable).length} icon={<AlertTriangle size={20} className="text-(--color-warning-dark)" />} />
          <StatCard label="Total Value" value={formatNaira(failedTransactions.reduce((sum, tx) => sum + toNumber(tx.amount.replace(/[^\d.]/g, "")), 0))} />
        </div>
      )}

      {mode !== "pending" && <FilterBar search={search} setSearch={setSearch} />}

      <Card noPadding className="rounded-[8px]">
        <Box px={5} py={4} className="border-b border-(--color-border)">
          <Text variant="subtitle" color="primary" weight="semibold" className="text-xs leading-4">
            {mode === "pending" ? "Pending Approvals" : mode === "failed" ? "Failed Transactions" : "All Transactions"}
          </Text>
          <Text variant="micro" color="muted" className="text-[0.625rem] leading-3">
            {mode === "pending"
              ? "Transactions requiring manual review and approval"
              : mode === "failed"
                ? `${failedTransactions.length} failed transactions requiring attention`
                : `${allRows.length} transactions found`}
          </Text>
        </Box>
        {mode === "pending" ? (
          <DataTable data={pendingTransactions} columns={pendingCols} />
        ) : mode === "failed" ? (
          <DataTable data={failedTransactions} columns={failedCols} />
        ) : (
          <>
            <DataTable data={allRows} columns={allCols} />
          </>
        )}
      </Card>

      <FailedDetailsModal tx={selectedFailed} onClose={() => setSelectedFailed(null)} />
    </Box>
  );
}
