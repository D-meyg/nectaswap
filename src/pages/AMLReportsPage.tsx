import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FolderOpen,
  Users,
  Receipt,
  AlertCircle,
  CheckCircle2,
  Clock,
  Upload,
  Calendar,
} from "lucide-react";

import { usePageActions, usePageTitle } from "@/layouts/AppLayout";
import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { Row } from "@/components/ui/Row";
import { Stack } from "@/components/ui/Stack";
import { Box } from "@/components/ui/Box";
import { Button } from "@/components/ui/Button";
import { FilterButton } from "@/components/ui/FilterButton";
import { SearchInput } from "@/components/forms/SearchInput";
import { DataTable } from "@/components/tables/DataTable";
import { RiskPill, CaseStatusPill } from "@/components/compliance/CompliancePills";
import { cn } from "@/lib/utils";
import {
  DUMMY_AML_STATS,
  DUMMY_RISK_DISTRIBUTION,
  DUMMY_RISK_TOTAL_CASES,
  DUMMY_SUSPICIOUS_ACTIVITY,
  DUMMY_AML_ALERTS,
  type AmlAlertRow,
  type AmlStat,
  type SuspiciousActivity,
} from "@/lib/dummyData";
import type { ColumnDef } from "@tanstack/react-table";
import type { ReactNode } from "react";

const STAT_ICONS: ReactNode[] = [
  <FolderOpen size={15} key="a" />,
  <Users size={15} key="b" />,
  <Receipt size={15} key="c" />,
  <AlertCircle size={15} key="d" />,
  <CheckCircle2 size={15} key="e" />,
  <Clock size={15} key="f" />,
];

function AmlStatCard({ stat, icon }: { stat: AmlStat; icon: ReactNode }) {
  const deltaColor =
    stat.tone === "danger"
      ? "text-(--color-danger)"
      : stat.tone === "success"
        ? "text-(--color-success-mid)"
        : "text-(--color-text-muted)";
  return (
    <Box className="rounded-lg border border-(--color-border) bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
      <Row justify="between" align="center" className="mb-2.5">
        <Text variant="caption" color="secondary" weight="medium" className="text-[0.75rem]">{stat.label}</Text>
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-(--color-bg-subtle) text-(--color-text-secondary)">{icon}</span>
      </Row>
      <Text variant="display" color="primary" weight="semibold" as="p" className="text-[1.625rem] leading-8">{stat.value}</Text>
      <Row gap={1} align="center" className="mt-1.5">
        <span className={cn("text-[0.625rem]", deltaColor)}>{stat.direction === "up" ? "▲" : "▼"}</span>
        <Text variant="micro" weight="semibold" className={cn("text-[0.625rem]", deltaColor)}>{stat.delta}</Text>
      </Row>
    </Box>
  );
}

function SuspiciousCard({ item }: { item: SuspiciousActivity }) {
  return (
    <Box className="rounded-lg border border-(--color-border) px-4 py-3">
      <Row justify="between" align="start" className="mb-1">
        <Text variant="caption" color="primary" weight="semibold" className="text-[0.75rem]">{item.title}</Text>
        <RiskPill level={item.severity} />
      </Row>
      <Text variant="micro" color="secondary" className="text-[0.6875rem]" as="p">{item.user}</Text>
      <Row justify="between" align="center" className="mt-2">
        <Text variant="micro" color="muted" className="text-[0.625rem]">{item.age}</Text>
        <button type="button" className="font-geom text-[0.6875rem] font-semibold text-(--color-brand) transition-opacity hover:opacity-75 focus:outline-none">
          View Investigation
        </button>
      </Row>
    </Box>
  );
}

