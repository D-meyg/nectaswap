import { useState, useMemo } from "react";
import { Activity, LogIn, ShieldAlert, Sparkles, Download } from "lucide-react";

import { usePageTitle } from "@/layouts/AppLayout";
import { StatCard } from "@/components/ui/StatCard";
import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { Row } from "@/components/ui/Row";
import { Stack } from "@/components/ui/Stack";
import { Box } from "@/components/ui/Box";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/tables/DataTable";
import { SearchInput } from "@/components/forms/SearchInput";
import { FilterButton } from "@/components/ui/FilterButton";

import type { ColumnDef } from "@tanstack/react-table";

// ── Types matching image 1 exactly ───────────────────────
type SeverityLevel = "high" | "medium" | "low";
type LogStatus = "success" | "failed" | "pending";

interface BehaviorPattern {
  id: string;
  severity: SeverityLevel;
  title: string;
  instances: number;
  description: string;
  affected: string[];
}

interface ActivityLog {
  id: string;
  timestamp: string;
  user_name: string;
  user_id: string;
  action: string;
  action_icon: string;
  device: string;
  location: string;
  ip: string;
  status: LogStatus;
}

// ── Dummy data matching image 1 ───────────────────────────
const BEHAVIOR_PATTERNS: BehaviorPattern[] = [
  {
    id: "b1",
    severity: "high",
    title: "Multiple Failed Login Attempts",
    instances: 5,
    description: "3+ failed logins within 10 minutes",
    affected: ["User #5621", "User #2389"],
  },
  {
    id: "b2",
    severity: "medium",
    title: "Unusual Transaction Volume",
    instances: 3,
    description: "Transaction volume 3x above average",
    affected: ["User #4521", "User #7234"],
  },
  {
    id: "b3",
    severity: "low",
    title: "New Device Login",
    instances: 12,
    description: "Login from previously unseen device",
    affected: ["User #8923", "User #3892"],
  },
  {
    id: "b4",
    severity: "high",
    title: "Location Anomaly",
    instances: 2,
    description: "Login from different countries within 1 hour",
    affected: ["User #6712"],
  },
  {
    id: "b5",
    severity: "medium",
    title: "High-Value Transactions",
    instances: 8,
    description: "Transactions >₦500,000",
    affected: ["User #4521", "User #3892"],
  },
];

const ACTIVITY_LOGS: ActivityLog[] = [
  {
    id: "l1",
    timestamp: "2024-01-29 14:25:12",
    user_name: "Adewale Johnson",
    user_id: "4521",
    action: "Login",
    action_icon: "→",
    device: "iPhone 13 Pro",
    location: "Lagos, Nigeria",
    ip: "197.210.70.34",
    status: "success",
  },
  {
    id: "l2",
    timestamp: "2024-01-29 14:20:45",
    user_name: "Chiamaka Nnamdi",
    user_id: "3892",
    action: "Transaction",
    action_icon: "⇄",
    device: "Samsung Galaxy S21",
    location: "Abuja, Nigeria",
    ip: "197.210.84.21",
    status: "success",
  },
  {
    id: "l3",
    timestamp: "2024-01-29 14:15:33",
    user_name: "Yusuf Ibrahim",
    user_id: "5621",
    action: "Failed Login",
    action_icon: "→",
    device: "Windows PC",
    location: "Kano, Nigeria",
    ip: "197.210.55.18",
    status: "failed",
  },
  {
    id: "l4",
    timestamp: "2024-01-29 14:10:22",
    user_name: "Funke Olawale",
    user_id: "7234",
    action: "Card Used",
    action_icon: "▣",
    device: "Virtual Card",
    location: "Lagos, Nigeria",
    ip: "197.210.91.47",
    status: "success",
  },
];

// ── Severity badge ────────────────────────────────────────
const severityStyle: Record<SeverityLevel, string> = {
  high: "bg-[var(--color-danger-subtle)] text-[var(--color-danger)] border border-[var(--color-danger-muted)]",
  medium:
    "bg-[var(--color-warning-subtle)] text-[var(--color-warning-dark)] border border-[var(--color-warning-border)]",
  low: "bg-[var(--color-success-bg)] text-[var(--color-success-mid)] border border-[var(--color-success-muted)]",
};

// ── Status text ───────────────────────────────────────────
const statusStyle: Record<LogStatus, string> = {
  success: "text-[var(--color-success-mid)] font-medium text-[12px]",
  failed: "text-[var(--color-danger)] font-medium text-[12px]",
  pending: "text-[var(--color-warning)] font-medium text-[12px]",
};

