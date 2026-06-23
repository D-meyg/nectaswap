import { usePageTitle } from "@/layouts/AppLayout";
import { useMemo, useState } from "react";
import { Download, CheckCircle, X, AlertTriangle, Eye } from "lucide-react";

import { StatCard } from "@/components/ui/StatCard";
import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { Row } from "@/components/ui/Row";
import { Stack } from "@/components/ui/Stack";
import { Box } from "@/components/ui/Box";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Avatar } from "@/components/ui/Avatar";
import { DataTable } from "@/components/tables/DataTable";
import { SearchInput } from "@/components/forms/SearchInput";
import { FilterButton } from "@/components/ui/FilterButton";
import { useDebounce } from "@/hooks/ui/useDebounce";
import { useAdminActivityLogs } from "@/hooks/queries/useAdmins";
import type { ColumnDef } from "@tanstack/react-table";

interface AuditLog {
  timestamp: string;
  admin: string;
  action: string;
  target: string;
  category: string;
  category_color: string;
  result: "Success" | "Failed" | "Warning";
  ip_address: string;
  log_id: string;
  details: string;
}

function text(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function normalizeResult(value: unknown): AuditLog["result"] {
  const result = text(value, "Success").toLowerCase();
  if (result === "failed" || result === "failure") return "Failed";
  if (result === "warning" || result === "warn") return "Warning";
  return "Success";
}

function categoryColor(category: string) {
  const normalized = category.toLowerCase();
  if (normalized.includes("financial")) return "text-(--color-success-mid)";
  if (normalized.includes("security")) return "text-(--color-warning-dark)";
  if (normalized.includes("compliance")) return "text-(--color-brand)";
  return "text-(--color-text-secondary)";
}

function normalizeAudit(value: unknown): AuditLog {
  const item =
    value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  const admin =
    item.admin && typeof item.admin === "object"
      ? (item.admin as Record<string, unknown>)
      : {};
  const category = text(item.category ?? item.module, "System");

  return {
    timestamp: text(item.timestamp ?? item.created_at ?? item.date, "N/A"),
    admin: text(item.admin_name ?? item.admin ?? admin.name, "System"),
    action: text(item.action ?? item.event, "Activity"),
    target: text(item.target ?? item.description, "N/A"),
    category,
    category_color: text(item.category_color, categoryColor(category)),
    result: normalizeResult(item.result ?? item.status),
    ip_address: text(item.ip_address ?? item.ip, "N/A"),
    log_id: text(item.log_id ?? item.id, "#000001"),
    details: text(item.details ?? item.description, "No details provided."),
  };
}

function ResultBadge({ result }: { result: AuditLog["result"] }) {
  const styles = {
    Success: {
      icon: <CheckCircle size={12} />,
      cls: "text-(--color-success-mid)",
    },
    Failed: { icon: <X size={12} />, cls: "text-(--color-danger)" },
    Warning: {
      icon: <AlertTriangle size={12} />,
      cls: "text-(--color-warning-dark)",
    },
  };
  const s = styles[result] ?? styles.Success;
  return (
    <Row gap={1} align="center" className={s.cls}>
      {s.icon}
      <Text variant="caption" weight="medium" color="inherit">
        {result}
      </Text>
    </Row>
  );
}

function AuditLogDetailsModal({
  log,
  onClose,
}: {
  log: AuditLog | null;
  onClose: () => void;
}) {
  if (!log) return null;

  const details = [
    ["Timestamp", log.timestamp],
    ["Admin User", log.admin],
    ["Action", log.action],
    ["Target", log.target],
    ["Category", log.category],
    ["Result", log.result],
    ["IP Address", log.ip_address],
    ["Log ID", log.log_id],
  ];

  return (
    <Modal open={Boolean(log)} onClose={onClose} size="lg" className="max-w-[38rem]">
      <Modal.Header
        title="Audit Log Details"
        onClose={onClose}
        className="border-b-0 px-5 pb-2 pt-5 [&_h4]:text-[1rem] [&_h4]:leading-5"
      />
      <Modal.Body className="px-5 pb-3 pt-0">
        <div className="grid grid-cols-2 overflow-hidden rounded-(--radius-sm) border border-(--color-border)">
          {details.map(([label, value]) => (
            <div key={label} className="border-b border-r border-(--color-border) px-3 py-2 even:border-r-0 last:border-b-0 [&:nth-last-child(2)]:border-b-0">
              <Text variant="micro" color="muted" className="block text-[0.625rem] leading-3">
                {label}
              </Text>
              {label === "Result" ? (
                <ResultBadge result={value as AuditLog["result"]} />
              ) : (
                <Text variant="caption" color="primary" className="mt-0.5 block text-[0.75rem] leading-4">
                  {value}
                </Text>
              )}
            </div>
          ))}
        </div>

        <Stack gap={1} className="mt-3">
          <Text variant="micro" color="muted" className="text-[0.625rem] leading-3">
            Details
          </Text>
          <Box className="rounded-(--radius-sm) bg-(--color-bg-subtle) px-3 py-3">
            <Text variant="caption" color="primary" className="text-[0.75rem] leading-4">
              {log.details}
            </Text>
          </Box>
        </Stack>
      </Modal.Body>
      <Modal.Footer className="grid grid-cols-2 gap-3 border-t-0 bg-white px-5 pb-5 pt-2">
        <Button variant="secondary" size="sm" className="h-9 justify-center text-[0.75rem]" onClick={onClose}>
          Close
        </Button>
        <Button size="sm" className="h-9 justify-center text-[0.75rem]">
          Export This Log
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default function AuditLogsPage() {
  usePageTitle(
    "Audit Logs",
    "View complete audit trail of all admin actions and system events",
  );

  const [search, setSearch] = useState("");
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const debounced = useDebounce(search, 300);
  const { data: apiLogs = [], isLoading } = useAdminActivityLogs();
  const logs = useMemo(
    () => (Array.isArray(apiLogs) ? apiLogs.map(normalizeAudit) : []),
    [apiLogs],
  );

  const filtered = useMemo(
    () =>
      logs.filter(
        (l) =>
          !debounced ||
          l.admin.toLowerCase().includes(debounced.toLowerCase()) ||
          l.action.toLowerCase().includes(debounced.toLowerCase()) ||
          l.target.toLowerCase().includes(debounced.toLowerCase()),
      ),
    [logs, debounced],
  );

  const success = logs.filter((l) => l.result === "Success").length;
  const failed = logs.filter((l) => l.result === "Failed").length;
  const warnings = logs.filter((l) => l.result === "Warning").length;

  const columns = useMemo<ColumnDef<AuditLog, unknown>[]>(
    () => [
      {
        accessorKey: "timestamp",
        header: "Timestamp",
        cell: ({ getValue }) => (
          <Text variant="caption" color="secondary">
            {getValue<string>()}
          </Text>
        ),
      },
      {
        accessorKey: "admin",
        header: "Admin",
        cell: ({ getValue }) => (
          <Row gap={2} align="center">
            <Avatar name={getValue<string>()} size="xs" />
            <Text variant="caption" color="primary" weight="medium">
              {getValue<string>()}
            </Text>
          </Row>
        ),
      },
      {
        accessorKey: "action",
        header: "Action",
        cell: ({ getValue }) => (
          <Text variant="caption" color="primary" weight="medium">
            {getValue<string>()}
          </Text>
        ),
      },
      {
        accessorKey: "target",
        header: "Target",
        cell: ({ getValue }) => (
          <Text
            variant="caption"
            color="secondary"
            className="max-w-[12.5rem] truncate block"
          >
            {getValue<string>()}
          </Text>
        ),
      },
      {
        accessorKey: "category",
        header: "Category",
        cell: ({ row }) => (
          <Text
            variant="caption"
            weight="medium"
            className={row.original.category_color}
          >
            {row.original.category}
          </Text>
        ),
      },
      {
        accessorKey: "result",
        header: "Result",
        cell: ({ getValue }) => (
          <ResultBadge result={getValue<AuditLog["result"]>()} />
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 flex items-center justify-center"
            onClick={() => setSelectedLog(row.original)}
          >
            <Eye size={14} className="text-(--color-text-muted)" />
          </Button>
        ),
      },
    ],
    [],
  );

  return (
    <Box p={6} className="space-y-5">
      {/* Filter bar */}
      <Box>
        <Row justify="between" align="center" gap={3}>
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search by admin, action, or target..."
            className="max-w-[23.75rem] flex-1"
          />
          <Row gap={2}>
            <FilterButton label="" />
            <FilterButton label="" />
            <FilterButton label="" />
            <Button variant="secondary" size="sm">
              <Download size={13} />
              Export
            </Button>
          </Row>
        </Row>
      </Box>

      {/* 4 stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Logs" value={logs.length} />
        <StatCard
          label="Success"
          value={success}
          status="success"
          icon={
            <CheckCircle
              size={16}
              className="text-(--color-success-mid)"
            />
          }
        />
        <StatCard
          label="Failed"
          value={failed}
          status="danger"
          icon={<X size={16} className="text-(--color-danger)" />}
        />
        <StatCard
          label="Warnings"
          value={warnings}
          status="warning"
          icon={
            <AlertTriangle size={16} className="text-(--color-warning)" />
          }
        />
      </div>

      {/* Logs table */}
      <Card noPadding>
        <DataTable
          data={filtered}
          columns={columns}
          loading={isLoading}
          emptyTitle="No audit logs"
          emptyMessage="No logs found matching your search"
          stickyHeader
        />
      </Card>
      <AuditLogDetailsModal log={selectedLog} onClose={() => setSelectedLog(null)} />
    </Box>
  );
}
