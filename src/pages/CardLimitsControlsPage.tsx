import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, Wifi, CreditCard, ChevronDown, Search } from "lucide-react";

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
import { formatDate } from "@/lib/date";
import { useCards, useCardDetail, useCardActivity } from "@/hooks/queries/useCards";
import { useDebounce } from "@/hooks/ui/useDebounce";
import { useTeamActivityLogs } from "@/hooks/queries/useTeam";
import {
  useUpdateCardLimits,
  useResetCardPin,
  useReplaceCard,
  useTerminateCard,
} from "@/hooks/mutations/useCardMutations";
import type { CardLimitsUpdate } from "@/services/cardService";
import type { ColumnDef } from "@tanstack/react-table";

// ── Config ────────────────────────────────────────────────
/** Cards requested per page — the picker searches instead of listing all. */
const CARD_PAGE_SIZE = 25;

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

/* Replaced by CardPicker — kept for reference should a small-list layout be
   wanted again.

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
*/

/**
 * Card selector.
 *
 * Rendering every card as a chip does not survive a large portfolio (10k+
 * cards would mean a huge payload and thousands of DOM nodes), so the picker
 * shows only the selected card and searches the server on demand — the list
 * request stays capped at CARD_PAGE_SIZE regardless of how many cards exist.
 */
function CardPicker({
  cards,
  selected,
  loading,
  search,
  onSearchChange,
  onSelect,
  hasMore,
}: {
  cards: CardChip[];
  selected?: CardChip;
  loading: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  onSelect: (id: string) => void;
  hasMore: boolean;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEscape);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative max-w-[26rem]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          "flex w-full items-center gap-3 rounded-lg border px-3.5 py-3 text-left transition-colors focus:outline-none",
          open
            ? "border-(--color-brand) shadow-[0_2px_8px_rgba(78,43,204,0.08)]"
            : "border-(--color-border) hover:border-(--color-text-muted)",
          "bg-white",
        )}
      >
        {selected ? (
          <>
            <span
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[0.6875rem] font-bold",
                selected.type === "Virtual"
                  ? "bg-[rgba(78,43,204,0.08)] text-(--color-brand)"
                  : "bg-[rgba(10,133,209,0.08)] text-[#0A85D1]",
              )}
            >
              {selected.type === "Virtual" ? "V" : "P"}
            </span>
            <Stack gap={0} className="min-w-0 flex-1">
              <Text
                variant="caption"
                color="primary"
                weight="semibold"
                className="font-mono text-[0.75rem] leading-4"
                as="p"
              >
                **** **** **** {last4(selected.masked)}
              </Text>
              <Row gap={2} align="center" className="mt-0.5 min-w-0">
                <Text
                  variant="micro"
                  color="muted"
                  truncate
                  className="text-[0.625rem] uppercase tracking-[0.04em] leading-4"
                  as="p"
                >
                  {selected.label}
                </Text>
                <span
                  className={cn(
                    "inline-flex shrink-0 rounded px-1.5 py-px text-[0.5625rem] font-semibold leading-4",
                    selected.status === "Active"
                      ? "bg-(--color-success-subtle) text-(--color-success-mid)"
                      : "bg-(--color-danger-subtle) text-(--color-danger)",
                  )}
                >
                  {selected.status}
                </span>
                {selected.currency && (
                  <Text variant="micro" color="muted" className="shrink-0 text-[0.5625rem]">
                    {selected.currency}
                  </Text>
                )}
              </Row>
            </Stack>
          </>
        ) : (
          <Text variant="caption" color="muted" className="flex-1 text-[0.75rem]">
            Select a card
          </Text>
        )}
        <ChevronDown
          size={14}
          className={cn(
            "shrink-0 text-(--color-text-muted) transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+0.375rem)] z-30 overflow-hidden rounded-lg border border-(--color-border) bg-white shadow-[0_0.75rem_2rem_rgba(15,23,42,0.12)]">
          <div className="flex items-center gap-2 border-b border-(--color-border) px-3 py-2.5">
            <Search size={14} className="shrink-0 text-(--color-text-muted)" />
            <input
              autoFocus
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search card number or cardholder…"
              className="w-full bg-transparent text-[0.75rem] text-(--color-text-primary) outline-none placeholder:text-(--color-text-muted)"
            />
          </div>

          <div className="max-h-[18rem] overflow-y-auto p-1.5">
            {loading ? (
              <Stack gap={2} className="p-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-11 w-full rounded-md" />
                ))}
              </Stack>
            ) : cards.length === 0 ? (
              <Box className="px-3 py-6 text-center">
                <Text variant="caption" color="muted" className="text-[0.75rem]">
                  No cards match “{search}”.
                </Text>
              </Box>
            ) : (
              cards.map((card) => (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => {
                    onSelect(card.id);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-left transition-colors focus:outline-none",
                    card.id === selected?.id
                      ? "bg-[rgba(78,43,204,0.06)]"
                      : "hover:bg-(--color-bg-subtle)",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[0.625rem] font-bold",
                      card.type === "Virtual"
                        ? "bg-[rgba(78,43,204,0.08)] text-(--color-brand)"
                        : "bg-[rgba(10,133,209,0.08)] text-[#0A85D1]",
                    )}
                  >
                    {card.type === "Virtual" ? "V" : "P"}
                  </span>
                  <Stack gap={0} className="min-w-0 flex-1">
                    <Text
                      variant="caption"
                      color="primary"
                      weight="semibold"
                      className="font-mono text-[0.75rem] leading-4"
                      as="p"
                    >
                      **** {last4(card.masked)}
                    </Text>
                    <Text
                      variant="micro"
                      color="muted"
                      truncate
                      className="text-[0.625rem] uppercase leading-4"
                      as="p"
                    >
                      {card.label}
                    </Text>
                  </Stack>
                  <Row gap={2} align="center" className="shrink-0">
                    <span
                      className={cn(
                        "inline-flex rounded px-1.5 py-px text-[0.5625rem] font-semibold leading-4",
                        card.status === "Active"
                          ? "bg-(--color-success-subtle) text-(--color-success-mid)"
                          : "bg-(--color-danger-subtle) text-(--color-danger)",
                      )}
                    >
                      {card.status}
                    </span>
                    {card.currency && (
                      <Text variant="micro" color="muted" className="text-[0.5625rem]">
                        {card.currency}
                      </Text>
                    )}
                  </Row>
                </button>
              ))
            )}
          </div>

          {hasMore && !loading && (
            <Box className="border-t border-(--color-border) px-3 py-2">
              <Text variant="micro" color="muted" className="text-[0.625rem]">
                Showing the first {cards.length} cards — search to narrow the list.
              </Text>
            </Box>
          )}
        </div>
      )}
    </div>
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

