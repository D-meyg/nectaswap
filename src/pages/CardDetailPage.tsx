import { useState } from "react";
import { useParams } from "react-router-dom";
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
import { useCardDetail } from "@/hooks/queries/useCards";
import { DUMMY_CARD_DETAIL, type CardDetail } from "@/lib/dummyData";

type TabValue = "overview" | "transactions" | "limits" | "activity";

function toNumber(value: unknown) {
  const numberValue = typeof value === "number" ? value : Number(value ?? 0);
  return Number.isFinite(numberValue) ? numberValue : 0;
}

function formatNumber(value: unknown) {
  return toNumber(value).toLocaleString();
}

function normalizeCardDetail(card: unknown): CardDetail {
  const value =
    card && typeof card === "object" ? (card as Partial<CardDetail>) : {};

  return {
    ...DUMMY_CARD_DETAIL,
    ...value,
    features: {
      ...DUMMY_CARD_DETAIL.features,
      ...(value.features ?? {}),
    },
    transactions: Array.isArray(value.transactions)
      ? value.transactions
      : DUMMY_CARD_DETAIL.transactions,
    activity_log: Array.isArray(value.activity_log)
      ? value.activity_log
      : DUMMY_CARD_DETAIL.activity_log,
  };
}

// ── Status pill ───────────────────────────────────────────
function CardStatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Active:
      "bg-(--color-success-subtle) text-(--color-success-mid) border border-(--color-success-muted)",
    Frozen:
      "bg-(--color-warning-subtle) text-(--color-warning-dark) border border-(--color-warning-border)",
    Pending:
      "bg-(--color-warning-subtle) text-(--color-warning-dark) border border-(--color-warning-border)",
    Blocked:
      "bg-(--color-danger-subtle)  text-(--color-danger)       border border-(--color-danger-muted)",
  };
  return (
    <span
      className={[
        "inline-flex items-center px-2 py-0.5 rounded text-[0.625rem] font-semibold leading-none",
        styles[status] ?? styles.Pending,
      ].join(" ")}
    >
      {status}
    </span>
  );
}

