import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Wifi } from "lucide-react";

import { usePageTitle } from "@/layouts/AppLayout";
import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { Row } from "@/components/ui/Row";
import { Stack } from "@/components/ui/Stack";
import { Box } from "@/components/ui/Box";
import { Toggle } from "@/components/ui/Toggle";
import { DataTable } from "@/components/tables/DataTable";
import { cn } from "@/lib/utils";
import {
  DUMMY_LIMITS_CARDS,
  DUMMY_SPENDING_LIMITS,
  DUMMY_CARD_PERMISSIONS,
  DUMMY_SECURITY_TOGGLES,
  DUMMY_CARD_ACTIVITY_ROWS,
  DUMMY_CARD_CHANGES,
  type LimitsCardOption,
  type CardActivityRow,
  type CardPermission,
} from "@/lib/dummyData";
import type { ColumnDef } from "@tanstack/react-table";

function fmtNaira(value: number) {
  return `₦ ${value.toLocaleString()}`;
}

function toggleMap(items: CardPermission[]) {
  return Object.fromEntries(items.map((item) => [item.key, item.enabled]));
}

// ── Card selector chip ────────────────────────────────────
function CardChip({
  card,
  selected,
  onSelect,
}: {
  card: LimitsCardOption;
  selected: boolean;
  onSelect: () => void;
}) {
  const isVirtual = card.type === "Virtual";

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex items-center gap-3 rounded-lg border px-3.5 py-3 text-left transition-all focus:outline-none",
        selected
          ? "border-(--color-brand) bg-(--color-brand)/[0.04] shadow-[0_2px_8px_rgba(78,43,204,0.08)]"
          : "border-(--color-border) bg-white hover:border-(--color-text-muted)",
      )}
    >
      <span
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[0.6875rem] font-bold",
          isVirtual
            ? "bg-[rgba(78,43,204,0.08)] text-(--color-brand)"
            : "bg-[rgba(10,133,209,0.08)] text-[#0A85D1]",
        )}
      >
        {isVirtual ? "V" : "P"}
      </span>

      <Stack gap={0} className="min-w-0">
        <Text
          variant="caption"
          color="primary"
          weight="semibold"
          className="font-mono text-[0.75rem] leading-4"
          as="p"
        >
          **** **** **** {card.last4}
        </Text>
        <Text
          variant="micro"
          color="muted"
          className="text-[0.625rem] uppercase tracking-[0.04em] leading-4"
          as="p"
        >
          {card.label}
        </Text>
        <Row gap={2} align="center" className="mt-0.5">
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
          <Text variant="micro" color="muted" className="text-[0.5625rem]">
            {card.currency}
          </Text>
          <Text variant="micro" color="muted" className="text-[0.5625rem]">
            {card.network}
          </Text>
        </Row>
      </Stack>
    </button>
  );
}

// ── Purple card visual ────────────────────────────────────
function CardVisual({ card }: { card: LimitsCardOption }) {
  return (
    <Box
      className="relative min-h-44 w-full max-w-[20.5rem] overflow-hidden rounded-xl p-5 text-white shadow-[0_8px_24px_rgba(78,43,204,0.25)]"
      style={{ background: "linear-gradient(135deg, #4E2BCC 0%, #8200DB 100%)" }}
    >
      <Row justify="between" align="start">
        <Stack gap={0}>
          <Text variant="micro" className="text-white/70" as="p">
            NectaSwap Card
          </Text>
          <Text
            variant="caption"
            className="font-semibold text-white"
            as="p"
          >
            {card.type}
          </Text>
        </Stack>

        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15">
          <Wifi size={13} className="rotate-90 text-white" />
        </span>
      </Row>

      <Box className="mt-6 mb-5">
        <Text
          variant="subtitle"
          className="font-mono tracking-[0.25rem] text-white"
          as="p"
        >
          **** **** **** {card.last4}
        </Text>
      </Box>

      <Row justify="between" align="end">
        <Stack gap={0}>
          <Text variant="micro" className="text-white/60" as="p">
            Cardholder
          </Text>
          <Text
            variant="caption"
            className="font-semibold tracking-wider text-white"
            as="p"
          >
            {card.cardholder}
          </Text>
        </Stack>
      </Row>

      <Text
        variant="subtitle"
        className="absolute bottom-4 right-4 text-xl font-bold italic text-white/20"
        as="p"
      >
        {card.network}
      </Text>
    </Box>
  );
}

