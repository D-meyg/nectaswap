/* eslint-disable @typescript-eslint/no-explicit-any */
import { usePageTitle } from "@/layouts/AppLayout";
import { useMemo } from "react";
import { RefreshCw, Info } from "lucide-react";

import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { Row } from "@/components/ui/Row";
import { Stack } from "@/components/ui/Stack";
import { Box } from "@/components/ui/Box";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/tables/DataTable";
import { useExchangeRates, useFeeConfig, useFeeRevenue } from "@/hooks/queries/useRates";
import { formatDateTime } from "@/lib/date";
import type { ColumnDef } from "@tanstack/react-table";

type RateRow = Record<string, any>;
type FeeRow = Record<string, any>;

/** Rates come back as plain numbers (e.g. 1401.87523512) — show them in NGN. */
function rateValue(value: unknown): string {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return "—";
  return `₦${n.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/** Fees are numeric percentages; 0 is a valid value and must still render. */
function feeValue(value: unknown): string {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return "—";
  return `${n}%`;
}

function spreadValue(value: unknown): string {
  if (typeof value === "string" && value.trim()) return value;
  const n = Number(value);
  if (!Number.isFinite(n)) return "—";
  return `${n}%`;
}

function LinkButton({ label }: { label: string }) {
  return (
    <button className="text-(--color-brand) text-[0.8125rem] font-medium hover:underline transition-colors">
      {label}
    </button>
  );
}

export default function RatesPage() {
  usePageTitle(
    "Rates & Fees",
    "Live rates with spread configuration and fee control",
  );

  const { data: apiRates = [], isLoading: loadingRates } = useExchangeRates();
  const { data: apiFees = [], isLoading: loadingFees } = useFeeConfig();
  const { data: feeRevenue = {} } = useFeeRevenue();

  const rates = apiRates as RateRow[];
  const fees = apiFees as FeeRow[];

  const rateCols = useMemo<ColumnDef<RateRow, unknown>[]>(
    () => [
      {
        accessorKey: "trading_pair",
        header: "Trading Pair",
        cell: ({ row }) => (
          <Stack gap={0}>
            <Text variant="caption" color="primary" weight="semibold">
              {row.original.trading_pair ?? row.original.pair ?? "—"}
            </Text>
            {row.original.coin_name && (
              <Text variant="micro" color="muted" className="text-[0.625rem] leading-4">
                {row.original.coin_name}
              </Text>
            )}
          </Stack>
        ),
      },
      {
        accessorKey: "buying_rate",
        header: "Buying Rate",
        cell: ({ row }) => (
          <Text variant="caption" color="primary" weight="semibold">
            {rateValue(row.original.buying_rate ?? row.original.rate)}
          </Text>
        ),
      },
      {
        accessorKey: "selling_rate",
        header: "Selling Rate",
        cell: ({ row }) => (
          <Text variant="caption" color="primary" weight="semibold">
            {rateValue(row.original.selling_rate)}
          </Text>
        ),
      },
      {
        accessorKey: "fees",
        header: "Fees (Buy / Sell)",
        cell: ({ row }) => (
          <Text variant="caption" color="secondary">
            {feeValue(row.original.buying_fee)} / {feeValue(row.original.selling_fee)}
          </Text>
        ),
      },
      {
        /* 24H Change removed — the exchange-rates endpoint does not return a
           change figure, so the column was always blank. */
        accessorKey: "spread_pct",
        header: "Spread",
        cell: ({ row }) => (
          <Text variant="caption" color="secondary">
            {spreadValue(row.original.spread_pct ?? row.original.spread)}
          </Text>
        ),
      },
      {
        accessorKey: "source",
        header: "Source",
        cell: ({ getValue }) => (
          <Text variant="caption" color="brand" weight="medium">
            {getValue<string>() || "—"}
          </Text>
        ),
      },
      {
        accessorKey: "last_update",
        header: "Last Update",
        cell: ({ getValue }) => (
          <Text variant="caption" color="muted">
            {formatDateTime(getValue<string>())}
          </Text>
        ),
      },
      {
        id: "action",
        header: "Action",
        cell: () => <LinkButton label="Override" />,
      },
    ],
    [],
  );

  const feeCols = useMemo<ColumnDef<FeeRow, unknown>[]>(
    () => [
      {
        accessorKey: "tier",
        header: "User Tier",
        cell: ({ getValue }) => (
          <Text variant="caption" color="primary" weight="semibold">
            {getValue<string>()}
          </Text>
        ),
      },
      {
        accessorKey: "withdrawal",
        header: "Withdrawal Fee",
        cell: ({ getValue }) => (
          <Text variant="caption" color="secondary">
            {getValue<string>()}
          </Text>
        ),
      },
      {
        accessorKey: "conversion",
        header: "Conversion Fee",
        cell: ({ getValue }) => (
          <Text variant="caption" color="secondary">
            {getValue<string>()}
          </Text>
        ),
      },
      {
        accessorKey: "min",
        header: "Min Amount",
        cell: ({ getValue }) => (
          <Text variant="caption" color="secondary">
            {getValue<string>()}
          </Text>
        ),
      },
      {
        accessorKey: "max",
        header: "Max Amount",
        cell: ({ getValue }) => (
          <Text variant="caption" color="secondary">
            {getValue<string>()}
          </Text>
        ),
      },
      {
        id: "action",
        header: "Action",
        cell: () => <LinkButton label="Edit" />,
      },
    ],
    [],
  );

  return (
    <Box p={6} className="space-y-5">
      {/* Exchange Rates */}
      <Card noPadding>
        <Row
          justify="between"
          align="center"
          className="px-5 py-4 border-b border-(--color-border)"
        >
          <Stack gap={0}>
            <Text variant="subtitle" color="primary" weight="semibold" as="p">
              Exchange Rates
            </Text>
            <Text variant="micro" color="muted" as="p">
              Live rates with spread configuration
            </Text>
          </Stack>
          <Button variant="secondary" size="sm">
            <RefreshCw size={13} />
            Refresh Rates
          </Button>
        </Row>
        <DataTable
          data={rates}
          columns={rateCols}
          loading={loadingRates}
          emptyTitle="No rates"
          emptyMessage="Exchange rates unavailable"
        />
      </Card>

      {/* Fee Configuration */}
      <Card noPadding>
        <Box px={5} py={4} className="border-b border-(--color-border)">
          <Text variant="subtitle" color="primary" weight="semibold" as="p">
            Fee Configuration
          </Text>
          <Text variant="micro" color="muted" as="p">
            Tier-based fee structure
          </Text>
        </Box>
        <DataTable
          data={fees}
          columns={feeCols}
          loading={loadingFees}
          emptyTitle="No fee tiers"
          emptyMessage="No fee tiers configured"
        />
      </Card>

      {/* Revenue stat cards */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {[
          {
            label: "Total Fee Revenue (24h)",
            value: `₦ ${Number((feeRevenue as any).revenue_24h ?? 0).toLocaleString()}`,
            delta: "",
            pos: true,
          },
          {
            label: "Avg Fee per Transaction",
            value: `₦ ${Number((feeRevenue as any).avg_fee_per_transaction ?? 0).toLocaleString()}`,
            delta: "",
            pos: false,
          },
          {
            label: "Fee Revenue (MTD)",
            value: `₦ ${Number((feeRevenue as any).revenue_mtd ?? 0).toLocaleString()}`,
            delta: "",
            pos: true,
          },
        ].map((s, i) => (
          <Card key={i}>
            <Box px={5} py={4}>
              <Text variant="micro" color="muted" className="block mb-1">
                {s.label}
              </Text>
              <Text variant="heading" color="primary" weight="semibold" as="p">
                {s.value}
              </Text>
              {s.delta && (
                <Text
                  variant="micro"
                  weight="medium"
                  className={[
                    "mt-1 block",
                    s.pos
                      ? "text-(--color-success-mid)"
                      : "text-(--color-danger)",
                  ].join(" ")}
                >
                  {s.delta}
                </Text>
              )}
            </Box>
          </Card>
        ))}
      </div>

      {/* Info banner */}
      <Box className="flex items-start gap-3 rounded-(--radius-md) border border-(--color-brand)/20 bg-[rgba(78,43,204,0.04)] px-4 py-3">
        <Info size={15} className="text-(--color-brand) mt-0.5 shrink-0" />
        <Stack gap={0}>
          <Text variant="caption" color="brand" weight="semibold" as="p">
            Rate & Fee Updates
          </Text>
          <Text variant="micro" color="secondary" as="p">
            All changes to rates and fees are logged in the audit trail and
            require appropriate admin permissions. Manual overrides expire after
            24 hours unless extended.
          </Text>
        </Stack>
      </Box>
    </Box>
  );
}
