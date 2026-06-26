import { usePageTitle } from "@/layouts/AppLayout";
import { useMemo } from "react";
import { Plus, Eye, Copy, RotateCcw, Trash2, Info } from "lucide-react";

import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { Row } from "@/components/ui/Row";
import { Stack } from "@/components/ui/Stack";
import { Box } from "@/components/ui/Box";
import { Button } from "@/components/ui/Button";
import { Tooltip } from "@/components/ui/Tooltip";
import { DataTable } from "@/components/tables/DataTable";
import { useClipboard } from "@/hooks/ui/useClipboard";
import type { ColumnDef } from "@tanstack/react-table";

interface APIKey {
  name: string;
  created: string;
  key: string;
  service: string;
  permissions: string[];
  usage: string;
  last_used: string;
  status: "Active" | "Revoked";
}

const API_KEYS: APIKey[] = [
  {
    name: "Production API Key",
    created: "Jan 15, 2024",
    key: "nswp_live_••••••••••••••••••••••••••••••••••••",
    service: "Main Platform",
    permissions: ["Read", "Write", "Delete"],
    usage: "45,234 calls",
    last_used: "2 hours ago",
    status: "Active",
  },
  {
    name: "Mobile App API",
    created: "Jan 20, 2024",
    key: "nswp_live_••••••••••••••••••••••••••••••••••••",
    service: "Mobile Application",
    permissions: ["Read", "Write"],
    usage: "128,456 calls",
    last_used: "5 minutes ago",
    status: "Active",
  },
  {
    name: "Webhook Service",
    created: "Feb 1, 2024",
    key: "nswp_live_••••••••••••••••••••••••••••••••••••",
    service: "Webhook Handler",
    permissions: ["Read"],
    usage: "8,923 calls",
    last_used: "1 hour ago",
    status: "Active",
  },
  {
    name: "Test Environment",
    created: "Feb 5, 2024",
    key: "nswp_test_••••••••••••••••••••••••••••••••••••",
    service: "Testing",
    permissions: ["Read", "Write"],
    usage: "234 calls",
    last_used: "3 days ago",
    status: "Active",
  },
  {
    name: "Old Integration Key",
    created: "Dec 10, 2023",
    key: "nswp_live_••••••••••••••••••••••••••••••••••••",
    service: "Legacy System",
    permissions: ["Read"],
    usage: "67,890 calls",
    last_used: "2 weeks ago",
    status: "Revoked",
  },
];

const PERM_COLORS: Record<string, string> = {
  Read: "bg-[var(--color-success-subtle)] text-[var(--color-success-mid)] border border-[var(--color-success-muted)]",
  Write:
    "bg-[var(--color-brand)]/10 text-[var(--color-brand)] border border-[var(--color-brand)]/20",
  Delete:
    "bg-[var(--color-danger-subtle)] text-[var(--color-danger)] border border-[var(--color-danger-muted)]",
};

function MaskedKey({ value }: { value: string }) {
  const { copy } = useClipboard();
  return (
    <Row gap={2} align="center">
      <Text
        variant="micro"
        color="secondary"
        className="font-mono truncate max-w-[200px]"
      >
        {value}
      </Text>
      <button className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">
        <Eye size={12} />
      </button>
      <button
        onClick={() => copy(value)}
        className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
      >
        <Copy size={12} />
      </button>
    </Row>
  );
}

export default function APIKeysPage() {
  usePageTitle(
    "API Keys",
    "Manage API keys and integrations for external services",
  );

  const columns = useMemo<ColumnDef<APIKey, unknown>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
          <Stack gap={0}>
            <Text variant="caption" color="primary" weight="semibold" as="p">
              {row.original.name}
            </Text>
            <Text variant="micro" color="muted" as="p">
              Created {row.original.created}
            </Text>
          </Stack>
        ),
      },
      {
        accessorKey: "key",
        header: "API Key",
        cell: ({ getValue }) => <MaskedKey value={getValue<string>()} />,
      },
      {
        accessorKey: "service",
        header: "Service",
        cell: ({ getValue }) => (
          <Text variant="caption" color="secondary">
            {getValue<string>()}
          </Text>
        ),
      },
      {
        accessorKey: "permissions",
        header: "Permissions",
        cell: ({ getValue }) => (
          <Row gap={1} wrap>
            {getValue<string[]>().map((p) => (
              <span
                key={p}
                className={[
                  "inline-flex items-center px-1.5 py-0.5 rounded-[3px] text-[11px] font-medium",
                  PERM_COLORS[p] ?? "",
                ].join(" ")}
              >
                {p}
              </span>
            ))}
          </Row>
        ),
      },
      {
        accessorKey: "usage",
        header: "Usage",
        cell: ({ row }) => (
          <Stack gap={0}>
            <Text variant="caption" color="primary" weight="medium" as="p">
              {row.original.usage}
            </Text>
            <Text variant="micro" color="muted" as="p">
              Last: {row.original.last_used}
            </Text>
          </Stack>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => (
          <Text
            variant="caption"
            weight="medium"
            color={getValue<string>() === "Active" ? "success" : "danger"}
          >
            {getValue<string>()}
          </Text>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: () => (
          <Row gap={1}>
            <Tooltip content="Rotate key" side="top">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 flex items-center justify-center"
              >
                <RotateCcw
                  size={13}
                  className="text-[var(--color-text-muted)]"
                />
              </Button>
            </Tooltip>
            <Tooltip content="Delete" side="top">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 flex items-center justify-center"
              >
                <Trash2 size={13} className="text-[var(--color-danger)]" />
              </Button>
            </Tooltip>
          </Row>
        ),
      },
    ],
    [],
  );

  return (
    <Box p={6} className="space-y-4">
      <Card noPadding>
        <Row
          justify="between"
          align="center"
          className="px-5 py-4 border-b border-[var(--color-border)]"
        >
          <Text variant="caption" color="secondary">
            Manage API keys for external integrations and services
          </Text>
          <Button size="sm">
            <Plus size={13} />
            Generate New Key
          </Button>
        </Row>
        <DataTable
          data={API_KEYS}
          columns={columns}
          emptyTitle="No API keys"
          emptyMessage="No API keys generated yet"
        />
      </Card>

      {/* Security best practices banner */}
      <Box className="rounded-[var(--radius-md)] border border-[var(--color-warning-border)] bg-[var(--color-warning-subtle)] px-5 py-4">
        <Row gap={2} align="start" className="mb-2">
          <Info
            size={14}
            className="text-[var(--color-warning-dark)] shrink-0 mt-0.5"
          />
          <Text
            variant="caption"
            className="text-[var(--color-warning-dark)]"
            weight="semibold"
          >
            Security Best Practices
          </Text>
        </Row>
        {[
          "Store API keys securely and never commit them to version control",
          "Rotate keys regularly and revoke unused keys immediately",
          "Use different keys for different environments (production, staging, testing)",
          "Monitor key usage for suspicious activity",
        ].map((tip, i) => (
          <Text
            key={i}
            variant="micro"
            className="text-[var(--color-warning-dark)] block ml-6"
          >
            • {tip}
          </Text>
        ))}
      </Box>
    </Box>
  );
}
