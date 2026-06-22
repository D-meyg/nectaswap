import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  Clock,
  Download,
  Eye,
  RotateCcw,
  Search,
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
import { DUMMY_TRANSACTIONS, type TransactionRow } from "@/lib/dummyData";

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

const failedTransactions: FailedTx[] = [
  {
    id: "TX-001230",
    timestamp: "2024-01-29 14:12:19",
    user: "Chukwuma Eze",
    userId: "2934",
    amount: "₦500,000",
    crypto: "0.50 ETH",
    failureReason: "Bank transfer timeout",
    errorCode: "E-504",
    retryable: true,
  },
  {
    id: "TX-001224",
    timestamp: "2024-01-29 13:35:45",
    user: "Blessing Solomon",
    userId: "8812",
    amount: "₦850,000",
    crypto: "0.85 ETH",
    failureReason: "Insufficient wallet balance",
    errorCode: "E-101",
    retryable: false,
  },
  {
    id: "TX-001219",
    timestamp: "2024-01-29 13:10:22",
    user: "Anita Mohammed",
    userId: "5410",
    amount: "₦2,200,000",
    crypto: "0.052 BTC",
    failureReason: "User bank account verification failed",
    errorCode: "E-203",
    retryable: true,
  },
  {
    id: "TX-001215",
    timestamp: "2024-01-29 12:45:10",
    user: "Tunde Bakare",
    userId: "3374",
    amount: "₦1,200,000",
    crypto: "1,200 USDT",
    failureReason: "Transaction limit exceeded",
    errorCode: "E-402",
    retryable: false,
  },
  {
    id: "TX-001210",
    timestamp: "2024-01-29 12:20:33",
    user: "Chioma Okonkwo",
    userId: "9021",
    amount: "₦350,000",
    crypto: "0.35 ETH",
    failureReason: "Network congestion - timeout",
    errorCode: "E-503",
    retryable: true,
  },
  {
    id: "TX-001205",
    timestamp: "2024-01-29 11:55:18",
    user: "Olumeseun Adeyemi",
    userId: "7841",
    amount: "₦650,000",
    crypto: "350 USDT",
    failureReason: "Invalid recipient bank details",
    errorCode: "E-204",
    retryable: false,
  },
];

const pendingTransactions: PendingTx[] = [
  {
    id: "TX-001232",
    timestamp: "2024-01-29 14:18:33",
    user: "Yusuf Ibrahim",
    userId: "5621",
    amount: "₦750,000",
    crypto: "500 USDT",
    reason: "Large transaction amount",
    risk: "medium",
    waitTime: "45 minutes",
  },
  {
    id: "TX-001228",
    timestamp: "2024-01-29 14:05:22",
    user: "Ngozi Achebe",
    userId: "6712",
    amount: "₦210,500",
    crypto: "0.005 BTC",
    reason: "First transaction for user",
    risk: "low",
    waitTime: "1 hour 3 minutes",
  },
  {
    id: "TX-001225",
    timestamp: "2024-01-29 13:45:18",
    user: "Emeka Obi",
    userId: "5234",
    amount: "₦2,500,000",
    crypto: "2.5 ETH",
    reason: "Unusual activity pattern",
    risk: "high",
    waitTime: "1 hour 23 minutes",
  },
  {
    id: "TX-001220",
    timestamp: "2024-01-29 13:20:12",
    user: "Fatima Abdullahi",
    userId: "8134",
    amount: "₦2,250,000",
    crypto: "1,500 USDT",
    reason: "Large transaction amount",
    risk: "high",
    waitTime: "1 hour 48 minutes",
  },
];

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
    <Card className="mb-4">
      <Box px={4} py={3}>
        <Row gap={3} align="center">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search by transaction ID, user, or error code..."
            className="min-w-0 flex-1"
          />
          <input className="h-8 w-[9.375rem] rounded-(--radius-sm) border border-(--color-border) bg-white px-3 text-[0.6875rem] outline-none" />
          {showExport && (
            <Button variant="secondary" size="sm" className="h-8 px-3 text-[0.6875rem]">
              <Download size={13} />
              Export
            </Button>
          )}
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

  const allRows = useMemo(
    () =>
      DUMMY_TRANSACTIONS.filter(
        (tx) =>
          !search ||
          tx.id.toLowerCase().includes(search.toLowerCase()) ||
          tx.user_name.toLowerCase().includes(search.toLowerCase()),
      ),
    [search],
  );

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
      { accessorKey: "user_name", header: "User" },
      { accessorKey: "crypto", header: "Type" },
      { accessorKey: "crypto_amount", header: "Crypto Amount" },
      { accessorKey: "ngn_amount", header: "NGN Amount" },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => {
          const value = getValue<TransactionRow["status"]>();
          return <StatusPill tone={value === "completed" ? "success" : value === "pending" ? "warning" : "danger"}>{value}</StatusPill>;
        },
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
    <Box className="min-h-full w-full px-4 py-4 lg:px-5 xl:px-6">
      {mode === "pending" && (
        <div className="mb-4 grid grid-cols-4 gap-4">
          <StatCard label="Pending Approval" value={4} icon={<Clock size={20} className="text-(--color-warning)" />} />
          <StatCard label="Total Value" value="₦5.7M" />
          <StatCard label="High Risk" value={2} icon={<AlertTriangle size={20} className="text-(--color-danger)" />} />
          <StatCard label="Avg Wait Time" value="1h 5m" icon={<Clock size={20} className="text-(--color-text-muted)" />} />
        </div>
      )}

      {mode === "failed" && (
        <div className="mb-4 grid grid-cols-4 gap-4">
          <StatCard label="Failed Transactions" value={6} icon={<XCircle size={20} className="text-(--color-danger)" />} />
          <StatCard label="Retryable" value={3} icon={<RotateCcw size={20} className="text-(--color-success-dark)" />} />
          <StatCard label="Non-Retryable" value={3} icon={<AlertTriangle size={20} className="text-[#C2410C]" />} />
          <StatCard label="Total Value" value="₦4.9M" />
        </div>
      )}

      {mode !== "pending" && <FilterBar search={search} setSearch={setSearch} />}

      <Card noPadding>
        <Box px={4} py={3} className="border-b border-(--color-border)">
          <Text variant="subtitle" color="primary" weight="semibold" className="text-xs leading-4">
            {mode === "pending" ? "Pending Approvals" : mode === "failed" ? "Failed Transactions" : "All Transactions"}
          </Text>
          <Text variant="micro" color="muted" className="text-[0.625rem] leading-3">
            {mode === "pending"
              ? "Transactions requiring manual review and approval"
              : mode === "failed"
                ? "6 failed transactions requiring attention"
                : `${allRows.length} transactions found`}
          </Text>
        </Box>
        {mode === "pending" ? (
          <DataTable data={pendingTransactions} columns={pendingCols} />
        ) : mode === "failed" ? (
          <DataTable data={failedTransactions} columns={failedCols} />
        ) : (
          <>
            <Box px={4} py={3} className="border-b border-(--color-border)">
              <Row gap={2} align="center" className="h-8 rounded-(--radius-sm) border border-(--color-border) px-3">
                <Search size={13} className="text-(--color-text-muted)" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search users, transactions, cards..."
                  className="min-w-0 flex-1 bg-transparent font-geom text-[0.6875rem] outline-none"
                />
              </Row>
            </Box>
            <DataTable data={allRows} columns={allCols} />
          </>
        )}
      </Card>

      <FailedDetailsModal tx={selectedFailed} onClose={() => setSelectedFailed(null)} />
    </Box>
  );
}
