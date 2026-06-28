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
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import type { ColumnDef } from "@tanstack/react-table";
import { useCardDetail, useCardTransactions, useCardActivity } from "@/hooks/queries/useCards";
import { CreditCard } from "lucide-react";

type TabValue = "overview" | "transactions" | "limits" | "activity";

function toNumber(value: unknown) {
  const n = typeof value === "number" ? value : Number(value ?? 0);
  return Number.isFinite(n) ? n : 0;
}

function fmt(value: unknown) {
  return toNumber(value).toLocaleString();
}

function str(value: unknown, fallback = "N/A") {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function formatDate(value: unknown) {
  const raw = str(value, "");
  if (!raw || raw === "N/A") return "N/A";
  try {
    return new Intl.DateTimeFormat("en-NG", {
      day: "2-digit", month: "short", year: "numeric",
    }).format(new Date(raw));
  } catch {
    return raw;
  }
}

interface NormalizedCard {
  id: string;
  card_id: string;
  masked: string;
  type: string;
  status: string;
  user_name: string;
  network: string;
  variant: string;
  issued: string;
  balance: number;
  cardholder: string;
  daily_spend: number;
  daily_limit: number;
  monthly_spend: number;
  monthly_limit: number;
  expiry: string;
  currency: string;
  is_usable: boolean;
  is_contactless: boolean;
  total_declined: number;
  pending_debit: number;
}

function normalizeCard(raw: unknown): NormalizedCard {
  const card = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const other = card.other_data && typeof card.other_data === "object"
    ? (card.other_data as Record<string, unknown>)
    : {};

  const rawStatus = String(card.status ?? other.status ?? "ACTIVE").toUpperCase();
  const statusDisplay =
    rawStatus === "ACTIVE" ? "Active"
    : rawStatus === "FROZEN" ? "Frozen"
    : rawStatus === "PENDING" ? "Pending"
    : rawStatus === "BLOCKED" || rawStatus === "CANCELLED" ? "Blocked"
    : "Pending";

  const rawType = String(other.type ?? card.card_type ?? "VIRTUAL").toUpperCase();
  const variant = rawType === "PHYSICAL" ? "Physical" : "Virtual";

  return {
    id: str(card.id, ""),
    card_id: str(card.card_id, ""),
    masked: str(card.masked_pan ?? card.masked_number ?? other.masked_pan, ""),
    type: variant,
    status: statusDisplay,
    user_name: str(card.card_name ?? other.name, "N/A"),
    network: str(card.issuer ?? other.issuer, "Mastercard"),
    variant,
    issued: formatDate(card.created_at),
    balance: toNumber(other.balance ?? card.balance),
    cardholder: str(card.card_name ?? other.name, "N/A").toUpperCase(),
    daily_spend: toNumber(card.daily_spend),
    daily_limit: toNumber(card.daily_limit),
    monthly_spend: toNumber(card.monthly_spend),
    monthly_limit: toNumber(card.monthly_limit),
    expiry: str(card.expiry ?? other.expiry, "N/A"),
    currency: str(card.currency, "USD"),
    is_usable: card.is_usable !== false,
    is_contactless: Boolean(other.is_contactless ?? card.is_contactless),
    total_declined: toNumber(card.total_declined),
    pending_debit: toNumber(card.pending_debit),
  };
}

// ── Status pill ───────────────────────────────────────────
function CardStatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Active: "bg-(--color-success-subtle) text-(--color-success-mid) border border-(--color-success-muted)",
    Frozen: "bg-(--color-warning-subtle) text-(--color-warning-dark) border border-(--color-warning-border)",
    Pending: "bg-(--color-warning-subtle) text-(--color-warning-dark) border border-(--color-warning-border)",
    Blocked: "bg-(--color-danger-subtle)  text-(--color-danger)       border border-(--color-danger-muted)",
  };
  return (
    <span className={["inline-flex items-center px-2 py-0.5 rounded text-[0.625rem] font-semibold leading-none", styles[status] ?? styles.Pending].join(" ")}>
      {status}
    </span>
  );
}