function SecurityActionRow({ label, description, action, danger, onClick, disabled }: { label: string; description: string; action: string; danger?: boolean; onClick?: () => void; disabled?: boolean }) {
  return (
    <Row justify="between" align="center" className="border-b border-(--color-border) py-3 first:pt-1">
      <Stack gap={0} className="min-w-0">
        <Text variant="caption" color="primary" weight="medium" className="text-[0.75rem]" as="p">{label}</Text>
        <Text variant="micro" color="muted" className="text-[0.625rem]" as="p">{description}</Text>
      </Stack>
      <button type="button" onClick={onClick} disabled={disabled} className={cn("shrink-0 font-geom text-[0.6875rem] font-medium transition-opacity hover:opacity-75 disabled:opacity-50 focus:outline-none", danger ? "text-(--color-danger)" : "text-(--color-brand)")}>{action}</button>
    </Row>
  );
}

interface ActivityRow { type: string; description: string; ip: string; location: string; date: string }
interface ChangeRow { title: string; description: string; admin: string; timestamp: string }

function normalizeActivity(raw: unknown): ActivityRow {
  const a = obj(raw);
  const details = obj(a.activity_details);
  return {
    type: str(get(a, ["activity_type", "action", "title", "type"]), "Activity"),
    description: str(get(a, ["activity_description", "description", "message"]), "—"),
    ip: str(get(a, ["request_ip", "ip", "ip_address"]), "—"),
    location: str(get(a, ["location"]) ?? get(details, ["location"]), "—"),
    date: str(get(a, ["activity_timestamp", "created_at", "timestamp", "date"]), ""),
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

  // Only ever request a page of cards — the picker searches server-side, so
  // the payload stays flat no matter how many cards exist.
  const [cardSearch, setCardSearch] = useState("");
  const debouncedCardSearch = useDebounce(cardSearch, 350);
  const { data: rawCards = [], isLoading: cardsLoading } = useCards({
    page: 1,
    limit: CARD_PAGE_SIZE,
    search: debouncedCardSearch.trim() || undefined,
  });
  const cards = useMemo(() => (Array.isArray(rawCards) ? rawCards.map(normalizeChip) : []), [rawCards]);
  const hasMoreCards = cards.length >= CARD_PAGE_SIZE;

  // The list endpoint does not reliably filter on `search`, so match locally
  // too — this keeps the input honest whether or not the server narrows it.
  const visibleCards = useMemo(() => {
    const q = cardSearch.trim().toLowerCase();
    if (!q) return cards;
    return cards.filter((card) =>
      [card.masked, card.label, card.cardholder, card.currency, card.type, card.status]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(q)),
    );
  }, [cards, cardSearch]);

  // Selection (no init effect — fall back to first card in render)
  const [searchParams] = useSearchParams();
  const cardParam = searchParams.get("card") ?? "";
  const [selectedIdState, setSelectedIdState] = useState("");
  const selectedId = selectedIdState || cardParam || cards[0]?.id || "";

  const { data: rawDetail, isLoading: detailLoading } = useCardDetail(selectedId);

  // Once a search filters the list, the selected card may not be in it —
  // fall back to its detail response so the visual never goes blank.
  const selectedChip = useMemo(() => {
    const fromList = cards.find((c) => c.id === selectedId);
    if (fromList) return fromList;
    if (rawDetail) return normalizeChip(rawDetail, 0);
    return cards[0];
  }, [cards, selectedId, rawDetail]);
  const { data: rawActivity = [], isLoading: activityLoading } = useCardActivity(selectedId);
  const { data: rawChanges = [], isLoading: changesLoading } = useTeamActivityLogs({
    category: "card_limits_updated",
    page: 1,
    limit: 20,
  });

  const updateLimits = useUpdateCardLimits();
  const resetPin = useResetCardPin();
  const replaceCard = useReplaceCard();
  const terminateCard = useTerminateCard();
  const securityBusy = resetPin.isPending || replaceCard.isPending || terminateCard.isPending;

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
      { accessorKey: "type", header: "Activity", enableSorting: false, cell: ({ getValue }) => (<Text variant="caption" color="primary" weight="medium">{getValue<string>()}</Text>) },
      { accessorKey: "description", header: "Description", enableSorting: false, cell: ({ getValue }) => (<Text variant="caption" color="secondary">{getValue<string>()}</Text>) },
      { accessorKey: "ip", header: "IP Address", enableSorting: false, cell: ({ getValue }) => (<Text variant="caption" color="secondary" className="font-mono text-[0.6875rem]">{getValue<string>()}</Text>) },
      { accessorKey: "location", header: "Location", enableSorting: false, cell: ({ getValue }) => (<Text variant="caption" color="secondary">{getValue<string>()}</Text>) },
      { accessorKey: "date", header: "Date", enableSorting: false, cell: ({ getValue }) => (<Text variant="caption" color="secondary">{formatDate(getValue<string>())}</Text>) },
    ],
    [],
  );

  // Only block on the very first load — later loads are search refreshes and
  // must not tear down the picker the user is typing in.
  if (cardsLoading && !selectedChip) {
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

  if (!selectedChip) {
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
          <CardPicker
            cards={visibleCards}
            selected={selectedChip}
            // Keep showing matches while a refined server query loads.
            loading={cardsLoading && visibleCards.length === 0}
            search={cardSearch}
            onSearchChange={setCardSearch}
            onSelect={selectCard}
            hasMore={hasMoreCards && !cardSearch.trim()}
          />
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
                <SecurityActionRow label="PIN Reset" description="Reset card PIN" action="Reset" disabled={securityBusy} onClick={() => resetPin.mutate(selectedId)} />
                <SecurityActionRow label="Replace Card" description="Issue a replacement card" action="Replace" disabled={securityBusy} onClick={() => replaceCard.mutate(selectedId)} />
                <SecurityActionRow label="Terminate Card" description="Permanently terminate this card" action="Terminate" danger disabled={securityBusy} onClick={() => { if (window.confirm("Permanently terminate this card? This action cannot be undone.")) terminateCard.mutate(selectedId); }} />
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
                    <Text variant="micro" color="muted" className="text-[0.625rem]" as="p">{formatDate(change.timestamp)}</Text>
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
