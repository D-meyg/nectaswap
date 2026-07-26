import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Wifi, CreditCard } from "lucide-react";

import { usePageActions, usePageTitle } from "@/layouts/AppLayout";
import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { Row } from "@/components/ui/Row";
import { Stack } from "@/components/ui/Stack";
import { Box } from "@/components/ui/Box";
import { Button } from "@/components/ui/Button";
import { Toggle } from "@/components/ui/Toggle";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { DataTable } from "@/components/tables/DataTable";
import { cn } from "@/lib/utils";
import { useCards, useCardDetail, useCardActivity } from "@/hooks/queries/useCards";
import { useTeamActivityLogs } from "@/hooks/queries/useTeam";
import { useUpdateCardLimits } from "@/hooks/mutations/useCardMutations";
import type { CardLimitsUpdate } from "@/services/cardService";
import type { ColumnDef } from "@tanstack/react-table";

// ── Config ────────────────────────────────────────────────
const LIMIT_TIERS = [
  { key: "daily_limit", label: "Daily Limit" },
  { key: "weekly_limit", label: "Weekly Limit" },
  { key: "monthly_limit", label: "Monthly Limit" },
  { key: "per_transaction_limit", label: "Single Transaction Limit" },
  { key: "atm_limit", label: "ATM Limit" },
  { key: "international_limit", label: "International Spending Limit" },
] as const;

const PERMISSION_TOGGLES = [
  { key: "enable_online_payments", label: "Enable Online Payments" },
  { key: "enable_contactless", label: "Enable Contactless" },
  { key: "enable_international", label: "Enable International Transactions" },
  { key: "enable_atm_withdrawals", label: "Enable ATM Withdrawals" },
  { key: "enable_recurring_payments", label: "Enable Recurring Payments" },
  { key: "merchant_restrictions", label: "Merchant Restrictions" },
  { key: "temporary_lock", label: "Temporary Lock" },
] as const;

const SECURITY_TOGGLES = [
  { key: "require_otp", label: "Require OTP" },
  { key: "require_3ds", label: "Require 3DS" },
  { key: "require_cvv", label: "Require CVV" },
  { key: "enable_risk_detection", label: "Enable Risk Detection" },
] as const;

const LIMIT_KEYS = LIMIT_TIERS.map((t) => t.key);
const TOGGLE_KEYS = [...PERMISSION_TOGGLES, ...SECURITY_TOGGLES].map((t) => t.key);

// ── Helpers ───────────────────────────────────────────────
function num(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value ?? 0);
  return Number.isFinite(n) ? n : 0;
}
function str(value: unknown, fallback = ""): string {
  return typeof value === "string" && value.trim() ? value : fallback;
}
function bool(value: unknown): boolean {
  return value === true || value === "true" || value === 1;
}
function obj(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}
function get(o: Record<string, unknown>, keys: string[]): unknown {
  for (const k of keys) if (o[k] !== undefined && o[k] !== null) return o[k];
  return undefined;
}
function fmtNaira(value: number) {
  return `₦ ${value.toLocaleString()}`;
}
function last4(masked: string) {
  const digits = masked.replace(/\D/g, "");
  return digits.slice(-4) || "••••";
}
function extractArray(raw: unknown): unknown[] {
  if (Array.isArray(raw)) return raw;
  const o = obj(raw);
  const arr = [o.data, o.items, o.results, o.logs, o.activity].find(Array.isArray);
  return (arr as unknown[]) ?? [];
}

interface CardChip {
  id: string;
  masked: string;
  label: string;
  type: "Virtual" | "Physical";
  status: "Active" | "Frozen";
  currency: string;
  network: string;
  cardholder: string;
}