// ── Right sidebar — shared across all tabs ────────────────
function CardSidebar({ card }: { card: CardDetail }) {
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
              Top Up Balance
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="h-8 w-full justify-center text-[0.6875rem]"
            >
              Reset PIN
            </Button>
          </Stack>
        </Card.Body>
      </Card>

      {/* Card Info */}
      <Card>
        <Card.Header title="Card Info" className="border-b-0 px-4 pb-2 pt-3 [&_h4]:text-xs [&_h4]:leading-4" />
        <Card.Body className="px-4 pb-4 pt-0">
          <Stack gap={3}>
            <Row justify="between">
              <Text variant="caption" color="secondary" className="text-[0.6875rem]">
                Type
              </Text>{" "}
              <Text variant="caption" color="primary" weight="semibold" className="text-[0.6875rem]">
                {card.type}
              </Text>
            </Row>
            <Row justify="between">
              <Text variant="caption" color="secondary" className="text-[0.6875rem]">
                Provider
              </Text>{" "}
              <Text variant="caption" color="primary" weight="semibold" className="text-[0.6875rem]">
                {card.network}
              </Text>
            </Row>
            <Row justify="between">
              <Text variant="caption" color="secondary" className="text-[0.6875rem]">
                Issued
              </Text>{" "}
              <Text variant="caption" color="primary" weight="semibold" className="text-[0.6875rem]">
                {card.issued}
              </Text>
            </Row>
            <Row justify="between">
              <Text variant="caption" color="secondary" className="text-[0.6875rem]">
                Expires
              </Text>{" "}
              <Text variant="caption" color="primary" weight="semibold" className="text-[0.6875rem]">
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
function OverviewTab({ card }: { card: CardDetail }) {
  const [showCVV, setShowCVV] = useState(false);

  return (
    <Stack gap={4}>
      {/* Card visual — gradient purple card matching cd2 */}
      <Box
        className="relative min-h-[13.75rem] overflow-hidden rounded-lg p-5 text-white"
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
            <Text variant="title" className="text-2xl font-bold leading-7 text-white" as="p">
              ₦ {formatNumber(card.balance)}
            </Text>
          </Stack>
        </Row>

        {/* Card number */}
        <Box className="mt-6 mb-5">
          <Row gap={2} align="center">
            <Text
              variant="subtitle"
              className="text-white font-mono tracking-[0.25rem]"
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
          className="absolute bottom-4 right-4 text-white/20 font-bold italic text-xl"
          as="p"
        >
          Mastercard
        </Text>
      </Box>

      {/* Card Features */}
      <Card>
        <Card.Header title="Card Features" className="border-b-0 px-4 pb-2 pt-3 [&_h4]:text-xs [&_h4]:leading-4" />
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
                className="rounded-(--radius-sm) border border-(--color-border) px-3 py-2"
              >
                <Text variant="caption" color="secondary" className="text-[0.6875rem]">
                  {f.label}
                </Text>
                <Text
                  variant="caption"
                  weight="medium"
                  color={f.enabled ? "success" : "muted"}
                  className="text-[0.625rem]"
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
            <Text variant="micro" color="muted" className="block mb-2 text-[0.625rem] leading-3">
              Daily Spending
            </Text>
            <Text variant="heading" color="primary" weight="semibold" as="p" className="text-[1.375rem] leading-7">
              ₦ {formatNumber(card.daily_spend)}
            </Text>
            <Row justify="between" align="center" className="mt-0.5 mb-2">
              <Text variant="micro" color="muted" className="text-[0.625rem] leading-4">
                of ₦ {formatNumber(card.daily_limit)}
              </Text>
              <Text variant="micro" color="muted">
                {toNumber(card.daily_limit) ? ((toNumber(card.daily_spend) / toNumber(card.daily_limit)) * 100).toFixed(1) : "0"}%
              </Text>
            </Row>
            <ProgressBar
              value={toNumber(card.daily_limit) ? (toNumber(card.daily_spend) / toNumber(card.daily_limit)) * 100 : 0}
              max={100}
              className="h-1.5"
            />
          </Box>
        </Card>
        <Card>
          <Box px={4} py={4}>
            <Text variant="micro" color="muted" className="block mb-2 text-[0.625rem] leading-3">
              Monthly Spending
            </Text>
            <Text variant="heading" color="primary" weight="semibold" as="p" className="text-[1.375rem] leading-7">
              ₦ {formatNumber(card.monthly_spend)}
            </Text>
            <Row justify="between" align="center" className="mt-0.5 mb-2">
              <Text variant="micro" color="muted">
                of ₦ {formatNumber(card.monthly_limit)}
              </Text>
              <Text variant="micro" color="muted">
                {toNumber(card.monthly_limit) ? ((toNumber(card.monthly_spend) / toNumber(card.monthly_limit)) * 100).toFixed(1) : "0"}%
              </Text>
            </Row>
            <ProgressBar
              value={toNumber(card.monthly_limit) ? (toNumber(card.monthly_spend) / toNumber(card.monthly_limit)) * 100 : 0}
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
function TransactionsTab({ card }: { card: CardDetail }) {
  type Tx = CardDetail["transactions"][number];
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
            - ₦ {formatNumber(row.original.amount)}
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
      <Box px={4} py={3} className="border-b border-(--color-border)">
        <Text variant="subtitle" color="primary" weight="semibold" as="p" className="text-xs leading-4">
          Card Transactions
        </Text>
        <Text variant="micro" color="muted" as="p" className="text-[0.625rem] leading-3">
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
function LimitsTab({ card }: { card: CardDetail }) {
  return (
    <Card>
      <Card.Header title="Transaction Limits" className="border-b-0 px-4 pb-2 pt-3 [&_h4]:text-xs [&_h4]:leading-4" />
      <Card.Body padded>
        <Stack gap={0} className="mb-4">
          {[
            {
              label: "Daily Limit",
              value: `₦ ${formatNumber(card.daily_limit)}`,
            },
            {
              label: "Monthly Limit",
              value: `₦ ${formatNumber(card.monthly_limit)}`,
            },
            { label: "Per Transaction", value: "₦ 100,000" },
          ].map((row) => (
            <Row
              key={row.label}
              justify="between"
              align="center"
              className="py-3 border-b border-(--color-border) last:border-0"
            >
              <Text variant="caption" color="secondary" className="text-xs">
                {row.label}
              </Text>
              <Text variant="caption" color="primary" weight="semibold" className="text-xs">
                {row.value}
              </Text>
            </Row>
          ))}
        </Stack>
        <Button className="h-8 w-full justify-center text-[0.6875rem]">Update Limits</Button>
      </Card.Body>
    </Card>
  );
}

// ── Activity Log tab — cd5.PNG ────────────────────────────
function ActivityLogTab({ card }: { card: CardDetail }) {
  return (
    <Stack gap={2}>
      {card.activity_log.map((entry, i) => {
        const title = String(entry.title || "");
        const isDeclined = title.toLowerCase().includes("declined");

        return (
          <Card
            key={i}
            className="rounded-[6px] border-(--color-border) bg-white shadow-none"
          >
            <Box px={4} py={3}>
              <Row justify="between" align="start" gap={4}>
                <Stack gap={1} className="min-w-0">
                  <Text
                    variant="caption"
                    weight="semibold"
                    color={isDeclined ? "danger" : "primary"}
                    className="text-xs leading-4"
                  >
                    {title || "Activity"}
                  </Text>
                  <Text
                    variant="caption"
                    color="secondary"
                    className="text-[0.6875rem] leading-4"
                  >
                    {entry.description}
                  </Text>
                  <Row gap={2} align="center" className="mt-0.5 flex-wrap">
                    <Text variant="micro" color="muted" className="text-[0.625rem] leading-4">
                      IP: {entry.ip}
                    </Text>
                    {entry.location && (
                      <>
                        <Text variant="micro" color="muted" className="text-[0.625rem] leading-4">
                          •
                        </Text>
                        <MapPin size={10} className="text-(--color-text-muted)" />
                        <Text variant="micro" color="muted" className="text-[0.625rem] leading-4">
                          {entry.location}
                        </Text>
                      </>
                    )}
                    {entry.is_admin && (
                      <>
                        <Text variant="micro" color="muted" className="text-[0.625rem] leading-4">
                          •
                        </Text>
                        <Text variant="micro" color="muted" className="text-[0.625rem] leading-4">
                          Admin Action
                        </Text>
                      </>
                    )}
                  </Row>
                </Stack>

                <Text
                  variant="caption"
                  color="secondary"
                  className="shrink-0 text-[0.6875rem] leading-4"
                >
                  {entry.timestamp}
                </Text>
              </Row>
            </Box>
          </Card>
        );
      })}
    </Stack>
  );
}

// ── Main page ─────────────────────────────────────────────
export default function CardDetailPage() {
  usePageTitle(
    "Card Detail",
    "Card transactions, limits, and security controls",
  );

  const { id = "" } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<TabValue>("overview");
  const { data: apiCard } = useCardDetail(id);
  const card = normalizeCardDetail(apiCard);

  return (
    <Box className="min-h-full w-full px-4 py-4 lg:px-5 xl:px-6">
      <DetailPageHeader
        backLabel="Back to Cards"
        backTo="/cards"
        title={
          <Text variant="heading" color="primary" as="h1" className="text-[1.375rem] leading-7">
            {card.type} Card - <span className="font-mono">{card.masked}</span>
          </Text>
        }
        statusPill={<CardStatusPill status={card.status} />}
        idLabel={`ID: ${card.id || id}`}
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
              className="h-8 border border-(--color-danger) bg-white px-3 text-[0.6875rem] text-(--color-danger) hover:bg-(--color-danger-subtle)"
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
        sidebar={<CardSidebar card={card} />}
        sidebarWidth="320px"
        className="w-full"
      >
        <TabsList>
          <Tab value="overview">Overview</Tab>
          <Tab value="transactions">Transactions</Tab>
          <Tab value="limits">Limits & Controls</Tab>
          <Tab value="activity">Activity Log</Tab>
        </TabsList>

        <TabPanel value="overview" className="pt-0">
          <OverviewTab card={card} />
        </TabPanel>
        <TabPanel value="transactions" className="pt-0">
          <TransactionsTab card={card} />
        </TabPanel>
        <TabPanel value="limits" className="pt-0">
          <LimitsTab card={card} />
        </TabPanel>
        <TabPanel value="activity" className="pt-0">
          <ActivityLogTab card={card} />
        </TabPanel>
      </TabsWithSidebar>
    </Box>
  );
}
