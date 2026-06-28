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
import { useDashboardRecentActivity } from "@/hooks/queries/useDashboard";

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

// ── Severity badge ────────────────────────────────────────
const severityStyle: Record<SeverityLevel, string> = {
  high: "bg-(--color-danger-subtle) text-(--color-danger) border border-(--color-danger-muted)",
  medium:
    "bg-(--color-warning-subtle) text-(--color-warning-dark) border border-(--color-warning-border)",
  low: "bg-(--color-success-bg) text-(--color-success-mid) border border-(--color-success-muted)",
};

// ── Status text ───────────────────────────────────────────
const statusStyle: Record<LogStatus, string> = {
  success: "text-(--color-success-mid) font-medium text-xs",
  failed: "text-(--color-danger) font-medium text-xs",
  pending: "text-(--color-warning) font-medium text-xs",
};

export default function UserActivityPage() {
  usePageTitle(
    "User Activity",
    "Track user activity, login history, and behavioral patterns across the platform.",
  );

  const [search, setSearch] = useState("");
  const { data: apiLogs = [], isLoading } = useDashboardRecentActivity(100);

  const logs = useMemo<ActivityLog[]>(
    () =>
      Array.isArray(apiLogs)
        ? apiLogs.map((value: unknown, index: number) => {
            const item =
              value && typeof value === "object"
                ? (value as Record<string, unknown>)
                : {};
            const user =
              item.user && typeof item.user === "object"
                ? (item.user as Record<string, unknown>)
                : {};

            const firstName = String(item.first_name ?? user.first_name ?? "");
            const lastName = String(item.last_name ?? user.last_name ?? "");
            const joinedName = [firstName, lastName].filter(Boolean).join(" ");
            return {
              id: String(item.id ?? item.log_id ?? index),
              timestamp: String(item.time ?? item.timestamp ?? item.activity_timestamp ?? item.created_at ?? item.date ?? "—"),
              user_name: joinedName || String(item.user_name ?? item.name ?? user.name ?? item.username ?? item.admin ?? user.email ?? "Unknown user"),
              user_id: String(item.user_id ?? user.id ?? "—"),
              action: String(item.action ?? item.event ?? item.type ?? "Activity"),
              action_icon: String(item.action_icon ?? "→"),
              device: String(item.device ?? item.device_name ?? "Unknown device"),
              location: String(item.location ?? item.country ?? "Unknown location"),
              ip: String(item.ip ?? item.ip_address ?? "—"),
              status: String(item.status ?? "success") as LogStatus,
            };
          })
        : [],
    [apiLogs],
  );

  const behaviorPatterns = useMemo<BehaviorPattern[]>(
    () =>
      logs
        .filter((log) => log.status === "failed")
        .slice(0, 5)
        .map((log) => ({
          id: log.id,
          severity: "high",
          title: log.action,
          instances: 1,
          description: `${log.action} from ${log.device}`,
          affected: [`User #${log.user_id}`],
        })),
    [logs],
  );

  const filteredLogs = useMemo(
    () =>
      logs.filter(
        (l) =>
          !search ||
          l.user_name.toLowerCase().includes(search.toLowerCase()) ||
          l.user_id.includes(search) ||
          l.ip.includes(search),
      ),
    [logs, search],
  );

  const columns = useMemo<ColumnDef<ActivityLog, unknown>[]>(
    () => [
      {
        accessorKey: "timestamp",
        header: "Timestamp",
        cell: ({ getValue }) => (
          <Row gap={2} align="center">
            {/* Checkbox-style icon matching image 1 */}
            <span className="h-4 w-4 rounded-sm border border-(--color-border) flex items-center justify-center shrink-0" />
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
            <span className="text-(--color-brand) text-[0.8125rem]">
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
          value={logs.length.toLocaleString()}
          icon={<Activity size={16} className="text-(--color-brand)" />}
        />
        <StatCard
          label="Active Users"
          value={logs.filter((log) => log.status === "success").length.toLocaleString()}
          icon={<LogIn size={16} className="text-(--color-success-mid)" />}
          status="success"
        />
        <StatCard
          label="Failed Attempts"
          value={logs.filter((log) => log.status === "failed").length.toLocaleString()}
          icon={
            <ShieldAlert size={16} className="text-(--color-danger)" />
          }
          status="danger"
        />
        <StatCard
          label="Flagged Patterns"
          value={behaviorPatterns.length}
          icon={<Sparkles size={16} className="text-(--color-warning)" />}
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
            {behaviorPatterns.map((pattern) => (
              <Row
                key={pattern.id}
                justify="between"
                align="center"
                gap={4}
                className="py-2 border-b border-(--color-border) last:border-0"
              >
                <Stack gap={1}>
                  <Row gap={2} align="center">
                    {/* Severity pill */}
                    <span
                      className={[
                        "inline-flex items-center px-2 py-0.5 rounded-full text-[0.6875rem] font-semibold",
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
            {!behaviorPatterns.length && (
              <Text variant="caption" color="muted">
                No behavioral patterns detected.
              </Text>
            )}
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
        <Box px={5} py={3} className="border-b border-(--color-border)">
          <Row justify="between" align="center" gap={3}>
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search by user name, ID, or IP address..."
              className="flex-1 max-w-[30rem]"
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
          emptyMessage={isLoading ? "Loading activity logs..." : "No activity found matching your search"}
          stickyHeader
        />
      </Card>
    </Box>
  );
}
