import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { Copy, ExternalLink, CheckCircle } from "lucide-react";

import { usePageTitle } from "@/layouts/AppLayout";
import { DetailPageHeader } from "@/components/common/DetailPageHeader";
import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { Box } from "@/components/ui/Box";
import { Row } from "@/components/ui/Row";
import { Stack } from "@/components/ui/Stack";
import { Button } from "@/components/ui/Button";
import { TabsWithSidebar, TabsList, Tab, TabPanel } from "@/components/ui/Tabs";
import { CryptoLabel } from "@/components/ui/CryptoBadge";
import { useClipboard } from "@/hooks/ui/useClipboard";
import { DataTable } from "@/components/tables/DataTable";
import type { ColumnDef } from "@tanstack/react-table";
import { useTransactionDetail } from "@/hooks/queries/useTransactions";
import { DUMMY_TX_DETAIL, type TransactionDetail } from "@/lib/dummyData";

type TabValue = "overview" | "technical" | "ledger" | "timeline";
type TransactionStatus = TransactionDetail["status"];

function normalizeStatus(value: unknown): TransactionStatus {
  const status = String(value ?? "").toLowerCase();
  if (status === "success" || status === "completed") {
    return "completed";
  }
  if (status === "failed" || status === "pending") return status;
  return "pending";
}

function text(value: unknown, fallback = "N/A") {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function toNumber(value: unknown) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatNaira(value: unknown) {
  return `₦ ${toNumber(value).toLocaleString()}`;
}

function splitDate(value: unknown) {
  const raw = text(value, "").replace("T", " ");
  const [withoutMs = ""] = raw.split(".");
  const [date = "N/A", time = ""] = withoutMs.split(" ");
  return { date, time };
}

function normalizeTransactionDetail(value: unknown, id: string): TransactionDetail {
  const item =
    value && typeof value === "object"
      ? (value as Partial<TransactionDetail> & Record<string, unknown>)
      : {};
  const receipt =
    item.receipt && typeof item.receipt === "object"
      ? (item.receipt as Record<string, unknown>)
      : {};
  const created = splitDate(item.created_at ?? item.date ?? receipt.date);
  const updated = splitDate(item.updated_at ?? item.completed_at ?? receipt.date);
  const amount = item.amount ?? receipt.amount;
  const fee = item.fee ?? receipt.fee;
  const title = text(item.title ?? receipt.title, DUMMY_TX_DETAIL.title);
  const status = normalizeStatus(item.status ?? receipt.status);
  const sender = text(item.sender ?? receipt.sender ?? item.user_name, DUMMY_TX_DETAIL.user_name);

  return {
    ...DUMMY_TX_DETAIL,
    ...item,
    id: text(item.reference ?? receipt.reference ?? item.transaction_id ?? item.id ?? id, DUMMY_TX_DETAIL.id),
    title,
    status,
    user_name: sender,
    date: `${created.date} ${created.time}`.trim(),
    processing_time: text(item.processing_time, status === "completed" ? "Completed" : "Pending"),
    from_crypto: text(item.crypto_currency ?? item.kind ?? item.method, "NGN").toUpperCase(),
    from_amount: text(item.asset_value ?? item.crypto_amount, "0"),
    from_ngn_equiv: formatNaira(amount),
    to_ngn: formatNaira(amount),
    exchange_rate: text(item.exchange_rate, "N/A"),
    tx_fee: formatNaira(fee),
    user_email: text(item.user_email, "N/A"),
    user_id: text(item.user_id, "N/A"),
    ip_address: text(item.ip_address, "N/A"),
    bank_name: text(receipt.beneficiary_bank ?? item.bank_name, "N/A"),
    account_number: text(receipt.beneficiary_account ?? item.account_number, "N/A"),
    account_name: text(receipt.beneficiary ?? item.receiver ?? item.account_name, "N/A"),
    bank_reference: text(receipt.reference ?? item.reference, "N/A"),
    settlement_status: status === "completed" ? "Settled" : status,
    tx_hash: text(item.crypto_transaction_hash ?? item.provider_transaction_id ?? item.session_id ?? receipt.session_id, "N/A"),
    network: text(item.crypto_network ?? item.payment_method, "N/A"),
    confirmations: text(item.crypto_status, "N/A"),
    from_wallet: text(item.crypto_address ?? item.beneficiary_id, "N/A"),
    blockchain: status === "completed" ? "Confirmed" : "Pending",
    settlement: status === "completed" ? "Settled" : "Pending",
    started: created.time || "N/A",
    completed: status === "completed" ? updated.time || created.time || "N/A" : "Pending",
    total_time: text(item.processing_time, status === "completed" ? "Completed" : "Pending"),
    ledger_entries: Array.isArray(item.ledger_entries)
      ? item.ledger_entries
      : [
          {
            account: "Wallet Balance",
            operation: "Debit",
            amount: formatNaira(amount),
            balance_after: formatNaira(item.balance_after),
          },
          {
            account: "Fee",
            operation: "Debit",
            amount: formatNaira(fee),
            balance_after: formatNaira(item.balance_after),
          },
        ],
    timeline: Array.isArray(item.timeline)
      ? item.timeline
      : [
          {
            event: title,
            description: text(item.description ?? receipt.note, "Transaction created"),
            timestamp: `${created.date} ${created.time}`.trim(),
          },
        ],
  };
}

// ── Shared helpers ────────────────────────────────────────
function InfoField({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <Stack gap={0}>
      <Text variant="micro" color="muted" className="mb-0.5 text-[0.625rem] leading-3">
        {label}
      </Text>
      <Text
        variant="caption"
        color="primary"
        weight="semibold"
        className={`text-xs leading-4 ${valueColor ?? ""}`}
      >
        {value}
      </Text>
    </Stack>
  );
}

// ── Status pill for tx header ─────────────────────────────
function TxStatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    completed:
      "text-(--color-success-mid) bg-(--color-success-subtle) border border-(--color-success-muted)",
    pending:
      "text-(--color-warning-dark) bg-(--color-warning-subtle) border border-(--color-warning-border)",
    failed:
      "text-(--color-danger) bg-(--color-danger-subtle) border border-(--color-danger-muted)",
  };
  return (
    <span
      className={[
        "inline-flex items-center px-2 py-0.5 rounded",
        "text-[0.625rem] font-semibold capitalize leading-none",
        styles[status] ?? styles.pending,
      ].join(" ")}
    >
      {status}
    </span>
  );
}

