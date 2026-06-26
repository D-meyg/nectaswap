import { useState } from "react";
import { Eye, EyeOff, Download, Lock, MapPin } from "lucide-react";
import { useMemo } from "react";

import { usePageTitle } from "@/layouts/AppLayout";
import { DetailPageHeader } from "@/components/common/DetailPageHeader";
import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { Row } from "@/components/ui/Row";
import { Stack } from "@/components/ui/Stack";
import { Box } from "@/components/ui/Box";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { TabsWithSidebar, TabsList, Tab, TabPanel } from "@/components/ui/Tabs";
import { DataTable } from "@/components/tables/DataTable";
import type { ColumnDef } from "@tanstack/react-table";
import { DUMMY_CARD_DETAIL } from "@/lib/dummyData";

type TabValue = "overview" | "transactions" | "limits" | "activity";

// ── Status pill ───────────────────────────────────────────
function CardStatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Active:
      "bg-[var(--color-success-subtle)] text-[var(--color-success-mid)] border border-[var(--color-success-muted)]",
    Frozen:
      "bg-[var(--color-warning-subtle)] text-[var(--color-warning-dark)] border border-[var(--color-warning-border)]",
    Pending:
      "bg-[var(--color-warning-subtle)] text-[var(--color-warning-dark)] border border-[var(--color-warning-border)]",
    Blocked:
      "bg-[var(--color-danger-subtle)]  text-[var(--color-danger)]       border border-[var(--color-danger-muted)]",
  };
  return (
    <span
      className={[
        "inline-flex items-center px-2 py-0.5 rounded-[4px] text-[12px] font-semibold",
        styles[status] ?? styles.Pending,
      ].join(" ")}
    >
      {status}
    </span>
  );
}

// ── Right sidebar — shared across all tabs ────────────────
function CardSidebar() {
  const card = DUMMY_CARD_DETAIL;
  return (
    <Stack gap={4}>
      {/* Quick Actions */}
      <Card>
        <Card.Header title="Quick Actions" />
        <Card.Body padded>
          <Stack gap={2}>
            <Button
              variant="primary"
              size="sm"
              className="w-full justify-center"
            >
              View User Profile
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="w-full justify-center"
            >
              Top Up Balance
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="w-full justify-center"
            >
              Reset PIN
            </Button>
          </Stack>
        </Card.Body>
      </Card>

      {/* Card Info */}
      <Card>
        <Card.Header title="Card Info" />
        <Card.Body padded>
          <Stack gap={3}>
            <Row justify="between">
              <Text variant="caption" color="secondary">
                Type
              </Text>{" "}
              <Text variant="caption" color="primary" weight="semibold">
                {card.type}
              </Text>
            </Row>
            <Row justify="between">
              <Text variant="caption" color="secondary">
                Provider
              </Text>{" "}
              <Text variant="caption" color="primary" weight="semibold">
                {card.network}
              </Text>
            </Row>
            <Row justify="between">
              <Text variant="caption" color="secondary">
                Issued
              </Text>{" "}
              <Text variant="caption" color="primary" weight="semibold">
                {card.issued}
              </Text>
            </Row>
            <Row justify="between">
              <Text variant="caption" color="secondary">
                Expires
              </Text>{" "}
              <Text variant="caption" color="primary" weight="semibold">
                2027-01-15
              </Text>
            </Row>
          </Stack>
        </Card.Body>
      </Card>
    </Stack>
  );
}