export default function AMLReportsPage() {
  usePageTitle(
    "AML Reports",
    "Monitor suspicious activities, AML investigations, and regulatory compliance",
  );

  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  usePageActions(
    useMemo(
      () => (
        <Button size="sm">
          <Upload size={13} />
          Export Report
        </Button>
      ),
      [],
    ),
  );

  const filtered = useMemo(
    () =>
      DUMMY_AML_ALERTS.filter((alert) => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (
          alert.id.toLowerCase().includes(q) ||
          alert.user_name.toLowerCase().includes(q) ||
          alert.user_email.toLowerCase().includes(q)
        );
      }),
    [search],
  );

  const columns = useMemo<ColumnDef<AmlAlertRow, unknown>[]>(
    () => [
      { accessorKey: "id", header: "Alert ID", enableSorting: false, cell: ({ getValue }) => (<Text variant="caption" color="primary" weight="semibold">{getValue<string>()}</Text>) },
      {
        accessorKey: "user_name",
        header: "User",
        enableSorting: false,
        cell: ({ row }) => (
          <Stack gap={0}>
            <Text variant="caption" color="primary" weight="medium" as="p">{row.original.user_name}</Text>
            <Text variant="micro" color="muted" as="p">{row.original.user_email}</Text>
          </Stack>
        ),
      },
      { accessorKey: "trigger", header: "Trigger", enableSorting: false, cell: ({ getValue }) => (<Text variant="caption" color="secondary">{getValue<string>()}</Text>) },
      { accessorKey: "risk", header: "Risk Level", enableSorting: false, cell: ({ getValue }) => (<RiskPill level={getValue<AmlAlertRow["risk"]>()} />) },
      { accessorKey: "amount", header: "Transaction Amount", enableSorting: false, cell: ({ getValue }) => (<Text variant="caption" color="primary" weight="semibold">{getValue<string>()}</Text>) },
      { accessorKey: "date", header: "Date", enableSorting: false, cell: ({ getValue }) => (<Text variant="caption" color="secondary">{getValue<string>()}</Text>) },
      { accessorKey: "status", header: "Status", enableSorting: false, cell: ({ getValue }) => (<CaseStatusPill status={getValue<AmlAlertRow["status"]>()} />) },
      {
        accessorKey: "officer",
        header: "Assigned Officer",
        enableSorting: false,
        cell: ({ getValue }) => {
          const officer = getValue<string>();
          return (<Text variant="caption" color={officer === "Unassigned" ? "muted" : "secondary"}>{officer}</Text>);
        },
      },
      {
        id: "actions",
        header: "Actions",
        enableSorting: false,
        cell: ({ row }) => (
          <Row gap={3} align="center">
            <button type="button" onClick={() => navigate(`/compliance/aml/${row.original.id}`)} className="font-geom text-xs font-medium text-(--color-brand) transition-opacity hover:opacity-75 focus:outline-none">View</button>
            <button type="button" className="font-geom text-xs font-medium text-(--color-text-secondary) transition-opacity hover:opacity-75 focus:outline-none">Assign</button>
          </Row>
        ),
      },
    ],
    [navigate],
  );

  return (
    <Box p={6} className="space-y-5">
      {/* 6 stat cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {DUMMY_AML_STATS.map((stat, index) => (
          <AmlStatCard key={stat.label} stat={stat} icon={STAT_ICONS[index]} />
        ))}
      </div>

      {/* Risk Distribution + Recent Suspicious Activity */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="self-start">
          <Card.Header title="Risk Distribution" className="border-b-0 px-5 pb-1 pt-4 [&_h4]:text-[0.8125rem] [&_h4]:leading-5" />
          <Card.Body className="px-5 pb-5 pt-2">
            <Stack gap={4}>
              {DUMMY_RISK_DISTRIBUTION.map((row) => (
                <Box key={row.label}>
                  <Row justify="between" align="center" className="mb-1.5">
                    <Row gap={2} align="center">
                      <span className="h-2 w-2 rounded-full" style={{ background: row.color }} />
                      <Text variant="caption" color="secondary" className="text-[0.75rem]">{row.label}</Text>
                    </Row>
                    <Row gap={2} align="center">
                      <Text variant="caption" color="primary" weight="semibold" className="text-[0.75rem]">{row.count}</Text>
                      <Text variant="micro" color="muted" className="text-[0.625rem]">{row.pct}%</Text>
                    </Row>
                  </Row>
                  <div className="h-1 w-full overflow-hidden rounded-full bg-(--color-border)">
                    <div className="h-full rounded-full" style={{ width: `${row.pct}%`, background: row.color }} />
                  </div>
                </Box>
              ))}
            </Stack>
            <Row justify="between" align="center" className="mt-5 border-t border-(--color-border) pt-4">
              <Text variant="caption" color="secondary" weight="medium">Total Cases</Text>
              <Text variant="subtitle" color="primary" weight="semibold">{DUMMY_RISK_TOTAL_CASES}</Text>
            </Row>
          </Card.Body>
        </Card>

        <Card className="lg:col-span-2 self-start">
          <Card.Header title="Recent Suspicious Activity" className="border-b-0 px-5 pb-1 pt-4 [&_h4]:text-[0.8125rem] [&_h4]:leading-5" />
          <Card.Body className="px-5 pb-5 pt-2">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {DUMMY_SUSPICIOUS_ACTIVITY.map((item) => (
                <SuspiciousCard key={item.id} item={item} />
              ))}
            </div>
          </Card.Body>
        </Card>
      </div>

      {/* Recent AML Alerts */}
      <Card noPadding>
        <Box px={5} py={4} className="border-b border-(--color-border)">
          <Text variant="subtitle" color="primary" weight="semibold" as="p">Recent AML Alerts</Text>
          <Text variant="micro" color="muted" as="p">{DUMMY_AML_ALERTS.length} alerts found</Text>
        </Box>
        <Box px={5} py={3} className="border-b border-(--color-border)">
          <Row justify="between" align="center" gap={3}>
            <Row gap={3} align="center" className="flex-1">
              <SearchInput value={search} onChange={setSearch} placeholder="Search by alert ID, user..." className="h-9 w-full max-w-[22rem]" />
              <FilterButton label="Date Range" icon={<Calendar size={13} />} className="h-9" />
            </Row>
            <Button variant="secondary" size="sm" className="h-9 px-3 text-[0.6875rem]">
              <Upload size={13} />
              Export
            </Button>
          </Row>
        </Box>
        <DataTable
          data={filtered}
          columns={columns}
          emptyTitle="No alerts found"
          emptyMessage="Try adjusting your search"
        />
      </Card>
    </Box>
  );
}
