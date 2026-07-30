import { usePageTitle } from "@/layouts/AppLayout";
import { useMemo, useState } from "react";
import { Download, Activity, LogIn, Settings, FileText, Eye } from "lucide-react";

import { StatCard } from "@/components/ui/StatCard";
import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { Row } from "@/components/ui/Row";
import { Stack } from "@/components/ui/Stack";
import { Box } from "@/components/ui/Box";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { DataTable } from "@/components/tables/DataTable";
import { SearchInput } from "@/components/forms/SearchInput";
import { useDebounce } from "@/hooks/ui/useDebounce";
import { useTeamActivityLogsPaged } from "@/hooks/queries/useTeam";
import { formatDate } from "@/lib/date";
import type { ColumnDef } from "@tanstack/react-table";

interface AuditLog {
  id: string;
  timestamp: string;
  activity_type: string;
  description: string;
  ip_address: string;
  device: string;
  admin_id: string;
}

function text(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value : fallback;
}
function obj(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function normalizeAudit(value: unknown): AuditLog {
  const item = obj(value);
  const details = obj(item.activity_details);
  return {
    id: text(item.id ?? item.pkid, ""),
    timestamp: text(item.activity_timestamp ?? item.created_at ?? item.timestamp, ""),
    activity_type: text(item.activity_type ?? item.action, "activity"),
    description: text(item.activity_description ?? item.description, "—"),
    ip_address: text(item.request_ip ?? item.ip, "—"),
    device: text(details.device_name ?? item.device_name, "—"),
    admin_id: text(item.admin_id, "—"),
  };
}

function typeLabel(t: string) {
  return t.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function AuditLogDetailsModal({ log, onClose }: { log: AuditLog | null; onClose: () => void }) {
  if (!log) return null;
  const rows: Array<[string, string]> = [
    ["Timestamp", formatDate(log.timestamp)],
    ["Activity", typeLabel(log.activity_type)],
    ["IP Address", log.ip_address],
    ["Device", log.device],
    ["Admin ID", log.admin_id],
  ];
  return (
    <Modal open={Boolean(log)} onClose={onClose} size="lg" className="max-w-[38rem]">
      <Modal.Header title="Audit Log Details" onClose={onClose} className="border-b-0 px-5 pb-2 pt-5 [&_h4]:text-[1rem] [&_h4]:leading-5" />
      <Modal.Body className="px-5 pb-3 pt-0">
        <div className="grid grid-cols-2 overflow-hidden rounded-(--radius-sm) border border-(--color-border)">
          {rows.map(([label, value]) => (
            <div key={label} className="border-b border-r border-(--color-border) px-3 py-2 even:border-r-0 last:border-b-0 [&:nth-last-child(2)]:border-b-0">
              <Text variant="micro" color="muted" className="block text-[0.625rem] leading-3">{label}</Text>
              <Text variant="caption" color="primary" className="mt-0.5 block text-[0.75rem] leading-4 break-all">{value}</Text>
            </div>
          ))}
        </div>
        <Stack gap={1} className="mt-3">
          <Text variant="micro" color="muted" className="text-[0.625rem] leading-3">Description</Text>
          <Box className="rounded-(--radius-sm) bg-(--color-bg-subtle) px-3 py-3">
            <Text variant="caption" color="primary" className="text-[0.75rem] leading-4">{log.description}</Text>
          </Box>
        </Stack>
      </Modal.Body>
      <Modal.Footer className="border-t-0 bg-white px-5 pb-5 pt-2">
        <Button variant="secondary" size="sm" className="h-9 justify-center text-[0.75rem]" onClick={onClose}>Close</Button>
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
  const [page, setPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const debounced = useDebounce(search, 300);

  const {
    data: logsData = { rows: [], total: 0, page: 1, pages: 1 },
    isLoading,
  } = useTeamActivityLogsPaged(page, 20);

  const logs = useMemo(
    () => (Array.isArray(logsData.rows) ? logsData.rows.map(normalizeAudit) : []),
    [logsData.rows],
  );

  const filtered = useMemo(
    () =>
      logs.filter(
        (l) =>
          !debounced ||
          l.description.toLowerCase().includes(debounced.toLowerCase()) ||
          l.activity_type.toLowerCase().includes(debounced.toLowerCase()) ||
          l.ip_address.toLowerCase().includes(debounced.toLowerCase()),
      ),
    [logs, debounced],
  );

  const logins = logs.filter((l) => l.activity_type.toLowerCase().includes("login")).length;
  const updates = logs.filter((l) => l.activity_type.toLowerCase().includes("update")).length;
  const other = logs.length - logins - updates;

  const columns = useMemo<ColumnDef<AuditLog, unknown>[]>(
    () => [
      { accessorKey: "timestamp", header: "Timestamp", enableSorting: false, cell: ({ getValue }) => (<Text variant="caption" color="secondary">{formatDate(getValue<string>())}</Text>) },
      { accessorKey: "activity_type", header: "Activity", enableSorting: false, cell: ({ getValue }) => (<Text variant="caption" color="primary" weight="medium">{typeLabel(getValue<string>())}</Text>) },
      { accessorKey: "description", header: "Description", enableSorting: false, cell: ({ getValue }) => (<Text variant="caption" color="secondary" className="max-w-[22rem] truncate block">{getValue<string>()}</Text>) },
      { accessorKey: "ip_address", header: "IP Address", enableSorting: false, cell: ({ getValue }) => (<Text variant="caption" color="secondary" className="font-mono text-[0.6875rem]">{getValue<string>()}</Text>) },
      { accessorKey: "device", header: "Device", enableSorting: false, cell: ({ getValue }) => (<Text variant="caption" color="secondary">{getValue<string>()}</Text>) },
      {
        id: "actions", header: "Actions", enableSorting: false,
        cell: ({ row }) => (
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 flex items-center justify-center" onClick={() => setSelectedLog(row.original)}>
            <Eye size={14} className="text-(--color-text-muted)" />
          </Button>
        ),
      },
    ],
    [],
  );

  return (
    <Box p={6} className="space-y-5">
      <Box>
        <Row justify="between" align="center" gap={3}>
          <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search by activity, description, or IP..." className="max-w-[23.75rem] flex-1" />
          <Button variant="secondary" size="sm">
            <Download size={13} />
            Export
          </Button>
        </Row>
      </Box>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Logs" value={logsData.total} icon={<Activity size={16} className="text-(--color-brand)" />} status="info" />
        <StatCard label="Logins" value={logins} icon={<LogIn size={16} className="text-(--color-success-mid)" />} status="success" />
        <StatCard label="Updates" value={updates} icon={<Settings size={16} className="text-(--color-warning)" />} status="warning" />
        <StatCard label="Other" value={other < 0 ? 0 : other} icon={<FileText size={16} className="text-(--color-text-secondary)" />} />
      </div>

      <Card noPadding>
        <DataTable
          data={filtered}
          columns={columns}
          total={logsData.total}
          page={page}
          pageSize={20}
          onPageChange={setPage}
          numberedPagination
          loading={isLoading}
          emptyTitle="No audit logs"
          emptyMessage="No logs found"
          stickyHeader
        />
      </Card>
      <AuditLogDetailsModal log={selectedLog} onClose={() => setSelectedLog(null)} />
    </Box>
  );
}