// ── Right sidebar ─────────────────────────────────────────
function CardSidebar({ card }: { card: NormalizedCard }) {
  return (
    <Stack gap={4}>
      <Card>
        <Card.Header title="Quick Actions" className="border-b-0 px-4 pb-2 pt-3 [&_h4]:text-xs [&_h4]:leading-4" />
        <Card.Body className="px-4 pb-4 pt-0">
          <Stack gap={2}>
            <Button variant="primary" size="sm" className="h-8 w-full justify-center text-[0.6875rem]">View User Profile</Button>
            <Button variant="secondary" size="sm" className="h-8 w-full justify-center text-[0.6875rem]">Top Up Balance</Button>
            <Button variant="secondary" size="sm" className="h-8 w-full justify-center text-[0.6875rem]">Reset PIN</Button>
          </Stack>
        </Card.Body>
      </Card>

      <Card>
        <Card.Header title="Card Info" className="border-b-0 px-4 pb-2 pt-3 [&_h4]:text-xs [&_h4]:leading-4" />
        <Card.Body className="px-4 pb-4 pt-0">
          <Stack gap={3}>
            {[
              ["Type", card.type],
              ["Network", card.network],
              ["Currency", card.currency],
              ["Issued", card.issued],
              ["Expires", card.expiry],
              ["Usable", card.is_usable ? "Yes" : "No"],
            ].map(([label, value]) => (
              <Row key={label} justify="between">
                <Text variant="caption" color="secondary" className="text-[0.6875rem]">{label}</Text>
                <Text variant="caption" color="primary" weight="semibold" className="text-[0.6875rem]">{value}</Text>
              </Row>
            ))}
          </Stack>
        </Card.Body>
      </Card>
    </Stack>
  );
}