// ── Right sidebar panels (shared across all tabs) ─────────
function RightSidebar({ tx }: { tx: TransactionDetail }) {
  return (
    <Stack gap={5}>
      <Card className="rounded-[6px]">
        <Card.Header title="Quick Actions" className="border-b-0 px-4 pb-2 pt-3 [&_h4]:text-xs [&_h4]:leading-4" />
        <Card.Body className="px-5 pb-5 pt-0">
          <Stack gap={3}>
            <Button
              variant="primary"
              size="md"
              className="h-8 w-full justify-center text-[0.6875rem]"
            >
              View User Profile
            </Button>
            <Button
              variant="secondary"
              size="md"
              className="h-8 w-full justify-center text-[0.6875rem]"
            >
              Export Details
            </Button>
          </Stack>
        </Card.Body>
      </Card>

      <Card className="rounded-[6px]">
        <Card.Header title="Status" className="border-b-0 px-4 pb-2 pt-3 [&_h4]:text-xs [&_h4]:leading-4" />
        <Card.Body className="space-y-2 px-4 pb-4 pt-0">
            <Row justify="between" align="center" className="h-[1.875rem] rounded-(--radius-sm) border border-(--color-border) bg-white px-3">
              <Text variant="caption" color="secondary" className="text-[0.6875rem]">
                Transaction
              </Text>
              <Text variant="caption" color="success" weight="semibold" className="rounded-(--radius-sm) bg-(--color-success-bg) px-2 py-0.5 text-[0.625rem]">
                Completed
              </Text>
            </Row>
            <Row justify="between" align="center" className="h-[1.875rem] rounded-(--radius-sm) border border-(--color-border) bg-white px-3">
              <Text variant="caption" color="secondary" className="text-[0.6875rem]">
                Blockchain
              </Text>
              <Text
                variant="caption"
                weight="semibold"
                className="text-[0.625rem] text-(--color-success-dark)"
              >
                {tx.blockchain}
              </Text>
            </Row>
            <Row justify="between" align="center" className="h-[1.875rem] rounded-(--radius-sm) border border-(--color-border) bg-white px-3">
              <Text variant="caption" color="secondary" className="text-[0.6875rem]">
                Settlement
              </Text>
              <Text variant="caption" color="success" weight="semibold" className="text-[0.625rem]">
                {tx.settlement}
              </Text>
            </Row>
        </Card.Body>
      </Card>

      {/* Timing */}
      <Card className="rounded-[6px]">
        <Card.Header title="Timing" className="border-b-0 px-4 pb-2 pt-3 [&_h4]:text-xs [&_h4]:leading-4" />
        <Card.Body className="px-4 pb-4 pt-0">
          <Stack gap={3} className="[&>div]:min-h-7">
            <Row justify="between" align="center">
              <Text variant="caption" color="secondary" className="text-[0.6875rem]">
                Started
              </Text>
              <Text variant="caption" color="primary" weight="semibold" className="text-[0.6875rem]">
                {tx.started}
              </Text>
            </Row>
            <Row justify="between" align="center">
              <Text variant="caption" color="secondary" className="text-[0.6875rem]">
                Completed
              </Text>
              <Text variant="caption" color="primary" weight="semibold" className="text-[0.6875rem]">
                {tx.completed}
              </Text>
            </Row>
            <Row justify="between" align="center" className="border-t border-(--color-border) pt-3">
              <Text variant="caption" color="secondary" className="text-[0.6875rem]">
                Total Time
              </Text>
              <Text variant="caption" color="primary" weight="semibold" className="text-[0.6875rem]">
                {tx.total_time}
              </Text>
            </Row>
          </Stack>
        </Card.Body>
      </Card>
    </Stack>
  );
}

