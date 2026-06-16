import { usePageTitle } from "@/layouts/AppLayout";
import { useState, useMemo } from "react";
import { Flag, AlertTriangle, Shield, CheckCircle2, Eye } from "lucide-react";

import { StatCard } from "@/components/ui/StatCard";
import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { Row } from "@/components/ui/Row";
import { Stack } from "@/components/ui/Stack";
import { Box } from "@/components/ui/Box";
import { Button } from "@/components/ui/Button";
import { RiskScore } from "@/components/ui/RiskScore";
import {
  SeverityBadge,
  ComplianceStatusText,
} from "@/components/ui/SeverityBadge";
import { TabsRoot, TabsList, Tab } from "@/components/ui/Tabs";
import { DataTable } from "@/components/tables/DataTable";
import {
  DUMMY_FLAGGED_USERS,
  DUMMY_FLAGGED_TRANSACTIONS,
  DUMMY_RISK_RULES,
} from "@/lib/dummyData";
import type { ColumnDef } from "@tanstack/react-table";

type TabValue = "flagged-users" | "flagged-transactions" | "risk-rules";

type FlaggedUser = (typeof DUMMY_FLAGGED_USERS)[0];
type FlaggedTx = (typeof DUMMY_FLAGGED_TRANSACTIONS)[0];
type RiskRule = (typeof DUMMY_RISK_RULES)[0];

// ── Link-style action button ──────────────────────────────
function LinkButton({ label, danger }: { label: string; danger?: boolean }) {
  return (
    <button
      className={[
        "text-[13px] font-medium transition-colors",
        danger
          ? "text-[var(--color-text-muted)] hover:text-[var(--color-danger)]"
          : "text-[var(--color-brand)] hover:underline",
      ].join(" ")}
    >
      {label}
    </button>
  );
}