// ── Overview tab — cd2.PNG ────────────────────────────────
function OverviewTab() {
  const card = DUMMY_CARD_DETAIL;
  const [showCVV, setShowCVV] = useState(false);

  return (
    <Stack gap={4}>
      {/* Card visual — gradient purple card matching cd2 */}
      <Box
        className="rounded-[12px] p-5 text-white relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #4E2BCC 0%, #8200DB 100%)",
        }}
      >
        {/* Top row */}
        <Row justify="between" align="start">
          <Stack gap={0}>
            <Text variant="micro" className="text-white/70" as="p">
              Nectaswap Card
            </Text>
            <Text variant="micro" className="text-white/70" as="p">
              {card.type}
            </Text>
          </Stack>
          <Stack gap={0} className="text-right">
            <Text variant="micro" className="text-white/70" as="p">
              Balance (NGN)
            </Text>
            <Text variant="title" className="text-white font-bold" as="p">
              ₦ {card.balance.toLocaleString()}
            </Text>
          </Stack>
        </Row>

        {/* Card number */}
        <Box className="mt-6 mb-5">
          <Row gap={2} align="center">
            <Text
              variant="subtitle"
              className="text-white font-mono tracking-[4px]"
              as="p"
            >
              {card.masked}
            </Text>
            <button className="text-white/60 hover:text-white transition-colors">
              <Eye size={14} />
            </button>
          </Row>
        </Box>

        {/* Bottom row */}
        <Row justify="between" align="end">
          <Stack gap={0}>
            <Text variant="micro" className="text-white/60" as="p">
              Cardholder
            </Text>
            <Text
              variant="caption"
              className="text-white font-semibold tracking-wider"
              as="p"
            >
              {card.cardholder}
            </Text>
          </Stack>
          <Stack gap={0} className="text-center">
            <Text variant="micro" className="text-white/60" as="p">
              CVV
            </Text>
            <Row gap={1} align="center">
              <Text variant="caption" className="text-white font-mono" as="p">
                {showCVV ? "•••" : "•••"}
              </Text>
              <button
                onClick={() => setShowCVV((v) => !v)}
                className="text-white/60 hover:text-white"
              >
                {showCVV ? <EyeOff size={12} /> : <Eye size={12} />}
              </button>
            </Row>
          </Stack>
          <Stack gap={0} className="text-right">
            <Text variant="micro" className="text-white/60" as="p">
              Expiry
            </Text>
            <Text variant="caption" className="text-white font-mono" as="p">
              {card.expiry}
            </Text>
          </Stack>
        </Row>

        {/* Mastercard logo watermark */}
        <Text
          variant="subtitle"
          className="absolute bottom-4 right-4 text-white/20 font-bold italic text-[20px]"
          as="p"
        >
          Mastercard
        </Text>
      </Box>

      {/* Card Features */}
      <Card>
        <Card.Header title="Card Features" />
        <Card.Body padded>
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                label: "Online Payments",
                enabled: card.features.online_payments,
              },
              {
                label: "ATM Withdrawals",
                enabled: card.features.atm_withdrawals,
              },
              { label: "International", enabled: card.features.international },
              { label: "Contactless", enabled: card.features.contactless },
            ].map((f) => (
              <Row
                key={f.label}
                justify="between"
                align="center"
                className="py-1"
              >
                <Text variant="caption" color="secondary">
                  {f.label}
                </Text>
                <Text
                  variant="caption"
                  weight="medium"
                  color={f.enabled ? "success" : "muted"}
                >
                  {f.enabled ? "Enabled" : "Disabled"}
                </Text>
              </Row>
            ))}
          </div>
        </Card.Body>
      </Card>

      {/* Spending cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <Box px={4} py={4}>
            <Text variant="micro" color="muted" className="block mb-2">
              Daily Spending
            </Text>
            <Text variant="heading" color="primary" weight="semibold" as="p">
              ₦ {card.daily_spend.toLocaleString()}
            </Text>
            <Row justify="between" align="center" className="mt-0.5 mb-2">
              <Text variant="micro" color="muted">
                of ₦ {card.daily_limit.toLocaleString()}
              </Text>
              <Text variant="micro" color="muted">
                {((card.daily_spend / card.daily_limit) * 100).toFixed(1)}%
              </Text>
            </Row>
            <ProgressBar
              value={(card.daily_spend / card.daily_limit) * 100}
              max={100}
              className="h-1.5"
            />
          </Box>
        </Card>
        <Card>
          <Box px={4} py={4}>
            <Text variant="micro" color="muted" className="block mb-2">
              Monthly Spending
            </Text>
            <Text variant="heading" color="primary" weight="semibold" as="p">
              ₦ {card.monthly_spend.toLocaleString()}
            </Text>
            <Row justify="between" align="center" className="mt-0.5 mb-2">
              <Text variant="micro" color="muted">
                of ₦ {card.monthly_limit.toLocaleString()}
              </Text>
              <Text variant="micro" color="muted">
                {((card.monthly_spend / card.monthly_limit) * 100).toFixed(1)}%
              </Text>
            </Row>
            <ProgressBar
              value={(card.monthly_spend / card.monthly_limit) * 100}
              max={100}
              className="h-1.5"
            />
          </Box>
        </Card>
      </div>
    </Stack>
  );
}

// ── Transactions tab — cd3.PNG ────────────────────────────
function TransactionsTab() {
  const card = DUMMY_CARD_DETAIL;
  type Tx = (typeof card.transactions)[0];
  const cols = useMemo<ColumnDef<Tx, unknown>[]>(
    () => [
      {
        accessorKey: "date",
        header: "Date & Time",
        cell: ({ getValue }) => (
          <Text variant="caption" color="secondary">
            {getValue<string>()}
          </Text>
        ),
      },
      {
        accessorKey: "merchant",
        header: "Merchant",
        cell: ({ row }) => (
          <Stack gap={0}>
            <Text variant="caption" color="primary" weight="semibold" as="p">
              {row.original.merchant}
            </Text>
            <Text variant="micro" color="muted" as="p">
              {row.original.merchant_sub}
            </Text>
          </Stack>
        ),
      },
      {
        accessorKey: "category",
        header: "Category",
        cell: ({ getValue }) => (
          <Text variant="caption" color="secondary">
            {getValue<string>()}
          </Text>
        ),
      },
      {
        accessorKey: "amount",
        header: "Amount (NGN)",
        cell: ({ row }) => (
          <Text
            variant="caption"
            weight="medium"
            color={row.original.status === "Failed" ? "danger" : "primary"}
          >
            - ₦ {row.original.amount.toLocaleString()}
          </Text>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => (
          <Text
            variant="caption"
            weight="medium"
            color={getValue<string>() === "Completed" ? "success" : "danger"}
          >
            {getValue<string>()}
          </Text>
        ),
      },
    ],
    [],
  );

  return (
    <Card noPadding>
      <Box px={5} py={4} className="border-b border-[var(--color-border)]">
        <Text variant="subtitle" color="primary" weight="semibold" as="p">
          Card Transactions
        </Text>
        <Text variant="micro" color="muted" as="p">
          All transactions made with this card
        </Text>
      </Box>
      <DataTable
        data={card.transactions}
        columns={cols}
        emptyTitle="No transactions"
        emptyMessage="No card transactions found"
      />
    </Card>
  );
}

// ── Limits & Controls tab — cd4.PNG ──────────────────────
function LimitsTab() {
  const card = DUMMY_CARD_DETAIL;
  return (
    <Card>
      <Card.Header title="Transaction Limits" />
      <Card.Body padded>
        <Stack gap={0} className="mb-4">
          {[
            {
              label: "Daily Limit",
              value: `₦ ${card.daily_limit.toLocaleString()}`,
            },
            {
              label: "Monthly Limit",
              value: `₦ ${card.monthly_limit.toLocaleString()}`,
            },
            { label: "Per Transaction", value: "₦ 100,000" },
          ].map((row) => (
            <Row
              key={row.label}
              justify="between"
              align="center"
              className="py-3.5 border-b border-[var(--color-border)] last:border-0"
            >
              <Text variant="caption" color="secondary">
                {row.label}
              </Text>
              <Text variant="caption" color="primary" weight="semibold">
                {row.value}
              </Text>
            </Row>
          ))}
        </Stack>
        <Button className="w-full justify-center">Update Limits</Button>
      </Card.Body>
    </Card>
  );
}

// ── Activity Log tab — cd5.PNG ────────────────────────────
function ActivityLogTab() {
  const card = DUMMY_CARD_DETAIL;
  return (
    <Card noPadding>
      {card.activity_log.map((entry, i) => {
        const isLast = i === card.activity_log.length - 1;
        const isDeclined = entry.title.toLowerCase().includes("declined");
        return (
          <Box
            key={i}
            px={5}
            py={4}
            className={!isLast ? "border-b border-[var(--color-border)]" : ""}
          >
            {/* Title + timestamp */}
            <Row justify="between" align="start" gap={4}>
              <Text
                variant="caption"
                weight="semibold"
                color={isDeclined ? "danger" : "primary"}
              >
                {entry.title}
              </Text>
              <Text variant="micro" color="muted" className="shrink-0">
                {entry.timestamp}
              </Text>
            </Row>
            {/* Description */}
            <Text variant="caption" color="secondary" className="mt-0.5 block">
              {entry.description}
            </Text>
            {/* IP • location • admin action */}
            <Row gap={1} align="center" className="mt-1">
              <Text variant="micro" color="muted">
                IP: {entry.ip}
              </Text>
              {entry.location && (
                <>
                  <Text variant="micro" color="muted">
                    •
                  </Text>
                  <MapPin
                    size={10}
                    className="text-[var(--color-text-muted)]"
                  />
                  <Text variant="micro" color="muted">
                    {entry.location}
                  </Text>
                </>
              )}
              {entry.is_admin && (
                <>
                  <Text variant="micro" color="muted">
                    •
                  </Text>
                  <Text variant="micro" color="brand">
                    Admin Action
                  </Text>
                </>
              )}
            </Row>
          </Box>
        );
      })}
    </Card>
  );
}

