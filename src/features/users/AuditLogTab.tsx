import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { Row } from "@/components/ui/Row";
import { Stack } from "@/components/ui/Stack";
import { Box } from "@/components/ui/Box";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { ClipboardList } from "lucide-react";
import { useUserAuditLog } from "@/hooks/queries/useUserDetail";

export interface AuditEntry {
  id: string;
  action: string;
  by: string;
  description: string;
  ip: string;
  created_at: string;
}

interface AuditEntryRowProps {
  entry: AuditEntry;
}

function text(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function normalizeAuditEntry(value: unknown, index: number): AuditEntry {
  const item =
    value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  const admin =
    item.admin && typeof item.admin === "object"
      ? (item.admin as Record<string, unknown>)
      : {};

  return {
    id: text(item.id, `audit-${index}`),
    action: text(item.action ?? item.event ?? item.title, "Activity"),
    by: text(item.by ?? item.admin_name ?? item.admin ?? admin.name, "System"),
    description: text(
      item.description ?? item.target ?? item.details,
      "No details provided",
    ),
    ip: text(item.ip ?? item.ip_address, "N/A"),
    created_at: text(item.created_at ?? item.timestamp ?? item.date, "N/A"),
  };
}

function AuditEntryRow({ entry }: AuditEntryRowProps) {
  return (
    <Card className="rounded-[6px] border-(--color-border) bg-white shadow-none">
      <Box px={4} py={3}>
        <Row justify="between" align="start" gap={4}>
          <Stack gap={1} className="min-w-0">
            <Text variant="caption" color="primary" weight="semibold" className="text-xs leading-4">
              {entry.action}
            </Text>
            <Text variant="micro" color="muted" className="text-[0.625rem] leading-4">
              by {entry.by}
            </Text>
            <Text variant="caption" color="secondary" className="text-[0.6875rem] leading-4">
              {entry.description}
            </Text>
            <Text variant="micro" color="muted" className="mt-0.5 text-[0.625rem] leading-4">
              IP: {entry.ip}
            </Text>
          </Stack>

          <Text variant="caption" color="secondary" className="shrink-0 text-[0.6875rem] leading-4">
            {entry.created_at}
          </Text>
        </Row>
      </Box>
    </Card>
  );
}

interface AuditLogTabProps {
  userId?: string;
  entries?: AuditEntry[];
}

export function AuditLogTab({ userId = "", entries }: AuditLogTabProps) {
  const { data: apiEntries, isLoading } = useUserAuditLog(userId);
  const data =
    entries ?? (Array.isArray(apiEntries) ? apiEntries.map(normalizeAuditEntry) : []);

  if (isLoading && !entries) {
    return (
      <Stack gap={2}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[5.25rem] w-full rounded-[6px]" />
        ))}
      </Stack>
    );
  }

  if (!data.length) {
    return (
      <EmptyState
        icon={ClipboardList}
        title="No audit entries"
        description="Admin actions on this account will appear here"
      />
    );
  }

  return (
    <Stack gap={2}>
      {data.map((entry) => (
        <AuditEntryRow key={entry.id} entry={entry} />
      ))}
    </Stack>
  );
}