export default function CompliancePage() {
  usePageTitle("Compliance & Risk", "Fraud prevention and risk monitoring");
  const [activeTab, setActiveTab] = useState<TabValue>("flagged-users");

  // ── Flagged Users columns ───────────────────────────────
  const flaggedUserCols = useMemo<ColumnDef<FlaggedUser, unknown>[]>(
    () => [
      {
        accessorKey: "name",
        header: "User",
        cell: ({ row }) => (
          <Stack gap={0}>
            <Text variant="caption" color="primary" weight="semibold" as="p">
              {row.original.name}
            </Text>
            <Text variant="micro" color="muted" as="p">
              ID: {row.original.id}
            </Text>
          </Stack>
        ),
      },
      {
        accessorKey: "reason",
        header: "Reason",
        cell: ({ getValue }) => (
          <Text variant="caption" color="secondary">
            {getValue<string>()}
          </Text>
        ),
      },
      {
        accessorKey: "risk_score",
        header: "Risk Score",
        cell: ({ getValue }) => <RiskScore score={getValue<number>()} />,
      },
      {
        accessorKey: "flagged",
        header: "Flagged",
        cell: ({ getValue }) => (
          <Text variant="caption" color="secondary">
            {getValue<string>()}
          </Text>
        ),
      },
      {
        accessorKey: "severity",
        header: "Severity",
        cell: ({ getValue }) => <SeverityBadge severity={getValue<string>()} />,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => (
          <ComplianceStatusText status={getValue<string>()} />
        ),
      },
      {
        id: "action",
        header: "Action",
        cell: () => (
          <Row gap={2} align="center">
            <Button size="sm">
              <Eye size={12} />
              Review
            </Button>
            <LinkButton label="Clear" danger />
          </Row>
        ),
      },
    ],
    [],
  );

  // ── Flagged Transactions columns ────────────────────────
  const flaggedTxCols = useMemo<ColumnDef<FlaggedTx, unknown>[]>(
    () => [
      {
        accessorKey: "id",
        header: "Transaction ID",
        cell: ({ getValue }) => (
          <Text
            variant="caption"
            color="primary"
            weight="semibold"
            className="font-mono"
          >
            {getValue<string>()}
          </Text>
        ),
      },
      {
        accessorKey: "user",
        header: "User",
        cell: ({ getValue }) => (
          <Text variant="caption" color="primary" weight="medium">
            {getValue<string>()}
          </Text>
        ),
      },
      {
        accessorKey: "type",
        header: "Type",
        cell: ({ getValue }) => (
          <Text variant="caption" color="secondary">
            {getValue<string>()}
          </Text>
        ),
      },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ getValue }) => (
          <Text variant="caption" color="primary" weight="semibold">
            {getValue<string>()}
          </Text>
        ),
      },
      {
        accessorKey: "reason",
        header: "Reason",
        cell: ({ getValue }) => (
          <Text variant="caption" color="secondary">
            {getValue<string>()}
          </Text>
        ),
      },
      {
        accessorKey: "severity",
        header: "Severity",
        cell: ({ getValue }) => <SeverityBadge severity={getValue<string>()} />,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => (
          <ComplianceStatusText status={getValue<string>()} />
        ),
      },
      {
        id: "action",
        header: "Action",
        cell: () => (
          <Row gap={2} align="center">
            <Button size="sm">
              <Eye size={12} />
              Review
            </Button>
            <LinkButton label="Clear" danger />
          </Row>
        ),
      },
    ],
    [],
  );

  // ── Risk Rules columns ──────────────────────────────────
  const riskRuleCols = useMemo<ColumnDef<RiskRule, unknown>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Rule Name",
        cell: ({ getValue }) => (
          <Text variant="caption" color="primary" weight="medium">
            {getValue<string>()}
          </Text>
        ),
      },
      {
        accessorKey: "threshold",
        header: "Threshold",
        cell: ({ getValue }) => (
          <Text variant="caption" color="secondary">
            {getValue<string>()}
          </Text>
        ),
      },
      {
        accessorKey: "violations",
        header: "Violations (24h)",
        cell: ({ getValue }) => (
          <Text variant="caption" color="primary" weight="semibold">
            {getValue<number>()}
          </Text>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => (
          <ComplianceStatusText status={getValue<string>()} />
        ),
      },
      {
        id: "action",
        header: "Action",
        cell: () => <LinkButton label="Configure" />,
      },
    ],
    [],
  );

  return (
    <Box p={6} className="space-y-5">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total Flags (24h)"
          value={7}
          icon={<Flag size={16} className="text-[var(--color-warning)]" />}
        />
        <StatCard
          label="High Severity"
          value={3}
          icon={
            <AlertTriangle size={16} className="text-[var(--color-danger)]" />
          }
          status="danger"
        />
        <StatCard
          label="Under Review"
          value={2}
          icon={<Shield size={16} className="text-[var(--color-warning)]" />}
        />
        <StatCard
          label="Resolved (24h)"
          value={2}
          icon={
            <CheckCircle2
              size={16}
              className="text-[var(--color-success-mid)]"
            />
          }
          status="success"
        />
      </div>

      <Card noPadding>
        <Box px={5} className="border-b border-[var(--color-border)]">
          <TabsRoot
            value={activeTab}
            onChange={(v) => setActiveTab(v as TabValue)}
          >
            <TabsList className="border-b-0 gap-6">
              <Tab value="flagged-users">Flagged Users</Tab>
              <Tab value="flagged-transactions">Flagged Transactions</Tab>
              <Tab value="risk-rules">Risk Rules</Tab>
            </TabsList>
          </TabsRoot>
        </Box>

        {activeTab === "flagged-users" && (
          <DataTable
            data={DUMMY_FLAGGED_USERS}
            columns={flaggedUserCols}
            emptyTitle="No flagged users"
            emptyMessage="No users have been flagged"
          />
        )}
        {activeTab === "flagged-transactions" && (
          <DataTable
            data={DUMMY_FLAGGED_TRANSACTIONS}
            columns={flaggedTxCols}
            emptyTitle="No flagged transactions"
            emptyMessage="No transactions have been flagged"
          />
        )}
        {activeTab === "risk-rules" && (
          <DataTable
            data={DUMMY_RISK_RULES}
            columns={riskRuleCols}
            emptyTitle="No rules"
            emptyMessage="No risk rules configured"
          />
        )}
      </Card>
    </Box>
  );
}
