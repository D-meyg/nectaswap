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
import { DUMMY_EXCHANGE_RATES, DUMMY_FEE_TIERS } from "@/lib/dummyData";
import { useExchangeRates, useFeeConfig, useFeeRevenue } from "@/hooks/queries/useRates";
import type { ColumnDef } from "@tanstack/react-table";

type RateRow = (typeof DUMMY_EXCHANGE_RATES)[0];
type FeeRow = (typeof DUMMY_FEE_TIERS)[0];

function LinkButton({ label }: { label: string }) {
  return (
    <button className="text-(--color-brand) text-[13px] font-medium hover:underline transition-colors">
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

  const rates = apiRates.length ? (apiRates as RateRow[]) : DUMMY_EXCHANGE_RATES;
  const fees = apiFees.length ? (apiFees as FeeRow[]) : DUMMY_FEE_TIERS;

  const rateCols = useMemo<ColumnDef<RateRow, unknown>[]>(
    () => [
      {
        accessorKey: "pair",
        header: "Trading Pair",
        cell: ({ getValue }) => (
          <Text variant="caption" color="primary" weight="semibold">
            {getValue<string>()}
          </Text>
        ),
      },
      {
        accessorKey: "rate",
        header: "Current Rate",
        cell: ({ getValue }) => (
          <Text variant="caption" color="primary" weight="semibold">
            {getValue<string>()}
          </Text>
        ),
      },
      {
        accessorKey: "change",
        header: "24H Change",
        cell: ({ row }) => (
          <Text
            variant="caption"
            weight="medium"
            color={row.original.positive ? "success" : "danger"}
          >
            {row.original.positive ? "↑" : "↓"} {row.original.change}
          </Text>
        ),
      },
      {
        accessorKey: "spread",
        header: "Spread",
        cell: ({ getValue }) => (
          <Text variant="caption" color="secondary">
            {getValue<string>()}
          </Text>
        ),
      },
      {
        accessorKey: "source",
        header: "Source",
        cell: ({ getValue }) => (
          <Text variant="caption" color="brand" weight="medium">
            {getValue<string>()}
          </Text>
        ),
      },
      {
        accessorKey: "last_update",
        header: "Last Update",
        cell: ({ getValue }) => (
          <Text variant="caption" color="muted">
            {getValue<string>()}
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
            value: (feeRevenue as any).total_fee_revenue_24h || "₦ 2.4M",
            delta: "↑ +10.5% vs yesterday",
            pos: true,
          },
          {
            label: "Avg Fee per Transaction",
            value: (feeRevenue as any).avg_fee_per_transaction || "₦ 8,420",
            delta: "↓ -2.1% vs yesterday",
            pos: false,
          },
          {
            label: "Fee Revenue (MTD)",
            value: (feeRevenue as any).fee_revenue_mtd || "₦ 68.3M",
            delta: "↑ +18.3% vs last month",
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