// ── Overview tab — image 2 ────────────────────────────────
function OverviewTab({ tx }: { tx: TransactionDetail }) {
  return (
    <Stack gap={4}>
      <Card className="rounded-[6px]">
        <Card.Header title="Transaction Summary" className="border-b-0 px-4 pb-2 pt-3 [&_h4]:text-[0.8125rem] [&_h4]:leading-4" />
        <Card.Body className="px-4 pb-4 pt-0">
          {/* From/To row */}
          <Row gap={4} className="mb-4">
            {/* From */}
            <Box className="flex-1 rounded-(--radius-sm) border border-(--color-border) bg-white p-4">
              <Text variant="micro" color="muted" className="mb-2 block text-[0.75rem] leading-4">
                From
              </Text>
              <Row gap={2} align="center">
                <CryptoLabel symbol={tx.from_crypto} />
                <Text variant="display" color="primary" weight="semibold" className="text-xl leading-6">
                  {tx.from_amount}
                </Text>
              </Row>
              <Text variant="caption" color="muted" className="mt-1 block text-[0.6875rem] leading-4">
                {tx.from_ngn_equiv}
              </Text>
            </Box>
            {/* To */}
            <Box className="flex-1 rounded-(--radius-sm) border border-(--color-border) bg-white p-4">
              <Text variant="micro" color="muted" className="mb-2 block text-[0.75rem] leading-4">
                To (Naira)
              </Text>
              <Row gap={2} align="center">
                <span className="inline-flex items-center rounded-(--radius-sm) bg-(--color-success-bg) text-(--color-success-mid) px-2 py-0.5 text-[0.6875rem] font-semibold">
                  NGN
                </span>
                <Text variant="display" color="primary" weight="semibold" className="text-xl leading-6">
                  {tx.to_ngn}
                </Text>
              </Row>
            </Box>
          </Row>
          {/* Exchange rate + fee */}
          <Row gap={8} className="border-t border-(--color-border) pt-4">
            <InfoField label="Exchange Rate" value={tx.exchange_rate} />
            <InfoField label="Transaction Fee" value={tx.tx_fee} />
          </Row>
        </Card.Body>
      </Card>

      {/* User Information */}
      <Card className="rounded-[6px]">
        <Card.Header title="User Information" className="border-b-0 px-4 pb-2 pt-3 [&_h4]:text-[0.8125rem] [&_h4]:leading-4" />
        <Card.Body className="px-4 pb-4 pt-1">
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            <InfoField label="Name" value={tx.user_name} />
            <InfoField
              label="User ID"
              value={tx.user_id}
              valueColor="text-(--color-brand)"
            />
            <InfoField label="Email" value={tx.user_email} />
            <InfoField label="IP Address" value={tx.ip_address} />
          </div>
        </Card.Body>
      </Card>

      {/* Bank Transfer Details */}
      <Card className="rounded-[6px]">
        <Card.Header title="Bank Transfer Details" className="border-b-0 px-4 pb-2 pt-3 [&_h4]:text-[0.8125rem] [&_h4]:leading-4" />
        <Card.Body className="px-4 pb-4 pt-1">
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            <InfoField label="Bank Name" value={tx.bank_name} />
            <InfoField label="Account Number" value={tx.account_number} />
            <InfoField label="Account Name" value={tx.account_name} />
            <InfoField label="Bank Reference" value={tx.bank_reference} />
          </div>
          <Box className="mt-4">
            <InfoField
              label="Settlement Status"
              value={tx.settlement_status}
              valueColor="text-(--color-success-mid)"
            />
          </Box>
        </Card.Body>
      </Card>
    </Stack>
  );
}

