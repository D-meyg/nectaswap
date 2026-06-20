import { useMemo } from "react";
import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { DataTable } from "@/components/tables/DataTable";
import type { RecentActivityEntry } from "@/api/types";
import type { ColumnDef } from "@tanstack/react-table";

interface RecentActivityProps {
  entries: RecentActivityEntry[];
  loading?: boolean;
}

export function RecentActivity({ entries, loading }: RecentActivityProps) {
  const columns = useMemo<ColumnDef<RecentActivityEntry, unknown>[]>(
    () => [
      {
        accessorKey: "time",
        header: "Time",
        cell: ({ getValue }) => (
          <Text variant="micro" color="muted">
            {getValue<string>()}
          </Text>
        ),
      },
      {
        accessorKey: "admin",
        header: "Admin",
        cell: ({ getValue }) => (
          <Text variant="caption" color="primary" weight="medium">
            {getValue<string>()}
          </Text>
        ),
      },
      {
        accessorKey: "action",
        header: "Action",
        cell: ({ getValue }) => (
          <Text variant="caption" color="secondary">
            {getValue<string>()}
          </Text>
        ),
      },
      {
        accessorKey: "target",
        header: "Target",
        cell: ({ getValue }) => (
          <Text variant="caption" color="muted">
            {getValue<string>()}
          </Text>
        ),
      },
    ],
    [],
  );

  return (
    <Card noPadding className="h-full">
      <Card.Header
        title="Recent Activity"
        subtitle="Admin and system actions"
      />
      <DataTable
        data={entries}
        columns={columns}
        loading={loading}
        emptyTitle="No recent activity"
        emptyMessage=""
      />
    </Card>
  );
}