function normalizeChip(raw: unknown, index: number): CardChip {
  const c = obj(raw);
  const other = obj(c.other_data);
  const masked = str(get(c, ["masked_pan", "masked", "masked_number"]) ?? get(other, ["masked_pan"]), "•••• •••• •••• ••••");
  const name = str(get(c, ["card_name", "name"]) ?? get(other, ["name"]), "Card");
  const type = String(get(c, ["card_type"]) ?? get(other, ["type"]) ?? "virtual").toLowerCase().includes("phys") ? "Physical" : "Virtual";
  const status = String(get(c, ["status"]) ?? get(other, ["status"]) ?? "active").toLowerCase().includes("froz") ? "Frozen" : "Active";
  return {
    id: str(get(c, ["card_id", "id"]), `card-${index}`),
    masked,
    label: name.toUpperCase(),
    type,
    status,
    currency: str(get(c, ["currency"]) ?? get(other, ["currency"]), ""),
    network: str(get(c, ["issuer", "network"]) ?? get(other, ["issuer"]), "Mastercard"),
    cardholder: name.toUpperCase(),
  };
}

function ChipButton({ card, selected, onSelect }: { card: CardChip; selected: boolean; onSelect: () => void }) {
  const isVirtual = card.type === "Virtual";
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex items-center gap-3 rounded-lg border px-3.5 py-3 text-left transition-all focus:outline-none",
        selected ? "border-(--color-brand) bg-(--color-brand)/[0.04] shadow-[0_2px_8px_rgba(78,43,204,0.08)]" : "border-(--color-border) bg-white hover:border-(--color-text-muted)",
      )}
    >
      <span className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[0.6875rem] font-bold", isVirtual ? "bg-[rgba(78,43,204,0.08)] text-(--color-brand)" : "bg-[rgba(10,133,209,0.08)] text-[#0A85D1]")}>
        {isVirtual ? "V" : "P"}
      </span>
      <Stack gap={0} className="min-w-0">
        <Text variant="caption" color="primary" weight="semibold" className="font-mono text-[0.75rem] leading-4" as="p">**** **** **** {last4(card.masked)}</Text>
        <Text variant="micro" color="muted" className="text-[0.625rem] uppercase tracking-[0.04em] leading-4" as="p">{card.label}</Text>
        <Row gap={2} align="center" className="mt-0.5">
          <span className={cn("inline-flex rounded px-1.5 py-px text-[0.5625rem] font-semibold leading-4", card.status === "Active" ? "bg-(--color-success-subtle) text-(--color-success-mid)" : "bg-(--color-danger-subtle) text-(--color-danger)")}>{card.status}</span>
          {card.currency && <Text variant="micro" color="muted" className="text-[0.5625rem]">{card.currency}</Text>}
          <Text variant="micro" color="muted" className="text-[0.5625rem]">{card.network}</Text>
        </Row>
      </Stack>
    </button>
  );
}

function CardVisual({ card }: { card: CardChip }) {
  return (
    <Box className="relative min-h-44 w-full max-w-[20.5rem] overflow-hidden rounded-xl p-5 text-white shadow-[0_8px_24px_rgba(78,43,204,0.25)]" style={{ background: "linear-gradient(135deg, #4E2BCC 0%, #8200DB 100%)" }}>
      <Row justify="between" align="start">
        <Stack gap={0}>
          <Text variant="micro" className="text-white/70" as="p">NectaSwap Card</Text>
          <Text variant="caption" className="font-semibold text-white" as="p">{card.type}</Text>
        </Stack>
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15"><Wifi size={13} className="rotate-90 text-white" /></span>
      </Row>
      <Box className="mt-6 mb-5">
        <Text variant="subtitle" className="font-mono tracking-[0.25rem] text-white" as="p">**** **** **** {last4(card.masked)}</Text>
      </Box>
      <Row justify="between" align="end">
        <Stack gap={0}>
          <Text variant="micro" className="text-white/60" as="p">Cardholder</Text>
          <Text variant="caption" className="font-semibold tracking-wider text-white" as="p">{card.cardholder}</Text>
        </Stack>
      </Row>
      <Text variant="subtitle" className="absolute bottom-4 right-4 text-xl font-bold italic text-white/20" as="p">{card.network}</Text>
    </Box>
  );
}