// ── Technical Details tab — image 3 ──────────────────────
function TechnicalTab({ tx }: { tx: TransactionDetail }) {
  const { copy: copyHash } = useClipboard();
  const { copy: copyWallet } = useClipboard();

  return (
    <Card>
      <Card.Header title="Blockchain Details" className="border-b-0 px-4 pb-2 pt-3 [&_h4]:text-xs [&_h4]:leading-4" />
      <Card.Body padded>
        <Stack gap={4}>
          {/* Transaction Hash */}
          <Stack gap={1}>
            <Text variant="micro" color="muted">
              Transaction Hash
            </Text>
            <Row
              gap={3}
              align="center"
              justify="between"
              className="rounded-(--radius-sm) border border-(--color-border) bg-(--color-bg-subtle) px-3 py-2.5"
            >
              <Text
                variant="caption"
                color="secondary"
                className="font-mono truncate"
              >
                {tx.tx_hash}
              </Text>
              <Row gap={2} align="center">
                <button
                  onClick={() => copyHash(tx.tx_hash)}
                  className="text-(--color-text-muted) hover:text-(--color-text-primary) transition-colors"
                >
                  <Copy size={14} />
                </button>
                <button className="text-(--color-text-muted) hover:text-(--color-brand) transition-colors">
                  <ExternalLink size={14} />
                </button>
              </Row>
            </Row>
          </Stack>

          {/* Network + Confirmations */}
          <Row gap={8}>
            <InfoField label="Network" value={tx.network} />
            <InfoField label="Confirmations" value={tx.confirmations} />
          </Row>

          {/* From Wallet */}
          <Stack gap={1}>
            <Text variant="micro" color="muted">
              From Wallet
            </Text>
            <Row
              gap={3}
              align="center"
              justify="between"
              className="rounded-(--radius-sm) border border-(--color-border) bg-(--color-bg-subtle) px-3 py-2.5"
            >
              <Text
                variant="caption"
                color="secondary"
                className="font-mono truncate"
              >
                {tx.from_wallet}
              </Text>
              <button
                onClick={() => copyWallet(tx.from_wallet)}
                className="text-(--color-text-muted) hover:text-(--color-text-primary) transition-colors shrink-0"
              >
                <Copy size={14} />
              </button>
            </Row>
          </Stack>
        </Stack>
      </Card.Body>
    </Card>
  );
}

// ── Ledger Entries tab — image 4 ─────────────────────────
function LedgerTab({ tx }: { tx: TransactionDetail }) {
  type LedgerEntry = (typeof tx.ledger_entries)[0];

  const cols = useMemo<ColumnDef<LedgerEntry, unknown>[]>(
    () => [
      {
        accessorKey: "account",
        header: "Account",
        cell: ({ getValue }) => (
          <Text variant="caption" color="primary">
            {getValue<string>()}
          </Text>
        ),
      },
      {
        accessorKey: "operation",
        header: "Operation",
        cell: ({ getValue }) => (
          <Text
            variant="caption"
            weight="medium"
            color={getValue<string>() === "Debit" ? "danger" : "success"}
          >
            {getValue<string>()}
          </Text>
        ),
      },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ getValue }) => (
          <Text variant="caption" color="primary" weight="medium">
            {getValue<string>()}
          </Text>
        ),
      },
      {
        accessorKey: "balance_after",
        header: "Balance After",
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
    <Card noPadding>
      <Box px={4} py={3} className="border-b border-(--color-border)">
        <Text variant="subtitle" color="primary" weight="semibold" as="p" className="text-xs leading-4">
          Internal Ledger Entries
        </Text>
        <Text variant="micro" color="muted" as="p" className="text-[0.625rem] leading-3">
          Double-entry accounting records
        </Text>
      </Box>
      <DataTable
        data={tx.ledger_entries}
        columns={cols}
        emptyTitle="No entries"
        emptyMessage="No ledger entries found"
      />
    </Card>
  );
}

