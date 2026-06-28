import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { Row } from "@/components/ui/Row";
import { Stack } from "@/components/ui/Stack";
import { Box } from "@/components/ui/Box";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Activity } from "lucide-react";
import { useUserActivity } from "@/hooks/queries/useUserDetail";

interface ActivityTabProps {
  userId: string;
}

interface NormalizedEvent {
  id: string;
  title: string;
  description: string;
  ip: string;
  device: string;
  created_at: string;
}

function str(value: unknown, fallback = "N/A") {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function normalizeEvent(item: unknown, index: number): NormalizedEvent {
  const ev = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
  const details = ev.activity_details && typeof ev.activity_details === "object"
    ? (ev.activity_details as Record<string, unknown>)
    : {};

  return {
    id: str(ev.id, `event-${index}`),
    title: str(ev.activity_type ?? ev.title ?? ev.type ?? ev.action, "Activity"),
    description: str(ev.activity_description ?? ev.description, "N/A"),
    ip: str(ev.request_ip ?? ev.ip ?? ev.ip_address, "N/A"),
    device: str(details.device_name ?? ev.device ?? ev.device_name, "N/A"),
    created_at: str(ev.activity_timestamp ?? ev.created_at ?? ev.timestamp, "N/A"),
  };
}

function ActivityEntry({ event }: { event: NormalizedEvent }) {
  return (
    <Card className="rounded-[6px] border-(--color-border) bg-white shadow-none">
      <Box px={4} py={3}>
        <Row justify="between" align="start" gap={4}>
          <Stack gap={1} className="min-w-0">
            <Text variant="caption" color="primary" weight="semibold" className="text-xs leading-4">
              {event.title}
            </Text>
            <Text variant="caption" color="secondary" className="text-[0.6875rem] leading-4">
              {event.description}
            </Text>
            <Row gap={2} align="center" className="mt-0.5 flex-wrap">
              <Text variant="micro" color="muted" className="text-[0.625rem] leading-4">
                IP: {event.ip}
              </Text>
              {event.device !== "N/A" && (
                <>
                  <Text variant="micro" color="muted" className="text-[0.625rem] leading-4">•</Text>
                  <Text variant="micro" color="muted" className="text-[0.625rem] leading-4">
                    {event.device}
                  </Text>
                </>
              )}
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

  const events: NormalizedEvent[] = Array.isArray(apiEvents)
    ? apiEvents.map(normalizeEvent)
    : [];

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
        <ActivityEntry key={event.id} event={event} />
      ))}
    </Stack>
  );
}
