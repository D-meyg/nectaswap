import { usePageTitle } from "@/layouts/AppLayout";
import { useMemo, useState } from "react";
import { Plus, Eye, Copy, RotateCcw, Trash2, Info } from "lucide-react";

import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { Row } from "@/components/ui/Row";
import { Stack } from "@/components/ui/Stack";
import { Box } from "@/components/ui/Box";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Tooltip } from "@/components/ui/Tooltip";
import { DataTable } from "@/components/tables/DataTable";
import { useClipboard } from "@/hooks/ui/useClipboard";
import { useApiKeys } from "@/hooks/queries/useSettings";
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
  Read: "bg-(--color-success-subtle) text-(--color-success-mid) border border-(--color-success-muted)",
  Write:
    "bg-(--color-brand)/10 text-(--color-brand) border border-(--color-brand)/20",
  Delete:
    "bg-(--color-danger-subtle) text-(--color-danger) border border-(--color-danger-muted)",
};

function MaskedKey({ value }: { value: string }) {
  const { copy } = useClipboard();
  return (
    <Row gap={2} align="center">
      <Text
        variant="micro"
        color="secondary"
        className="font-mono truncate max-w-[12.5rem]"
      >
        {value}
      </Text>
      <button className="text-(--color-text-muted) hover:text-(--color-text-primary)">
        <Eye size={12} />
      </button>
      <button
        onClick={() => copy(value)}
        className="text-(--color-text-muted) hover:text-(--color-text-primary)"
      >
        <Copy size={12} />
      </button>
    </Row>
  );
}

function GenerateKeyModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Modal open={open} onClose={onClose} size="md" className="max-w-[27rem]">
      <Modal.Header
        title="Generate New API Key"
        onClose={onClose}
        className="border-b-0 px-5 pb-2 pt-5 [&_h4]:text-[1rem] [&_h4]:leading-5"
      />
      <Modal.Body className="px-5 pb-3 pt-0">
        <Stack gap={4}>
          <Stack gap={1}>
            <Text variant="caption" color="secondary" className="text-[0.6875rem] leading-4">
              Key Name
            </Text>
            <input
              className="h-9 w-full rounded-(--radius-sm) border border-(--color-border) px-3 font-geom text-[0.75rem] outline-none transition-colors placeholder:text-(--color-text-tertiary) focus:border-(--color-brand)"
              placeholder="e.g., Production API Key"
            />
          </Stack>

          <Stack gap={1}>
            <Text variant="caption" color="secondary" className="text-[0.6875rem] leading-4">
              Service
            </Text>
            <input className="h-9 w-full rounded-(--radius-sm) border border-(--color-border) px-3 font-geom text-[0.75rem] outline-none transition-colors focus:border-(--color-brand)" />
          </Stack>

          <Stack gap={2}>
            <Text variant="caption" color="secondary" className="text-[0.6875rem] leading-4">
              Permissions
            </Text>
            {["Read", "Write", "Delete"].map((permission) => (
              <label
                key={permission}
                className="flex w-fit items-center gap-2 font-geom text-[0.75rem] font-medium text-(--color-text-primary)"
              >
                <input
                  type="checkbox"
                  className="h-3.5 w-3.5 rounded border-(--color-border) accent-(--color-brand)"
                />
                {permission}
              </label>
            ))}
          </Stack>
        </Stack>
      </Modal.Body>
      <Modal.Footer className="grid grid-cols-2 gap-3 border-t-0 bg-white px-5 pb-5 pt-2">
        <Button variant="secondary" size="sm" className="h-9 justify-center text-[0.75rem]" onClick={onClose}>
          Cancel
        </Button>
        <Button size="sm" className="h-9 justify-center text-[0.75rem]" onClick={onClose}>
          Generate Key
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default function APIKeysPage() {
  usePageTitle(
    "API Keys",
    "Manage API keys and integrations for external services",
  );

  const { data: apiKeys = [], isLoading } = useApiKeys();
  const [generateOpen, setGenerateOpen] = useState(false);
  const keys = apiKeys.length ? (apiKeys as APIKey[]) : API_KEYS;

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
                  "inline-flex items-center px-1.5 py-0.5 rounded text-[0.6875rem] font-medium",
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
                  className="text-(--color-text-muted)"
                />
              </Button>
            </Tooltip>
            <Tooltip content="Delete" side="top">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 flex items-center justify-center"
              >
                <Trash2 size={13} className="text-(--color-danger)" />
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
          className="px-5 py-4 border-b border-(--color-border)"
        >
          <Text variant="caption" color="secondary">
            Manage API keys for external integrations and services
          </Text>
          <Button size="sm" onClick={() => setGenerateOpen(true)}>
            <Plus size={13} />
            Generate New Key
          </Button>
        </Row>
        <DataTable
          data={keys}
          columns={columns}
          loading={isLoading}
          emptyTitle="No API keys"
          emptyMessage="No API keys generated yet"
        />
      </Card>

      {/* Security best practices banner */}
      <Box className="rounded-(--radius-md) border border-(--color-warning-border) bg-(--color-warning-subtle) px-5 py-4">
        <Row gap={2} align="start" className="mb-2">
          <Info
            size={14}
            className="text-(--color-warning-dark) shrink-0 mt-0.5"
          />
          <Text
            variant="caption"
            className="text-(--color-warning-dark)"
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
            className="text-(--color-warning-dark) block ml-6"
          >
            • {tip}
          </Text>
        ))}
      </Box>

      <GenerateKeyModal open={generateOpen} onClose={() => setGenerateOpen(false)} />
    </Box>
  );
}
