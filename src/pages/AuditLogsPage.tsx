import { usePageTitle } from "@/layouts/AppLayout";
import { useMemo, useState } from "react";
import { Download, CheckCircle, X, AlertTriangle, Eye } from "lucide-react";

import { StatCard } from "@/components/ui/StatCard";
import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { Row } from "@/components/ui/Row";
import { Box } from "@/components/ui/Box";
import { Button } from "@/components/ui/Button";
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
}

const AUDIT_DATA: AuditLog[] = [
  {
    timestamp: "2024-01-29 14:23:15",
    admin: "Sarah Chen",
    action: "Approved KYC",
    target: "User #7834 (John Doe)",
    category: "Compliance",
    category_color: "text-(--color-brand)",
    result: "Success",
  },
  {
    timestamp: "2024-01-29 14:20:42",
    admin: "James Wilson",
    action: "Manual Credit",
    target: "₦50,000 to User #4521",
    category: "Financial",
    category_color: "text-(--color-success-mid)",
    result: "Success",
  },
  {
    timestamp: "2024-01-29 14:18:33",
    admin: "Maria Garcia",
    action: "Froze Account",
    target: "User #3029 (Suspicious Activity)",
    category: "Security",
    category_color: "text-(--color-warning-dark)",
    result: "Success",
  },
  {
    timestamp: "2024-01-29 14:15:28",
    admin: "System",
    action: "Rate Update",
    target: "BTC/NGN Rate: ₦42,100",
    category: "Financial",
    category_color: "text-(--color-success-mid)",
    result: "Success",
  },
  {
    timestamp: "2024-01-29 14:12:19",
    admin: "David Park",
    action: "Resolved Dispute",
    target: "Ticket #8821",
    category: "User Management",
    category_color: "text-(--color-text-secondary)",
    result: "Success",
  },
  {
    timestamp: "2024-01-29 14:08:45",
    admin: "Sarah Chen",
    action: "Login Attempt",
    target: "Admin Panel",
    category: "Security",
    category_color: "text-(--color-warning-dark)",
    result: "Failed",
  },
  {
    timestamp: "2024-01-29 14:05:12",
    admin: "James Wilson",
    action: "Updated User Limits",
    target: "User #2847 (Daily Limit)",
    category: "User Management",
    category_color: "text-(--color-text-secondary)",
    result: "Success",
  },
  {
    timestamp: "2024-01-29 14:02:33",
    admin: "System",
    action: "Database Backup",
    target: "Full System Backup",
    category: "System",
    category_color: "text-(--color-brand)",
    result: "Success",
  },
  {
    timestamp: "2024-01-29 13:58:22",
    admin: "Maria Garcia",
    action: "Rejected KYC",
    target: "User #5623 (Invalid Documents)",
    category: "Compliance",
    category_color: "text-(--color-brand)",
    result: "Success",
  },
  {
    timestamp: "2024-01-29 13:55:11",
    admin: "David Park",
    action: "Issued Virtual Card",
    target: "User #9012 (Card #VC-2847)",
    category: "Financial",
    category_color: "text-(--color-success-mid)",
    result: "Success",
  },
  {
    timestamp: "2024-01-29 13:50:45",
    admin: "James Wilson",
    action: "Wallet Rebalance",
    target: "BTC Hot Wallet",
    category: "Financial",
    category_color: "text-(--color-success-mid)",
    result: "Warning",
  },
  {
    timestamp: "2024-01-29 13:47:33",
    admin: "Sarah Chen",
    action: "Created Admin User",
    target: "New Admin: Lisa Anderson",
    category: "Security",
    category_color: "text-(--color-warning-dark)",
    result: "Success",
  },
  {
    timestamp: "2024-01-29 13:43:28",
    admin: "System",
    action: "API Rate Limit",
    target: "IP: 198.51.100.25",
    category: "Security",
    category_color: "text-(--color-warning-dark)",
    result: "Warning",
  },
  {
    timestamp: "2024-01-29 13:40:15",
    admin: "Maria Garcia",
    action: "Updated Compliance Rule",
    target: "AML Velocity Check",
    category: "Compliance",
    category_color: "text-(--color-brand)",
    result: "Success",
  },
  {
    timestamp: "2024-01-29 13:35:42",
    admin: "David Park",
    action: "Refunded Transaction",
    target: "Transaction #0x8h9i...0jlk",
    category: "Transaction",
    category_color: "text-(--color-text-secondary)",
    result: "Success",
  },
];

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
  const s = styles[result];
  return (
    <Row gap={1} align="center" className={s.cls}>
      {s.icon}
      <Text variant="caption" weight="medium" color="inherit">
        {result}
      </Text>
    </Row>
  );
}

export default function AuditLogsPage() {
  usePageTitle(
    "Audit Logs",
    "View complete audit trail of all admin actions and system events",
  );

  const [search, setSearch] = useState("");
  const debounced = useDebounce(search, 300);
  const { data: apiLogs = [], isLoading } = useAdminActivityLogs();
  const logs = apiLogs.length ? (apiLogs as AuditLog[]) : AUDIT_DATA;

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
            <Avatar name={getValue<string>()} size="sm" />
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
        cell: () => (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 flex items-center justify-center"
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
    </Box>
  );
}