export default function UserActivityPage() {
  usePageTitle(
    "User Activity",
    "Track user activity, login history, and behavioral patterns across the platform.",
  );

  const [search, setSearch] = useState("");

  const filteredLogs = useMemo(
    () =>
      ACTIVITY_LOGS.filter(
        (l) =>
          !search ||
          l.user_name.toLowerCase().includes(search.toLowerCase()) ||
          l.user_id.includes(search) ||
          l.ip.includes(search),
      ),
    [search],
  );

  const columns = useMemo<ColumnDef<ActivityLog, unknown>[]>(
    () => [
      {
        accessorKey: "timestamp",
        header: "Timestamp",
        cell: ({ getValue }) => (
          <Row gap={2} align="center">
            {/* Checkbox-style icon matching image 1 */}
            <span className="h-4 w-4 rounded-[2px] border border-[var(--color-border)] flex items-center justify-center shrink-0" />
            <Text variant="caption" color="secondary">
              {getValue<string>()}
            </Text>
          </Row>
        ),
      },
      {
        accessorKey: "user_name",
        header: "User",
        cell: ({ row }) => (
          <Stack gap={0}>
            <Text variant="caption" color="primary" weight="semibold" as="p">
              {row.original.user_name}
            </Text>
            <Text variant="micro" color="muted" as="p">
              ID: {row.original.user_id}
            </Text>
          </Stack>
        ),
      },
      {
        accessorKey: "action",
        header: "Action",
        cell: ({ row }) => (
          <Row gap={2} align="center">
            <span className="text-[var(--color-brand)] text-[13px]">
              {row.original.action_icon}
            </span>
            <Stack gap={0}>
              <Text variant="caption" color="primary" weight="medium" as="p">
                {row.original.action}
              </Text>
            </Stack>
          </Row>
        ),
      },
      {
        accessorKey: "device",
        header: "Device",
        cell: ({ getValue }) => (
          <Text variant="caption" color="secondary">
            {getValue<string>()}
          </Text>
        ),
      },
      {
        accessorKey: "location",
        header: "Location",
        cell: ({ getValue }) => (
          <Text variant="caption" color="secondary">
            {getValue<string>()}
          </Text>
        ),
      },
      {
        accessorKey: "ip",
        header: "IP Address",
        cell: ({ getValue }) => (
          <Text variant="caption" color="secondary" className="font-mono">
            {getValue<string>()}
          </Text>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => {
          const v = getValue<LogStatus>();
          return <span className={statusStyle[v]}>{v}</span>;
        },
      },
    ],
    [],
  );

  return (
    <Box p={6} className="space-y-5">
      {/* 4 stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total Activities (24h)"
          value="2,847"
          icon={<Activity size={16} className="text-[var(--color-brand)]" />}
        />
        <StatCard
          label="Active Users"
          value="1,247"
          icon={<LogIn size={16} className="text-[var(--color-success-mid)]" />}
          status="success"
        />
        <StatCard
          label="Failed Attempts"
          value="34"
          icon={
            <ShieldAlert size={16} className="text-[var(--color-danger)]" />
          }
          status="danger"
        />
        <StatCard
          label="Flagged Patterns"
          value="5"
          icon={<Sparkles size={16} className="text-[var(--color-warning)]" />}
          status="warning"
        />
      </div>

      {/* Behavioral Patterns Detected */}
      <Card>
        <Card.Header
          title="Behavioral Patterns Detected"
          subtitle="Unusual activity patterns requiring attention"
        />
        <Card.Body padded>
          <Stack gap={4}>
            {BEHAVIOR_PATTERNS.map((pattern) => (
              <Row
                key={pattern.id}
                justify="between"
                align="center"
                gap={4}
                className="py-2 border-b border-[var(--color-border)] last:border-0"
              >
                <Stack gap={1}>
                  <Row gap={2} align="center">
                    {/* Severity pill */}
                    <span
                      className={[
                        "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold",
                        severityStyle[pattern.severity],
                      ].join(" ")}
                    >
                      {pattern.severity}
                    </span>
                    <Text variant="caption" color="primary" weight="semibold">
                      {pattern.title}
                    </Text>
                    <Text variant="micro" color="muted">
                      ({pattern.instances} instances)
                    </Text>
                  </Row>
                  <Text variant="micro" color="secondary">
                    {pattern.description}
                  </Text>
                  <Row gap={2} align="center">
                    <Text variant="micro" color="muted">
                      Affected users:
                    </Text>
                    {pattern.affected.map((u) => (
                      <Text
                        key={u}
                        variant="micro"
                        color="brand"
                        weight="medium"
                      >
                        {u}
                      </Text>
                    ))}
                  </Row>
                </Stack>
                <Button size="sm" className="shrink-0">
                  Investigate
                </Button>
              </Row>
            ))}
          </Stack>
        </Card.Body>
      </Card>

      {/* Activity Logs table */}
      <Card noPadding>
        <Card.Header
          title="Activity Logs"
          subtitle="Real-time user activity monitoring"
          action={
            <Button variant="secondary" size="sm">
              <Download size={13} />
              Export Logs
            </Button>
          }
        />

        {/* Toolbar: search + filter buttons */}
        <Box px={5} py={3} className="border-b border-[var(--color-border)]">
          <Row justify="between" align="center" gap={3}>
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search by user name, ID, or IP address..."
              className="flex-1 max-w-[480px]"
            />
            <Row gap={2} align="center">
              <FilterButton label="All Actions" />
              <FilterButton label="Status" />
            </Row>
          </Row>
        </Box>

        <DataTable
          data={filteredLogs}
          columns={columns}
          emptyTitle="No activity logs"
          emptyMessage="No activity found matching your search"
          stickyHeader
        />
      </Card>
    </Box>
  );
}