function ToggleRow({ label, checked, onChange, disabled }: { label: string; checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <Row justify="between" align="center" className="py-1.5">
      <Text variant="caption" color="secondary" className="text-[0.75rem]">{label}</Text>
      <Toggle checked={checked} onChange={onChange} size="sm" disabled={disabled} />
    </Row>
  );
}

function SecurityActionRow({ label, description, action, danger }: { label: string; description: string; action: string; danger?: boolean }) {
  return (
    <Row justify="between" align="center" className="border-b border-(--color-border) py-3 first:pt-1">
      <Stack gap={0} className="min-w-0">
        <Text variant="caption" color="primary" weight="medium" className="text-[0.75rem]" as="p">{label}</Text>
        <Text variant="micro" color="muted" className="text-[0.625rem]" as="p">{description}</Text>
      </Stack>
      <button type="button" className={cn("shrink-0 font-geom text-[0.6875rem] font-medium transition-opacity hover:opacity-75 focus:outline-none", danger ? "text-(--color-danger)" : "text-(--color-brand)")}>{action}</button>
    </Row>
  );
}

interface ActivityRow { merchant: string; amount: number; currency: string; country: string; status: string; date: string; risk: string }
interface ChangeRow { title: string; description: string; admin: string; timestamp: string }

function normalizeActivity(raw: unknown): ActivityRow {
  const a = obj(raw);
  return {
    merchant: str(get(a, ["merchant", "merchant_name", "description", "title", "activity_type"]), "—"),
    amount: num(get(a, ["amount", "value"])),
    currency: str(get(a, ["currency", "card_currency"]), "—"),
    country: str(get(a, ["country", "location", "country_code"]), "—"),
    status: str(get(a, ["status", "state"]), "—"),
    date: str(get(a, ["date", "created_at", "activity_timestamp", "timestamp"]), "—"),
    risk: str(get(a, ["risk", "risk_level"]), "—"),
  };
}

function normalizeChange(raw: unknown): ChangeRow {
  const c = obj(raw);
  const admin = obj(c.admin);
  return {
    title: str(get(c, ["title", "action", "activity_type", "event"]), "Change"),
    description: str(get(c, ["description", "details", "message", "summary"]), ""),
    admin: str(get(c, ["admin_name", "actor", "performed_by"]) ?? get(admin, ["name", "full_name"]), "—"),
    timestamp: str(get(c, ["created_at", "timestamp", "date"]), ""),
  };
}