// ── Main page ─────────────────────────────────────────────
export default function CardDetailPage() {
  usePageTitle(
    "Card Detail",
    "Card transactions, limits, and security controls",
  );

  const [activeTab, setActiveTab] = useState<TabValue>("overview");
  const card = DUMMY_CARD_DETAIL;

  return (
    <Box p={6}>
      <DetailPageHeader
        backLabel="Back to Cards"
        backTo="/cards"
        title={
          <Text variant="heading" color="primary" as="h1">
            {card.type} Card - <span className="font-mono">{card.masked}</span>
          </Text>
        }
        statusPill={<CardStatusPill status={card.status} />}
        idLabel="ID: 1"
        meta={
          <>
            <Text variant="caption" color="tertiary">
              {card.user_name}
            </Text>
            <Text variant="micro" color="muted">
              •
            </Text>
            <Text variant="caption" color="tertiary">
              {card.network} {card.variant}
            </Text>
            <Text variant="micro" color="muted">
              •
            </Text>
            <Text variant="caption" color="tertiary">
              Issued: {card.issued} 10:30:00
            </Text>
          </>
        }
        actions={
          <>
            <Button
              variant="secondary"
              size="sm"
              className="h-8 w-8 p-0 flex items-center justify-center"
            >
              <Download size={14} />
            </Button>
            <Button
              size="sm"
              className="border border-[var(--color-danger)] bg-white text-[var(--color-danger)] hover:bg-[var(--color-danger-subtle)]"
            >
              <Lock size={13} />
              Freeze Card
            </Button>
          </>
        }
      />

      <TabsWithSidebar
        value={activeTab}
        onChange={(v) => setActiveTab(v as TabValue)}
        sidebar={<CardSidebar />}
        sidebarWidth="220px"
      >
        <TabsList>
          <Tab value="overview">Overview</Tab>
          <Tab value="transactions">Transactions</Tab>
          <Tab value="limits">Limits & Controls</Tab>
          <Tab value="activity">Activity Log</Tab>
        </TabsList>

        <TabPanel value="overview">
          <OverviewTab />
        </TabPanel>
        <TabPanel value="transactions">
          <TransactionsTab />
        </TabPanel>
        <TabPanel value="limits">
          <LimitsTab />
        </TabPanel>
        <TabPanel value="activity">
          <ActivityLogTab />
        </TabPanel>
      </TabsWithSidebar>
    </Box>
  );
}