// ── Timeline tab — image 5 ────────────────────────────────
function TimelineTab({ tx }: { tx: TransactionDetail }) {
  return (
    <Box className="w-full pt-1">
      {tx.timeline.map((event, i) => {
        const isLast = i === tx.timeline.length - 1;

        return (
          <div key={i} className="grid grid-cols-[2.25rem_minmax(0,1fr)] gap-4">
            <div className="flex flex-col items-center">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-(--color-success-bg)">
                <CheckCircle size={18} className="text-(--color-success-mid)" />
              </div>
              {!isLast && (
                <div className="mt-1 h-[4.125rem] w-px bg-(--color-border)" />
              )}
            </div>

            <Row
              justify="between"
              align="start"
              gap={4}
              className={isLast ? "pb-1" : "min-h-[5.625rem] pb-5"}
            >
              <Stack gap={1} className="min-w-0">
                <Text
                  variant="caption"
                  color="primary"
                  weight="semibold"
                  className="text-[0.8125rem] leading-5"
                >
                  {event.event}
                </Text>
                <Text
                  variant="caption"
                  color="secondary"
                  className="text-[0.8125rem] leading-5"
                >
                  {event.description}
                </Text>
              </Stack>

              <Text
                variant="caption"
                color="secondary"
                className="shrink-0 pt-0.5 text-[0.75rem] leading-4"
              >
                {event.timestamp}
              </Text>
            </Row>
          </div>
        );
      })}
    </Box>
  );
}

// ── Main page ─────────────────────────────────────────────
export default function TransactionDetailPage() {
  usePageTitle(
    "Transaction Detail",
    "Complete transaction timeline and resolution tools",
  );

  const { id = "" } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<TabValue>("overview");
  const { data: apiTx } = useTransactionDetail(id);
  const tx = normalizeTransactionDetail(apiTx, id);

  return (
    <Box className="min-h-full w-full px-4 py-4 lg:px-5 xl:px-6">
      <DetailPageHeader
        backLabel="Back to Transactions"
        backTo="/transactions"
        title={tx.title}
        statusPill={<TxStatusPill status={tx.status} />}
        idLabel={`ID: ${tx.id}`}
        meta={
          <>
            <Text variant="caption" color="tertiary">
              {tx.user_name}
            </Text>
            <Text variant="micro" color="muted">
              •
            </Text>
            <Text variant="caption" color="tertiary">
              {tx.date}
            </Text>
            <Text variant="micro" color="muted">
              •
            </Text>
            <Text variant="caption" color="tertiary">
              Processing time: {tx.processing_time}
            </Text>
          </>
        }
        actions={
          <Button variant="secondary" size="sm" className="h-8 px-3 text-[0.6875rem]">
            Export Details
          </Button>
        }
      />

      {/* Tabs with sidebar — sidebar contains Quick Actions + Status + Timing */}
      <TabsWithSidebar
        value={activeTab}
        onChange={(v) => setActiveTab(v as TabValue)}
        sidebar={<RightSidebar tx={tx} />}
        sidebarWidth="320px"
        className="w-full"
      >
        <TabsList>
          <Tab value="overview">Overview</Tab>
          <Tab value="technical">Technical Details</Tab>
          <Tab value="ledger">Ledger Entries</Tab>
          <Tab value="timeline">Timeline</Tab>
        </TabsList>

        <TabPanel value="overview" className="pt-0">
          <OverviewTab tx={tx} />
        </TabPanel>
        <TabPanel value="technical" className="pt-0">
          <TechnicalTab tx={tx} />
        </TabPanel>
        <TabPanel value="ledger" className="pt-0">
          <LedgerTab tx={tx} />
        </TabPanel>
        <TabPanel value="timeline" className="pt-0">
          <TimelineTab tx={tx} />
        </TabPanel>
      </TabsWithSidebar>
    </Box>
  );
}