// ── Spending limit row ────────────────────────────────────
function SpendingLimitRow({
  label,
  value,
  max,
}: {
  label: string;
  value: number;
  max: number;
}) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <Box className="border-b border-(--color-border) py-4 last:border-b-0 last:pb-0 first:pt-0">
      <Row justify="between" align="start" gap={4}>
        <Stack gap={2} className="min-w-0 flex-1 pt-0.5">
          <Text variant="caption" color="secondary" className="text-[0.75rem]">
            {label}
          </Text>
          <div className="h-1 w-full max-w-[13.75rem] overflow-hidden rounded-full bg-(--color-border)">
            <div
              className="h-full rounded-full bg-(--color-brand) transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </Stack>

        <Stack gap={0.5} className="shrink-0 items-end text-right">
          <Row gap={3} align="center">
            <Text variant="caption" color="primary" weight="semibold">
              {fmtNaira(value)}
            </Text>
            <button
              type="button"
              className="font-geom text-[0.6875rem] font-medium text-(--color-brand) transition-opacity hover:opacity-75 focus:outline-none"
            >
              Edit
            </button>
          </Row>
          <Text variant="micro" color="muted" className="text-[0.625rem]">
            Max: {fmtNaira(max)}
          </Text>
        </Stack>
      </Row>
    </Box>
  );
}

// ── Toggle row ────────────────────────────────────────────
function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <Row justify="between" align="center" className="py-1.5">
      <Text variant="caption" color="secondary" className="text-[0.75rem]">
        {label}
      </Text>
      <Toggle checked={checked} onChange={onChange} size="sm" />
    </Row>
  );
}

// ── Security action row ───────────────────────────────────
function SecurityActionRow({
  label,
  description,
  action,
  danger,
}: {
  label: string;
  description: string;
  action: string;
  danger?: boolean;
}) {
  return (
    <Row
      justify="between"
      align="center"
      className="border-b border-(--color-border) py-3 first:pt-1"
    >
      <Stack gap={0} className="min-w-0">
        <Text
          variant="caption"
          color="primary"
          weight="medium"
          className="text-[0.75rem]"
          as="p"
        >
          {label}
        </Text>
        <Text variant="micro" color="muted" className="text-[0.625rem]" as="p">
          {description}
        </Text>
      </Stack>
      <button
        type="button"
        className={cn(
          "shrink-0 font-geom text-[0.6875rem] font-medium transition-opacity hover:opacity-75 focus:outline-none",
          danger ? "text-(--color-danger)" : "text-(--color-brand)",
        )}
      >
        {action}
      </button>
    </Row>
  );
}

