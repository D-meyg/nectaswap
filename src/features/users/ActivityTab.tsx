import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { Row } from "@/components/ui/Row";
import { Stack } from "@/components/ui/Stack";
import { Box } from "@/components/ui/Box";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Activity } from "lucide-react";
import { useUserActivity } from "@/hooks/queries/useUserDetail";
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
}: {
  event: ActivityEvent;
}) {
  return (
    <Card className="rounded-[6px] border-(--color-border) bg-white shadow-none">
      <Box px={4} py={3}>
        <Row justify="between" align="start" gap={4}>
          <Stack gap={1} className="min-w-0">
            <Text variant="caption" color="primary" weight="semibold" className="text-xs leading-4">
              {event.title}
            </Text>
            <Text variant="caption" color="secondary" className="text-[0.6875rem] leading-4">
              {event.txn_id
                ? `${event.txn_id} - ${event.description}`
                : event.description}
            </Text>
            <Row gap={2} align="center" className="mt-0.5 flex-wrap">
              <Text variant="micro" color="muted" className="text-[0.625rem] leading-4">
                IP: {event.ip}
              </Text>
              <Text variant="micro" color="muted" className="text-[0.625rem] leading-4">
                •
              </Text>
              <Text variant="micro" color="muted" className="text-[0.625rem] leading-4">
                {event.device}
              </Text>
            </Row>
          </Stack>

          <Text variant="caption" color="secondary" className="shrink-0 text-[0.6875rem] leading-4">
            {event.created_at}
          </Text>
        </Row>
      </Box>
    </Card>
  );
}

export function ActivityTab({ userId }: ActivityTabProps) {
  const { data: apiEvents, isLoading } = useUserActivity(userId);

  const events = apiEvents ?? [];

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
    <Stack gap={2}>
      {events.map((event) => (
        <ActivityEntry
          key={event.id}
          event={event}
        />
      ))}
    </Stack>
  );
}
