import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { Copy, ExternalLink, Download, CheckCircle } from "lucide-react";

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
import { DUMMY_TX_DETAIL } from "@/lib/dummyData";
import { useTransactionDetail } from "@/hooks/queries/useTransactions";

type TabValue = "overview" | "technical" | "ledger" | "timeline";

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
function RightSidebar() {
  const tx = DUMMY_TX_DETAIL;
  return (
    <Stack gap={4}>
      {/* Quick Actions */}
      <Card>
        <Card.Header title="Quick Actions" className="border-b-0 px-4 pb-2 pt-3 [&_h4]:text-xs [&_h4]:leading-4" />
        <Card.Body className="px-4 pb-4 pt-0">
          <Stack gap={2}>
            <Button
              variant="primary"
              size="sm"
              className="h-8 w-full justify-center text-[0.6875rem]"
            >
              View User Profile
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="h-8 w-full justify-center text-[0.6875rem]"
            >
              <Download size={13} />
              Export Details
            </Button>
          </Stack>
        </Card.Body>
      </Card>

      {/* Status */}
      <Card>
        <Card.Header title="Status" className="border-b-0 px-4 pb-2 pt-3 [&_h4]:text-xs [&_h4]:leading-4" />
        <Card.Body className="space-y-2 px-4 pb-4 pt-0">
            <Row justify="between" align="center" className="h-[1.875rem] rounded-(--radius-sm) border border-(--color-border) px-3">
              <Text variant="caption" color="secondary" className="text-[0.6875rem]">
                Transaction
              </Text>
              <Text variant="caption" color="success" weight="medium" className="text-[0.625rem]">
                Completed
              </Text>
            </Row>
            <Row justify="between" align="center" className="h-[1.875rem] rounded-(--radius-sm) border border-(--color-border) px-3">
              <Text variant="caption" color="secondary" className="text-[0.6875rem]">
                Blockchain
              </Text>
              <Text
                variant="caption"
                weight="medium"
                className="text-[0.625rem] text-(--color-success-dark)"
              >
                {tx.blockchain}
              </Text>
            </Row>
            <Row justify="between" align="center" className="h-[1.875rem] rounded-(--radius-sm) border border-(--color-border) px-3">
              <Text variant="caption" color="secondary" className="text-[0.6875rem]">
                Settlement
              </Text>
              <Text variant="caption" color="success" weight="medium" className="text-[0.625rem]">
                {tx.settlement}
              </Text>
            </Row>
        </Card.Body>
      </Card>

      {/* Timing */}
      <Card>
        <Card.Header title="Timing" className="border-b-0 px-4 pb-2 pt-3 [&_h4]:text-xs [&_h4]:leading-4" />
        <Card.Body className="px-4 pb-4 pt-0">
          <Stack gap={3}>
            <Row justify="between" align="center">
              <Text variant="caption" color="secondary" className="text-[0.6875rem]">
                Started
              </Text>
              <Text variant="caption" color="primary" weight="medium" className="text-[0.6875rem]">
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
            <Row justify="between" align="center">
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
function OverviewTab() {
  const tx = DUMMY_TX_DETAIL;
  return (
    <Stack gap={4}>
      {/* Transaction Summary */}
      <Card>
        <Card.Header title="Transaction Summary" className="border-b-0 px-4 pb-2 pt-3 [&_h4]:text-xs [&_h4]:leading-4" />
        <Card.Body padded>
          {/* From/To row */}
          <Row gap={4} className="mb-4">
            {/* From */}
            <Box className="flex-1 rounded-(--radius-sm) border border-(--color-border) p-4">
              <Text variant="micro" color="muted" className="mb-2 block text-[0.625rem] leading-3">
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
            <Box className="flex-1 rounded-(--radius-sm) border border-(--color-border) p-4">
              <Text variant="micro" color="muted" className="mb-2 block text-[0.625rem] leading-3">
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
          <Row gap={8}>
            <InfoField label="Exchange Rate" value={tx.exchange_rate} />
            <InfoField label="Transaction Fee" value={tx.tx_fee} />
          </Row>
        </Card.Body>
      </Card>

      {/* User Information */}
      <Card>
        <Card.Header title="User Information" className="border-b-0 px-4 pb-2 pt-3 [&_h4]:text-xs [&_h4]:leading-4" />
        <Card.Body padded>
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
      <Card>
        <Card.Header title="Bank Transfer Details" className="border-b-0 px-4 pb-2 pt-3 [&_h4]:text-xs [&_h4]:leading-4" />
        <Card.Body padded>
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
function TechnicalTab() {
  const tx = DUMMY_TX_DETAIL;
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
function LedgerTab() {
  const tx = DUMMY_TX_DETAIL;
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
function TimelineTab() {
  const tx = DUMMY_TX_DETAIL;
  return (
    <Card className="border-0 bg-transparent shadow-none">
      <Card.Body className="p-0">
        <Stack gap={0}>
          {tx.timeline.map((event, i) => {
            const isLast = i === tx.timeline.length - 1;
            return (
              <div key={i} className="flex gap-4">
                {/* Left: icon + vertical line */}
                <div className="flex flex-col items-center">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-(--color-success-subtle) border border-(--color-success-mid)">
                    <CheckCircle
                      size={12}
                      className="text-(--color-success-mid)"
                    />
                  </div>
                  {!isLast && (
                  <div className="w-px flex-1 bg-(--color-border) my-1" />
                  )}
                </div>

                {/* Right: content */}
                <Box className={!isLast ? "pb-5" : ""}>
                  <Row justify="between" align="start" gap={4}>
                    <Text variant="caption" color="primary" weight="semibold" className="text-xs leading-4">
                      {event.event}
                    </Text>
                    <Text variant="micro" color="muted" className="shrink-0 text-[0.625rem] leading-4">
                      {event.timestamp}
                    </Text>
                  </Row>
                  <Text
                    variant="micro"
                    color="secondary"
                    className="mt-0.5 block text-[0.6875rem] leading-4"
                  >
                    {event.description}
                  </Text>
                </Box>
              </div>
            );
          })}
        </Stack>
      </Card.Body>
    </Card>
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
  const tx = (apiTx as unknown as typeof DUMMY_TX_DETAIL) || DUMMY_TX_DETAIL;

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
            <Download size={13} />
            Export Details
          </Button>
        }
      />

      {/* Tabs with sidebar — sidebar contains Quick Actions + Status + Timing */}
      <TabsWithSidebar
        value={activeTab}
        onChange={(v) => setActiveTab(v as TabValue)}
        sidebar={<RightSidebar />}
        sidebarWidth="300px"
      >
        <TabsList>
          <Tab value="overview">Overview</Tab>
          <Tab value="technical">Technical Details</Tab>
          <Tab value="ledger">Ledger Entries</Tab>
          <Tab value="timeline">Timeline</Tab>
        </TabsList>

        <TabPanel value="overview">
          <OverviewTab />
        </TabPanel>
        <TabPanel value="technical">
          <TechnicalTab />
        </TabPanel>
        <TabPanel value="ledger">
          <LedgerTab />
        </TabPanel>
        <TabPanel value="timeline">
          <TimelineTab />
        </TabPanel>
      </TabsWithSidebar>
    </Box>
  );
}