export default function CardLimitsControlsPage() {
  usePageTitle(
    "Card Limits & Controls",
    "Manage spending limits, permissions and card security policies",
  );

  const { data: rawCards = [], isLoading: cardsLoading } = useCards();
  const cards = useMemo(() => (Array.isArray(rawCards) ? rawCards.map(normalizeChip) : []), [rawCards]);

  // Selection (no init effect — fall back to first card in render)
  const [selectedIdState, setSelectedIdState] = useState("");
  const selectedId = selectedIdState || cards[0]?.id || "";
  const selectedChip = cards.find((c) => c.id === selectedId) ?? cards[0];

  const { data: rawDetail, isLoading: detailLoading } = useCardDetail(selectedId);
  const { data: rawActivity = [], isLoading: activityLoading } = useCardActivity(selectedId);
  const { data: rawChanges = [], isLoading: changesLoading } = useTeamActivityLogs({
    category: "card_limits_updated",
    page: 1,
    limit: 20,
  });

  const updateLimits = useUpdateCardLimits();

  // Server values (derived) + local edit overlay (avoids setState-in-effect)
  const serverLimits = useMemo(() => {
    const d = obj(rawDetail);
    const other = obj(d.other_data);
    const o: Record<string, number> = {};
    LIMIT_KEYS.forEach((k) => { o[k] = num(get(d, [k]) ?? get(other, [k])); });
    return o;
  }, [rawDetail]);

  const serverToggles = useMemo(() => {
    const d = obj(rawDetail);
    const other = obj(d.other_data);
    const o: Record<string, boolean> = {};
    TOGGLE_KEYS.forEach((k) => { o[k] = bool(get(d, [k]) ?? get(other, [k])); });
    return o;
  }, [rawDetail]);

  const [limitEdits, setLimitEdits] = useState<Record<string, number>>({});
  const [toggleEdits, setToggleEdits] = useState<Record<string, boolean>>({});
  const [editingKey, setEditingKey] = useState<string | null>(null);

  const getLimit = (k: string) => (k in limitEdits ? limitEdits[k] : serverLimits[k] ?? 0);
  const getToggle = (k: string) => (k in toggleEdits ? toggleEdits[k] : serverToggles[k] ?? false);
  const dirty = Object.keys(limitEdits).length > 0 || Object.keys(toggleEdits).length > 0;

  const selectCard = (id: string) => {
    setSelectedIdState(id);
    setLimitEdits({});
    setToggleEdits({});
    setEditingKey(null);
  };

  const handleSave = () => {
    if (!selectedId) return;
    const payload = { card_id: selectedId } as CardLimitsUpdate;
    const bag = payload as unknown as Record<string, unknown>;
    LIMIT_KEYS.forEach((k) => { bag[k] = getLimit(k); });
    TOGGLE_KEYS.forEach((k) => { bag[k] = getToggle(k); });
    updateLimits.mutate(payload, {
      onSuccess: () => { setLimitEdits({}); setToggleEdits({}); setEditingKey(null); },
    });
  };

  usePageActions(
    useMemo(
      () =>
        dirty ? (
          <Button size="sm" disabled={updateLimits.isPending} onClick={handleSave} className="h-8 px-4 text-[0.6875rem]">
            {updateLimits.isPending ? "Saving..." : "Save Changes"}
          </Button>
        ) : null,
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [dirty, updateLimits.isPending, limitEdits, toggleEdits, serverLimits, serverToggles, selectedId],
    ),
  );

  const activity = useMemo(() => extractArray(rawActivity).map(normalizeActivity), [rawActivity]);
  const changes = useMemo(() => extractArray(rawChanges).map(normalizeChange), [rawChanges]);

  const limitCeiling = Math.max(1, ...LIMIT_KEYS.map((k) => getLimit(k)));

  const activityColumns = useMemo<ColumnDef<ActivityRow, unknown>[]>(
    () => [
      { accessorKey: "merchant", header: "Merchant", enableSorting: false, cell: ({ getValue }) => (<Text variant="caption" color="primary" weight="medium">{getValue<string>()}</Text>) },
      { accessorKey: "amount", header: "Amount", enableSorting: false, cell: ({ getValue }) => (<Text variant="caption" color="primary" weight="semibold">{fmtNaira(getValue<number>())}</Text>) },
      { accessorKey: "currency", header: "Currency", enableSorting: false, cell: ({ getValue }) => (<Text variant="caption" color="secondary">{getValue<string>()}</Text>) },
      { accessorKey: "country", header: "Country", enableSorting: false, cell: ({ getValue }) => (<Text variant="caption" color="secondary">{getValue<string>()}</Text>) },
      {
        accessorKey: "status", header: "Status", enableSorting: false,
        cell: ({ getValue }) => {
          const s = getValue<string>().toLowerCase();
          const color = s.includes("approv") ? "text-(--color-success-mid)" : s.includes("declin") || s.includes("fail") ? "text-(--color-danger)" : "text-(--color-warning-text)";
          return (<span className={cn("font-geom text-xs font-medium", color)}>{getValue<string>()}</span>);
        },
      },
      { accessorKey: "date", header: "Date", enableSorting: false, cell: ({ getValue }) => (<Text variant="caption" color="secondary">{getValue<string>()}</Text>) },
      {
        accessorKey: "risk", header: "Risk", enableSorting: false,
        cell: ({ getValue }) => {
          const r = getValue<string>().toLowerCase();
          const color = r.includes("low") ? "text-(--color-success-mid)" : r.includes("med") ? "text-(--color-warning-text)" : r.includes("high") ? "text-(--color-danger)" : "text-(--color-text-muted)";
          return (<span className={cn("font-geom text-xs font-semibold", color)}>{getValue<string>()}</span>);
        },
      },
    ],
    [],
  );

  if (cardsLoading) {
    return (
      <Box p={6} className="space-y-5">
        <Skeleton className="h-40 rounded-lg" />
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <Skeleton className="h-72 rounded-lg lg:col-span-2" />
          <Skeleton className="h-72 rounded-lg" />
        </div>
      </Box>
    );
  }

  if (!cards.length || !selectedChip) {
    return (
      <Box p={6}>
        <EmptyState icon={CreditCard} title="No cards available" description="There are no cards to manage limits and controls for yet." />
      </Box>
    );
  }

  return (
    <Box p={6} className="space-y-5">
      {/* Card selector + visual */}
      <Card>
        <Box px={5} py={4}>
          <Text variant="micro" color="tertiary" weight="semibold" uppercase className="mb-3 block tracking-[0.06em] text-[0.625rem]">Select Card</Text>
          <Row gap={3} align="stretch" className="flex-wrap">
            {cards.map((card) => (
              <ChipButton key={card.id} card={card} selected={card.id === selectedId} onSelect={() => selectCard(card.id)} />
            ))}
          </Row>
          <Link to={`/cards/${selectedChip.id}`} className="mt-3 inline-flex items-center gap-1.5 font-geom text-[0.6875rem] font-medium text-(--color-brand) transition-opacity hover:opacity-75">
            View full card detail
            <ArrowRight size={12} />
          </Link>
          <Box className="mt-4">
            <CardVisual card={selectedChip} />
          </Box>
        </Box>
      </Card>

      {/* Limits + permissions/security */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2 self-start">
          <Card.Header title="Spending Limits" className="border-b-0 px-5 pb-1 pt-4 [&_h4]:text-[0.8125rem] [&_h4]:leading-5" />
          <Card.Body className="px-5 pb-5 pt-2">
            {detailLoading ? (
              <Stack gap={4}>{Array.from({ length: 4 }).map((_, i) => (<Skeleton key={i} className="h-8 rounded" />))}</Stack>
            ) : (
              <Stack gap={0}>
                {LIMIT_TIERS.map((tier) => {
                  const value = getLimit(tier.key);
                  const pct = Math.min(100, Math.max(0, (value / limitCeiling) * 100));
                  const editing = editingKey === tier.key;
                  return (
                    <Box key={tier.key} className="border-b border-(--color-border) py-4 last:border-b-0 last:pb-0 first:pt-0">
                      <Row justify="between" align="start" gap={4}>
                        <Stack gap={2} className="min-w-0 flex-1 pt-0.5">
                          <Text variant="caption" color="secondary" className="text-[0.75rem]">{tier.label}</Text>
                          <div className="h-1 w-full max-w-[13.75rem] overflow-hidden rounded-full bg-(--color-border)">
                            <div className="h-full rounded-full bg-(--color-brand) transition-all duration-500" style={{ width: `${pct}%` }} />
                          </div>
                        </Stack>
                        <Row gap={3} align="center" className="shrink-0">
                          {editing ? (
                            <input
                              type="number"
                              autoFocus
                              value={value}
                              onChange={(e) => setLimitEdits((cur) => ({ ...cur, [tier.key]: num(e.target.value) }))}
                              onBlur={() => setEditingKey(null)}
                              onKeyDown={(e) => { if (e.key === "Enter") setEditingKey(null); }}
                              className="h-7 w-32 rounded-(--radius-sm) border border-(--color-brand) px-2 text-right font-geom text-[0.8125rem] outline-none"
                            />
                          ) : (
                            <Text variant="caption" color="primary" weight="semibold">{fmtNaira(value)}</Text>
                          )}
                          <button type="button" onClick={() => setEditingKey(editing ? null : tier.key)} className="font-geom text-[0.6875rem] font-medium text-(--color-brand) transition-opacity hover:opacity-75 focus:outline-none">
                            {editing ? "Done" : "Edit"}
                          </button>
                        </Row>
                      </Row>
                    </Box>
                  );
                })}
              </Stack>
            )}
          </Card.Body>
        </Card>

        <Stack gap={5}>
          <Card>
            <Card.Header title="Card Permissions" className="border-b-0 px-5 pb-1 pt-4 [&_h4]:text-[0.8125rem] [&_h4]:leading-5" />
            <Card.Body className="px-5 pb-4 pt-1">
              <Stack gap={0}>
                {PERMISSION_TOGGLES.map((p) => (
                  <ToggleRow key={p.key} label={p.label} checked={getToggle(p.key)} disabled={detailLoading} onChange={(next) => setToggleEdits((c) => ({ ...c, [p.key]: next }))} />
                ))}
              </Stack>
            </Card.Body>
          </Card>

          <Card>
            <Card.Header title="Security Controls" className="border-b-0 px-5 pb-1 pt-4 [&_h4]:text-[0.8125rem] [&_h4]:leading-5" />
            <Card.Body className="px-5 pb-4 pt-1">
              <Stack gap={0} className="mb-2">
                <SecurityActionRow label="PIN Reset" description="Reset card PIN" action="Reset" />
                <SecurityActionRow label="Replace Card" description="Issue a replacement card" action="Replace" />
                <SecurityActionRow label="Terminate Card" description="Permanently terminate this card" action="Terminate" danger />
              </Stack>
              <Stack gap={0}>
                {SECURITY_TOGGLES.map((t) => (
                  <ToggleRow key={t.key} label={t.label} checked={getToggle(t.key)} disabled={detailLoading} onChange={(next) => setToggleEdits((c) => ({ ...c, [t.key]: next }))} />
                ))}
              </Stack>
            </Card.Body>
          </Card>
        </Stack>
      </div>

      {/* Recent card activity */}
      <Card noPadding>
        <Box px={5} py={4} className="border-b border-(--color-border) bg-(--color-bg-subtle)">
          <Text variant="subtitle" color="primary" weight="semibold" as="p">Recent Card Activity</Text>
        </Box>
        <DataTable data={activity} columns={activityColumns} loading={activityLoading} emptyTitle="No recent activity" emptyMessage="Card activity will appear here." />
      </Card>

      {/* Recent changes */}
      <Card noPadding>
        <Box px={5} py={4} className="border-b border-(--color-border) bg-(--color-bg-subtle)">
          <Text variant="subtitle" color="primary" weight="semibold" as="p">Recent Changes</Text>
        </Box>
        <Box px={5} py={2}>
          {changesLoading ? (
            <Stack gap={3} className="py-3">{Array.from({ length: 3 }).map((_, i) => (<Skeleton key={i} className="h-10 rounded" />))}</Stack>
          ) : changes.length === 0 ? (
            <Box py={6}>
              <EmptyState icon={CreditCard} title="No recent changes" description="Limit and permission changes will be logged here." />
            </Box>
          ) : (
            <Stack gap={0}>
              {changes.map((change, i) => (
                <Row key={i} justify="between" align="start" gap={4} className="border-b border-(--color-border) py-3.5 last:border-b-0">
                  <Row gap={3} align="start" className="min-w-0">
                    <span className="mt-0.5 h-3.5 w-3.5 shrink-0 rounded-full border-2 border-(--color-brand)/50" />
                    <Stack gap={0} className="min-w-0">
                      <Text variant="caption" color="primary" weight="semibold" className="text-[0.75rem]" as="p">{change.title}</Text>
                      {change.description && <Text variant="micro" color="muted" className="text-[0.625rem]" as="p">{change.description}</Text>}
                    </Stack>
                  </Row>
                  <Stack gap={0} className="shrink-0 items-end text-right">
                    <Text variant="micro" color="secondary" weight="medium" className="text-[0.6875rem]" as="p">{change.admin}</Text>
                    <Text variant="micro" color="muted" className="text-[0.625rem]" as="p">{change.timestamp}</Text>
                  </Stack>
                </Row>
              ))}
            </Stack>
          )}
        </Box>
      </Card>
    </Box>
  );
}