// ── Overview tab ──────────────────────────────────────────
function OverviewTab({ card }: { card: NormalizedCard }) {
  const [showCVV, setShowCVV] = useState(false);

  return (
    <Stack gap={4}>
      <Box className="relative min-h-55 overflow-hidden rounded-lg p-5 text-white" style={{ background: "linear-gradient(135deg, #4E2BCC 0%, #8200DB 100%)" }}>
        <Row justify="between" align="start">
          <Stack gap={0}>
            <Text variant="micro" className="text-white/70" as="p">Nectaswap Card</Text>
            <Text variant="micro" className="text-white/70" as="p">{card.type}</Text>
          </Stack>
          <Stack gap={0} className="text-right">
            <Text variant="micro" className="text-white/70" as="p">Balance ({card.currency})</Text>
            <Text variant="title" className="text-2xl font-bold leading-7 text-white" as="p">
              {card.currency === "USD" ? "$" : "₦"}{fmt(card.balance)}
            </Text>
          </Stack>
        </Row>

        <Box className="mt-6 mb-5">
          <Row gap={2} align="center">
            <Text variant="subtitle" className="text-white font-mono tracking-[0.25rem]" as="p">
              {card.masked || "•••• •••• •••• ••••"}
            </Text>
            <button className="text-white/60 hover:text-white transition-colors"><Eye size={14} /></button>
          </Row>
        </Box>

        <Row justify="between" align="end">
          <Stack gap={0}>
            <Text variant="micro" className="text-white/60" as="p">Cardholder</Text>
            <Text variant="caption" className="text-white font-semibold tracking-wider" as="p">{card.cardholder}</Text>
          </Stack>
          <Stack gap={0} className="text-center">
            <Text variant="micro" className="text-white/60" as="p">CVV</Text>
            <Row gap={1} align="center">
              <Text variant="caption" className="text-white font-mono" as="p">•••</Text>
              <button onClick={() => setShowCVV(v => !v)} className="text-white/60 hover:text-white">
                {showCVV ? <EyeOff size={12} /> : <Eye size={12} />}
              </button>
            </Row>
          </Stack>
          <Stack gap={0} className="text-right">
            <Text variant="micro" className="text-white/60" as="p">Expiry</Text>
            <Text variant="caption" className="text-white font-mono" as="p">{card.expiry}</Text>
          </Stack>
        </Row>

        <Text variant="subtitle" className="absolute bottom-4 right-4 text-white/20 font-bold italic text-xl" as="p">
          {card.network}
        </Text>
      </Box>

      <Card>
        <Card.Header title="Card Features" className="border-b-0 px-4 pb-2 pt-3 [&_h4]:text-xs [&_h4]:leading-4" />
        <Card.Body padded>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Usable", enabled: card.is_usable },
              { label: "Contactless", enabled: card.is_contactless },
            ].map(f => (
              <Row key={f.label} justify="between" align="center" className="rounded-(--radius-sm) border border-(--color-border) px-3 py-2">
                <Text variant="caption" color="secondary" className="text-[0.6875rem]">{f.label}</Text>
                <Text variant="caption" weight="medium" color={f.enabled ? "success" : "muted"} className="text-[0.625rem]">
                  {f.enabled ? "Enabled" : "Disabled"}
                </Text>
              </Row>
            ))}
            <Row justify="between" align="center" className="rounded-(--radius-sm) border border-(--color-border) px-3 py-2">
              <Text variant="caption" color="secondary" className="text-[0.6875rem]">Total Declined</Text>
              <Text variant="caption" weight="medium" color={card.total_declined > 0 ? "danger" : "muted"} className="text-[0.625rem]">
                {card.total_declined}
              </Text>
            </Row>
            <Row justify="between" align="center" className="rounded-(--radius-sm) border border-(--color-border) px-3 py-2">
              <Text variant="caption" color="secondary" className="text-[0.6875rem]">Pending Debit</Text>
              <Text variant="caption" weight="medium" color="muted" className="text-[0.625rem]">
                {card.currency === "USD" ? "$" : "₦"}{fmt(card.pending_debit)}
              </Text>
            </Row>
          </div>
        </Card.Body>
      </Card>

      {(card.daily_limit > 0 || card.monthly_limit > 0) && (
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <Box px={4} py={4}>
              <Text variant="micro" color="muted" className="block mb-2 text-[0.625rem] leading-3">Daily Spending</Text>
              <Text variant="heading" color="primary" weight="semibold" as="p" className="text-[1.375rem] leading-7">
                ₦{fmt(card.daily_spend)}
              </Text>
              <Row justify="between" align="center" className="mt-0.5 mb-2">
                <Text variant="micro" color="muted" className="text-[0.625rem] leading-4">of ₦{fmt(card.daily_limit)}</Text>
                <Text variant="micro" color="muted">
                  {card.daily_limit ? ((card.daily_spend / card.daily_limit) * 100).toFixed(1) : "0"}%
                </Text>
              </Row>
              <ProgressBar value={card.daily_limit ? (card.daily_spend / card.daily_limit) * 100 : 0} max={100} className="h-1.5" />
            </Box>
          </Card>
          <Card>
            <Box px={4} py={4}>
              <Text variant="micro" color="muted" className="block mb-2 text-[0.625rem] leading-3">Monthly Spending</Text>
              <Text variant="heading" color="primary" weight="semibold" as="p" className="text-[1.375rem] leading-7">
                ₦{fmt(card.monthly_spend)}
              </Text>
              <Row justify="between" align="center" className="mt-0.5 mb-2">
                <Text variant="micro" color="muted">of ₦{fmt(card.monthly_limit)}</Text>
                <Text variant="micro" color="muted">
                  {card.monthly_limit ? ((card.monthly_spend / card.monthly_limit) * 100).toFixed(1) : "0"}%
                </Text>
              </Row>
              <ProgressBar value={card.monthly_limit ? (card.monthly_spend / card.monthly_limit) * 100 : 0} max={100} className="h-1.5" />
            </Box>
          </Card>
        </div>
      )}
    </Stack>
  );
}