export default function CardLimitsControlsPage() {
  usePageTitle(
    "Card Limits & Controls",
    "Manage spending limits, permissions and card security policies",
  );

  const [selectedId, setSelectedId] = useState(DUMMY_LIMITS_CARDS[0].id);
  const [permissions, setPermissions] = useState<Record<string, boolean>>(() =>
    toggleMap(DUMMY_CARD_PERMISSIONS),
  );
  const [security, setSecurity] = useState<Record<string, boolean>>(() =>
    toggleMap(DUMMY_SECURITY_TOGGLES),
  );

  const selectedCard =
    DUMMY_LIMITS_CARDS.find((card) => card.id === selectedId) ??
    DUMMY_LIMITS_CARDS[0];

  const activityColumns = useMemo<ColumnDef<CardActivityRow, unknown>[]>(
    () => [
      {
        accessorKey: "merchant",
        header: "Merchant",
        enableSorting: false,
        cell: ({ getValue }) => (
          <Text variant="caption" color="primary" weight="medium">
            {getValue<string>()}
          </Text>
        ),
      },
      {
        accessorKey: "amount",
        header: "Amount",
        enableSorting: false,
        cell: ({ getValue }) => (
          <Text variant="caption" color="primary" weight="semibold">
            {fmtNaira(getValue<number>())}
          </Text>
        ),
      },
      {
        accessorKey: "currency",
        header: "Currency",
        enableSorting: false,
        cell: ({ getValue }) => (
          <Text variant="caption" color="secondary">
            {getValue<string>()}
          </Text>
        ),
      },
      {
        accessorKey: "country",
        header: "Country",
        enableSorting: false,
        cell: ({ getValue }) => (
          <Text variant="caption" color="secondary">
            {getValue<string>()}
          </Text>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        enableSorting: false,
        cell: ({ getValue }) => {
          const status = getValue<CardActivityRow["status"]>();
          const color =
            status === "Approved"
              ? "text-(--color-success-mid)"
              : status === "Declined"
                ? "text-(--color-danger)"
                : "text-(--color-warning-text)";
          return (
            <span
              className={cn("font-geom text-xs font-medium", color)}
            >
              {status}
            </span>
          );
        },
      },
      {
        accessorKey: "date",
        header: "Date",
        enableSorting: false,
        cell: ({ getValue }) => (
          <Text variant="caption" color="secondary">
            {getValue<string>()}
          </Text>
        ),
      },
      {
        accessorKey: "risk",
        header: "Risk",
        enableSorting: false,
        cell: ({ getValue }) => {
          const risk = getValue<CardActivityRow["risk"]>();
          const color =
            risk === "Low"
              ? "text-(--color-success-mid)"
              : risk === "Medium"
                ? "text-(--color-warning-text)"
                : "text-(--color-danger)";
          return (
            <span className={cn("font-geom text-xs font-semibold", color)}>
              {risk}
            </span>
          );
        },
      },
    ],
    [],
  );

  return (
    <Box p={6} className="space-y-5">
      {/* Card selector + visual */}
      <Card>
        <Box px={5} py={4}>
          <Text
            variant="micro"
            color="tertiary"
            weight="semibold"
            uppercase
            className="mb-3 block tracking-[0.06em] text-[0.625rem]"
          >
            Select Card
          </Text>

          <Row gap={3} align="stretch" className="flex-wrap">
            {DUMMY_LIMITS_CARDS.map((card) => (
              <CardChip
                key={card.id}
                card={card}
                selected={card.id === selectedId}
                onSelect={() => setSelectedId(card.id)}
              />
            ))}
          </Row>

          <Link
            to={`/cards/${selectedCard.id}`}
            className="mt-3 inline-flex items-center gap-1.5 font-geom text-[0.6875rem] font-medium text-(--color-brand) transition-opacity hover:opacity-75"
          >
            View full card detail
            <ArrowRight size={12} />
          </Link>

          <Box className="mt-4">
            <CardVisual card={selectedCard} />
          </Box>
        </Box>
      </Card>

      {/* Limits + permissions/security */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2 self-start">
          <Card.Header
            title="Spending Limits"
            className="border-b-0 px-5 pb-1 pt-4 [&_h4]:text-[0.8125rem] [&_h4]:leading-5"
          />
          <Card.Body className="px-5 pb-5 pt-2">
            <Stack gap={0}>
              {DUMMY_SPENDING_LIMITS.map((limit) => (
                <SpendingLimitRow
                  key={limit.key}
                  label={limit.label}
                  value={limit.value}
                  max={limit.max}
                />
              ))}
            </Stack>
          </Card.Body>
        </Card>

        <Stack gap={5}>
          <Card>
            <Card.Header
              title="Card Permissions"
              className="border-b-0 px-5 pb-1 pt-4 [&_h4]:text-[0.8125rem] [&_h4]:leading-5"
            />
            <Card.Body className="px-5 pb-4 pt-1">
              <Stack gap={0}>
                {DUMMY_CARD_PERMISSIONS.map((permission) => (
                  <ToggleRow
                    key={permission.key}
                    label={permission.label}
                    checked={permissions[permission.key]}
                    onChange={(next) =>
                      setPermissions((current) => ({
                        ...current,
                        [permission.key]: next,
                      }))
                    }
                  />
                ))}
              </Stack>
            </Card.Body>
          </Card>

          <Card>
            <Card.Header
              title="Security Controls"
              className="border-b-0 px-5 pb-1 pt-4 [&_h4]:text-[0.8125rem] [&_h4]:leading-5"
            />
            <Card.Body className="px-5 pb-4 pt-1">
              <Stack gap={0} className="mb-2">
                <SecurityActionRow
                  label="PIN Reset"
                  description="Reset card PIN"
                  action="Reset"
                />
                <SecurityActionRow
                  label="Replace Card"
                  description="Issue a replacement card"
                  action="Replace"
                />
                <SecurityActionRow
                  label="Terminate Card"
                  description="Permanently terminate this card"
                  action="Terminate"
                  danger
                />
              </Stack>

              <Stack gap={0}>
                {DUMMY_SECURITY_TOGGLES.map((toggle) => (
                  <ToggleRow
                    key={toggle.key}
                    label={toggle.label}
                    checked={security[toggle.key]}
                    onChange={(next) =>
                      setSecurity((current) => ({
                        ...current,
                        [toggle.key]: next,
                      }))
                    }
                  />
                ))}
              </Stack>
            </Card.Body>
          </Card>
        </Stack>
      </div>

      {/* Recent card activity */}
      <Card noPadding>
        <Box
          px={5}
          py={4}
          className="border-b border-(--color-border) bg-(--color-bg-subtle)"
        >
          <Text variant="subtitle" color="primary" weight="semibold" as="p">
            Recent Card Activity
          </Text>
        </Box>
        <DataTable
          data={DUMMY_CARD_ACTIVITY_ROWS}
          columns={activityColumns}
          emptyTitle="No recent activity"
          emptyMessage="Card activity will appear here"
        />
      </Card>

      {/* Recent changes */}
      <Card noPadding>
        <Box
          px={5}
          py={4}
          className="border-b border-(--color-border) bg-(--color-bg-subtle)"
        >
          <Text variant="subtitle" color="primary" weight="semibold" as="p">
            Recent Changes
          </Text>
        </Box>
        <Box px={5} py={2}>
          <Stack gap={0}>
            {DUMMY_CARD_CHANGES.map((change) => (
              <Row
                key={`${change.title}-${change.timestamp}`}
                justify="between"
                align="start"
                gap={4}
                className="border-b border-(--color-border) py-3.5 last:border-b-0"
              >
                <Row gap={3} align="start" className="min-w-0">
                  <span className="mt-0.5 h-3.5 w-3.5 shrink-0 rounded-full border-2 border-(--color-brand)/50" />
                  <Stack gap={0} className="min-w-0">
                    <Text
                      variant="caption"
                      color="primary"
                      weight="semibold"
                      className="text-[0.75rem]"
                      as="p"
                    >
                      {change.title}
                    </Text>
                    <Text
                      variant="micro"
                      color="muted"
                      className="text-[0.625rem]"
                      as="p"
                    >
                      {change.description}
                    </Text>
                  </Stack>
                </Row>

                <Stack gap={0} className="shrink-0 items-end text-right">
                  <Text
                    variant="micro"
                    color="secondary"
                    weight="medium"
                    className="text-[0.6875rem]"
                    as="p"
                  >
                    {change.admin}
                  </Text>
                  <Text
                    variant="micro"
                    color="muted"
                    className="text-[0.625rem]"
                    as="p"
                  >
                    {change.timestamp}
                  </Text>
                </Stack>
              </Row>
            ))}
          </Stack>
        </Box>
      </Card>
    </Box>
  );
}
