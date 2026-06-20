import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { Row } from "@/components/ui/Row";
import { Stack } from "@/components/ui/Stack";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Activity } from "lucide-react";
import { useUserActivity } from "@/hooks/queries/useUserDetail";
import { DUMMY_ACTIVITY } from "@/lib/dummyData";
import type { ActivityEvent } from "@/api/types";

interface ActivityTabProps {
  userId: string;
}

// ── Single activity entry — matches image 8 exactly ──────
// Layout: title (bold) + timestamp top row
//         description below
//         IP • device bottom row in muted text
function ActivityEntry({
  event,
  isLast,
}: {
  event: ActivityEvent;
  isLast: boolean;
}) {
  return (
    <div
      className={[
        "px-4 py-3",
        !isLast ? "border-b border-(--color-border)" : "",
      ].join(" ")}
    >
      {/* Top row: title + timestamp */}
      <Row justify="between" align="start" gap={4}>
        <Text variant="caption" color="primary" weight="semibold" className="text-[12px] leading-4">
          {event.title}
        </Text>
        <Text variant="micro" color="muted" className="shrink-0 text-[10px] leading-4">
          {event.created_at}
        </Text>
      </Row>

      {/* Description — TXN ID or auth message */}
      <Text variant="caption" color="secondary" className="mt-0.5 block text-[11px] leading-4">
        {event.txn_id
          ? `${event.txn_id} - ${event.description}`
          : event.description}
      </Text>

      {/* IP • device — muted micro text */}
      <Row gap={1} align="center" className="mt-1">
        <Text variant="micro" color="muted" className="text-[10px] leading-4">
          IP: {event.ip}
        </Text>
        <Text variant="micro" color="muted" className="text-[10px] leading-4">
          •
        </Text>
        <Text variant="micro" color="muted" className="text-[10px] leading-4">
          {event.device}
        </Text>
      </Row>
    </div>
  );
}

export function ActivityTab({ userId }: ActivityTabProps) {
  const { data: apiEvents, isLoading } = useUserActivity(userId);

  // Fall back to dummy data while API not connected
  const events = apiEvents && apiEvents.length > 0 ? apiEvents : DUMMY_ACTIVITY;

  if (isLoading && !apiEvents) {
    return (
      <Stack gap={2}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </Stack>
    );
  }

  if (!events.length) {
    return (
      <EmptyState
        icon={Activity}
        title="No activity yet"
        description="User actions will appear here"
      />
    );
  }

  return (
    <Card noPadding>
      {events.map((event, i) => (
        <ActivityEntry
          key={event.id}
          event={event}
          isLast={i === events.length - 1}
        />
      ))}
    </Card>
  );
}