// ── Transactions tab ──────────────────────────────────────
function TransactionsTab({ cardId }: { cardId: string }) {
  const { data: rawTxs = [], isLoading } = useCardTransactions(cardId);

  type TxRow = { date: string; description: string; amount: string; currency: string; status: string; reference: string };

  const txs = useMemo<TxRow[]>(
    () =>
      (Array.isArray(rawTxs) ? rawTxs : []).map((item): TxRow => {
        const tx = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
        const rawStatus = String(tx.status ?? "pending").toLowerCase();
        const status = rawStatus === "success" || rawStatus === "completed" ? "Completed" : rawStatus === "failed" ? "Failed" : "Pending";
        return {
          date: str(tx.created_at ?? tx.date, "N/A"),
          description: str(tx.description ?? tx.title ?? tx.note, "N/A"),
          amount: str(tx.amount, "0"),
          currency: str(tx.currency ?? tx.card_currency, "USD"),
          status,
          reference: str(tx.reference ?? tx.transaction_id ?? tx.id, "N/A"),
        };
      }),
    [rawTxs],
  );

  const cols = useMemo<ColumnDef<TxRow, unknown>[]>(
    () => [
      {
        accessorKey: "date",
        header: "Date",
        cell: ({ getValue }) => (
          <Text variant="caption" color="secondary">{formatDate(getValue<string>())}</Text>
        ),
      },
      {
        accessorKey: "description",
        header: "Description",
        cell: ({ getValue }) => (
          <Text variant="caption" color="primary" weight="semibold">{getValue<string>()}</Text>
        ),
      },
      {
        accessorKey: "reference",
        header: "Reference",
        cell: ({ getValue }) => (
          <Text variant="caption" color="secondary" className="font-mono text-xs">{getValue<string>()}</Text>
        ),
      },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => (
          <Text variant="caption" weight="medium" color={row.original.status === "Failed" ? "danger" : "primary"}>
            {row.original.currency === "USD" ? "$" : "₦"}{Number(row.original.amount).toLocaleString()}
          </Text>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => (
          <Text variant="caption" weight="medium" color={getValue<string>() === "Completed" ? "success" : getValue<string>() === "Failed" ? "danger" : "muted"}>
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
        <Text variant="subtitle" color="primary" weight="semibold" as="p" className="text-xs leading-4">Card Transactions</Text>
        <Text variant="micro" color="muted" as="p" className="text-[0.625rem] leading-3">All transactions made with this card</Text>
      </Box>
      {isLoading ? (
        <Box p={4}><Text variant="caption" color="muted">Loading...</Text></Box>
      ) : (
        <DataTable data={txs} columns={cols} emptyTitle="No transactions" emptyMessage="No card transactions found" />
      )}
    </Card>
  );
}

// ── Limits tab ────────────────────────────────────────────
function LimitsTab({ card }: { card: NormalizedCard }) {
  return (
    <Card>
      <Card.Header title="Transaction Limits" className="border-b-0 px-4 pb-2 pt-3 [&_h4]:text-xs [&_h4]:leading-4" />
      <Card.Body padded>
        <Stack gap={0} className="mb-4">
          {[
            { label: "Daily Limit", value: card.daily_limit > 0 ? `₦${fmt(card.daily_limit)}` : "N/A" },
            { label: "Monthly Limit", value: card.monthly_limit > 0 ? `₦${fmt(card.monthly_limit)}` : "N/A" },
            { label: "Pending Debit", value: `${card.currency === "USD" ? "$" : "₦"}${fmt(card.pending_debit)}` },
          ].map(row => (
            <Row key={row.label} justify="between" align="center" className="py-3 border-b border-(--color-border) last:border-0">
              <Text variant="caption" color="secondary" className="text-xs">{row.label}</Text>
              <Text variant="caption" color="primary" weight="semibold" className="text-xs">{row.value}</Text>
            </Row>
          ))}
        </Stack>
        <Button className="h-8 w-full justify-center text-[0.6875rem]">Update Limits</Button>
      </Card.Body>
    </Card>
  );
}

// ── Activity Log tab ──────────────────────────────────────
function ActivityLogTab({ cardId }: { cardId: string }) {
  const { data: rawActivity = [], isLoading } = useCardActivity(cardId);

  const entries = useMemo(
    () =>
      (Array.isArray(rawActivity) ? rawActivity : []).map((item, i) => {
        const ev = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
        const details = ev.activity_details && typeof ev.activity_details === "object"
          ? (ev.activity_details as Record<string, unknown>)
          : {};
        return {
          id: str(ev.id, `act-${i}`),
          title: str(ev.activity_type ?? ev.action ?? ev.title, "Activity"),
          description: str(ev.activity_description ?? ev.description, "N/A"),
          timestamp: str(ev.activity_timestamp ?? ev.created_at ?? ev.timestamp, "N/A"),
          ip: str(ev.request_ip ?? ev.ip ?? ev.ip_address, "N/A"),
          location: str(details.location ?? ev.location, ""),
          is_admin: Boolean(ev.is_admin ?? ev.admin_action),
        };
      }),
    [rawActivity],
  );

  if (isLoading) return <Box p={4}><Text variant="caption" color="muted">Loading...</Text></Box>;

  if (!entries.length) {
    return (
      <EmptyState icon={CreditCard} title="No activity" description="Card activity will appear here" />
    );
  }

  return (
    <Stack gap={2}>
      {entries.map(entry => {
        const isDeclined = entry.title.toLowerCase().includes("declined");
        return (
          <Card key={entry.id} className="rounded-[6px] border-(--color-border) bg-white shadow-none">
            <Box px={4} py={3}>
              <Row justify="between" align="start" gap={4}>
                <Stack gap={1} className="min-w-0">
                  <Text variant="caption" weight="semibold" color={isDeclined ? "danger" : "primary"} className="text-xs leading-4">
                    {entry.title}
                  </Text>
                  <Text variant="caption" color="secondary" className="text-[0.6875rem] leading-4">{entry.description}</Text>
                  <Row gap={2} align="center" className="mt-0.5 flex-wrap">
                    <Text variant="micro" color="muted" className="text-[0.625rem] leading-4">IP: {entry.ip}</Text>
                    {entry.location && (
                      <>
                        <Text variant="micro" color="muted" className="text-[0.625rem] leading-4">•</Text>
                        <MapPin size={10} className="text-(--color-text-muted)" />
                        <Text variant="micro" color="muted" className="text-[0.625rem] leading-4">{entry.location}</Text>
                      </>
                    )}
                    {entry.is_admin && (
                      <>
                        <Text variant="micro" color="muted" className="text-[0.625rem] leading-4">•</Text>
                        <Text variant="micro" color="muted" className="text-[0.625rem] leading-4">Admin Action</Text>
                      </>
                    )}
                  </Row>
                </Stack>
                <Text variant="caption" color="secondary" className="shrink-0 text-[0.6875rem] leading-4">{entry.timestamp}</Text>
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
  usePageTitle("Card Detail", "Card transactions, limits, and security controls");

  const { id = "" } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<TabValue>("overview");
  const { data: apiCard, isLoading } = useCardDetail(id);

  const card = useMemo(() => normalizeCard(apiCard ?? {}), [apiCard]);

  if (isLoading) {
    return (
      <Box className="min-h-full w-full px-4 py-4 lg:px-5 xl:px-6">
        <Stack gap={3} className="mb-8">
          <Skeleton className="h-8 w-64 rounded-(--radius-md)" />
          <Skeleton className="h-5 w-80 rounded-(--radius-sm)" />
        </Stack>
      </Box>
    );
  }

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
        idLabel={`ID: ${card.card_id || id}`}
        meta={
          <>
            <Text variant="caption" color="tertiary">{card.user_name}</Text>
            <Text variant="micro" color="muted">•</Text>
            <Text variant="caption" color="tertiary">{card.network} {card.variant}</Text>
            <Text variant="micro" color="muted">•</Text>
            <Text variant="caption" color="tertiary">Issued: {card.issued}</Text>
          </>
        }
        actions={
          <>
            <Button variant="secondary" size="sm" className="h-8 w-8 p-0 flex items-center justify-center">
              <Download size={14} />
            </Button>
            <Button size="sm" className="h-8 border border-(--color-danger) bg-white px-3 text-[0.6875rem] text-(--color-danger) hover:bg-(--color-danger-subtle)">
              <Lock size={13} />
              Freeze Card
            </Button>
          </>
        }
      />

      <TabsWithSidebar
        value={activeTab}
        onChange={v => setActiveTab(v as TabValue)}
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
          <TransactionsTab cardId={id} />
        </TabPanel>
        <TabPanel value="limits" className="pt-0">
          <LimitsTab card={card} />
        </TabPanel>
        <TabPanel value="activity" className="pt-0">
          <ActivityLogTab cardId={id} />
        </TabPanel>
      </TabsWithSidebar>
    </Box>
  );
}
