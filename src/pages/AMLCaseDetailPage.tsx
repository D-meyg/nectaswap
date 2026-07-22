import { useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ChevronRight, ShieldAlert } from "lucide-react";

import { usePageActions, usePageTitle } from "@/layouts/AppLayout";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { Row } from "@/components/ui/Row";
import { Stack } from "@/components/ui/Stack";
import { Box } from "@/components/ui/Box";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { EmptyState } from "@/components/ui/EmptyState";
import { DataTable } from "@/components/tables/DataTable";
import { RiskPill, CaseStatusPill } from "@/components/compliance/CompliancePills";
import { DUMMY_AML_CASES, type AmlCaseDetail } from "@/lib/dummyData";
import type { ColumnDef } from "@tanstack/react-table";

type LinkedTx = AmlCaseDetail["linked_transactions"][number];

function SummaryPair({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Row justify="between" align="center" gap={3} className="min-w-0">
      <Text variant="caption" color="tertiary" className="shrink-0 text-[0.6875rem]">{label}</Text>
      {typeof value === "string" ? (
        <Text variant="caption" color="primary" weight="semibold" className="text-right text-[0.75rem]">{value}</Text>
      ) : value}
    </Row>
  );
}

export default function AMLCaseDetailPage() {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const amlCase = DUMMY_AML_CASES[id];

  usePageTitle(
    amlCase ? amlCase.id : "AML Case",
    amlCase ? `${amlCase.trigger} · ${amlCase.date}` : "Case detail",
  );

  usePageActions(
    useMemo(
      () =>
        amlCase ? (
          <>
            <Button variant="secondary" size="sm" className="h-8 px-3 text-[0.6875rem]" onClick={() => navigate("/compliance/aml")}>
              <ArrowLeft size={13} />
              Back
            </Button>
            <Button size="sm" className="h-8 border-(--color-warning-border) bg-(--color-warning-yellow-bg) px-3 text-[0.6875rem] text-(--color-warning-text) hover:opacity-90">
              Escalate
            </Button>
            <Button size="sm" className="h-8 border-(--color-success-mid) bg-(--color-success-mid) px-3 text-[0.6875rem] text-white hover:opacity-90">
              Close Case
            </Button>
          </>
        ) : null,
      [navigate, amlCase],
    ),
  );

  const columns = useMemo<ColumnDef<LinkedTx, unknown>[]>(
    () => [
      { accessorKey: "id", header: "Transaction ID", enableSorting: false, cell: ({ getValue }) => (<Text variant="caption" color="primary" weight="semibold" className="font-mono">{getValue<string>()}</Text>) },
      { accessorKey: "description", header: "Description", enableSorting: false, cell: ({ getValue }) => (<Text variant="caption" color="secondary">{getValue<string>()}</Text>) },
      {
        accessorKey: "amount",
        header: "Amount",
        enableSorting: false,
        cell: ({ getValue }) => {
          const v = getValue<string>();
          return (<Text variant="caption" weight="semibold" className={v.startsWith("-") ? "text-(--color-danger)" : "text-(--color-success-mid)"}>{v}</Text>);
        },
      },
      { accessorKey: "date", header: "Date", enableSorting: false, cell: ({ getValue }) => (<Text variant="caption" color="secondary">{getValue<string>()}</Text>) },
      { accessorKey: "status", header: "Status", enableSorting: false, cell: ({ getValue }) => (<CaseStatusPill status={getValue<"Flagged">()} />) },
    ],
    [],
  );

  if (!amlCase) {
    return (
      <Box p={6}>
        <EmptyState icon={ShieldAlert} title="Case not found" description="This AML case does not exist." />
      </Box>
    );
  }

  return (
    <Box p={6}>
      <Breadcrumbs
        items={[
          { label: "Home", to: "/" },
          { label: "Compliance", to: "/compliance/aml" },
          { label: "AML Reports", to: "/compliance/aml" },
          { label: amlCase.id },
        ]}
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Left column */}
        <Stack gap={5} className="lg:col-span-2">
          <Card>
            <Card.Header title="Case Summary" className="border-b-0 px-5 pb-1 pt-4 [&_h4]:text-[0.8125rem] [&_h4]:leading-5" />
            <Card.Body className="px-5 pb-5 pt-1">
              <Text variant="caption" color="secondary" className="mb-4 block text-[0.75rem] leading-5">{amlCase.summary}</Text>
              <div className="grid grid-cols-1 gap-x-10 gap-y-4 sm:grid-cols-2">
                <SummaryPair label="Case ID" value={amlCase.id} />
                <SummaryPair label="Risk Level" value={<RiskPill level={amlCase.risk} />} />
                <SummaryPair label="Status" value={<CaseStatusPill status={amlCase.status} />} />
                <SummaryPair label="Amount" value={amlCase.amount} />
                <SummaryPair label="Trigger" value={amlCase.trigger} />
                <SummaryPair label="Officer" value={amlCase.officer} />
                <SummaryPair label="Date" value={amlCase.date} />
              </div>
            </Card.Body>
          </Card>

          <Card noPadding>
            <Box px={5} py={4} className="border-b border-(--color-border)">
              <Text variant="subtitle" color="primary" weight="semibold" as="p">Linked Transactions</Text>
            </Box>
            <DataTable data={amlCase.linked_transactions} columns={columns} emptyTitle="No linked transactions" emptyMessage="No transactions linked to this case" />
          </Card>

          <Card>
            <Card.Header title="Audit Log" className="border-b-0 px-5 pb-1 pt-4 [&_h4]:text-[0.8125rem] [&_h4]:leading-5" />
            <Card.Body className="px-5 pb-5 pt-2">
              <Stack gap={0}>
                {amlCase.audit_log.map((entry, index) => (
                  <Row key={index} gap={3} align="start" className="py-2.5">
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-(--color-brand)" />
                    <Stack gap={0} className="min-w-0">
                      <Text variant="caption" color="primary" weight="semibold" className="text-[0.75rem]" as="p">{entry.title}</Text>
                      <Text variant="micro" color="muted" className="text-[0.625rem]" as="p">{entry.actor} · {entry.timestamp}</Text>
                    </Stack>
                  </Row>
                ))}
              </Stack>
            </Card.Body>
          </Card>
        </Stack>

        {/* Right column */}
        <Stack gap={5}>
          <Card>
            <Card.Header title="LINKED USER" className="border-b-0 px-4 pb-1 pt-3 [&_h4]:text-[0.625rem] [&_h4]:uppercase [&_h4]:tracking-[0.06em] [&_h4]:text-(--color-text-tertiary)" />
            <Card.Body className="px-4 pb-3 pt-1">
              <Row gap={3} align="center" className="mb-3">
                <Avatar name={amlCase.linked_user.name} size="md" />
                <Stack gap={0} className="min-w-0">
                  <Text variant="caption" color="primary" weight="semibold" as="p">{amlCase.linked_user.name}</Text>
                  <Text variant="micro" color="muted" as="p">{amlCase.linked_user.email}</Text>
                </Stack>
              </Row>
              <Stack gap={0}>
                <Link to="/users" className="group flex items-center justify-between border-t border-(--color-border) py-2.5">
                  <Text variant="caption" color="brand" weight="semibold" className="text-[0.75rem]">View User Profile</Text>
                  <ChevronRight size={13} className="shrink-0 text-(--color-text-muted) transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link to="/compliance/flagged" className="group flex items-center justify-between border-t border-(--color-border) py-2.5">
                  <Text variant="caption" color="primary" weight="medium" className="text-[0.75rem]">Flagged Users</Text>
                  <ChevronRight size={13} className="shrink-0 text-(--color-text-muted) transition-transform group-hover:translate-x-0.5" />
                </Link>
              </Stack>
            </Card.Body>
          </Card>

          <Card>
            <Card.Header title="LINKED WALLET" className="border-b-0 px-4 pb-1 pt-3 [&_h4]:text-[0.625rem] [&_h4]:uppercase [&_h4]:tracking-[0.06em] [&_h4]:text-(--color-text-tertiary)" />
            <Card.Body className="px-4 pb-3 pt-1">
              <Stack gap={0}>
                <Link to="/wallets/wallet/hot" className="group flex items-center justify-between py-2.5">
                  <Text variant="caption" color="brand" weight="semibold" className="text-[0.75rem]">View Wallet</Text>
                  <ChevronRight size={13} className="shrink-0 text-(--color-text-muted) transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link to="/wallets/liquidity" className="group flex items-center justify-between border-t border-(--color-border) py-2.5">
                  <Text variant="caption" color="primary" weight="medium" className="text-[0.75rem]">Liquidity Monitor</Text>
                  <ChevronRight size={13} className="shrink-0 text-(--color-text-muted) transition-transform group-hover:translate-x-0.5" />
                </Link>
              </Stack>
            </Card.Body>
          </Card>
        </Stack>
      </div>
    </Box>
  );
}
