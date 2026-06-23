import { usePageTitle } from "@/layouts/AppLayout";
import { useMemo, useState } from "react";
import { Users, ShieldCheck, Clock, Send, CalendarClock } from "lucide-react";

import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { Row } from "@/components/ui/Row";
import { Stack } from "@/components/ui/Stack";
import { Box } from "@/components/ui/Box";
import { Button } from "@/components/ui/Button";
import { useCreateNotification, useNotifications } from "@/hooks/queries/useNotifications";

type Segment = "all" | "kyc-completed" | "kyc-pending";
type Priority = "info" | "warning" | "urgent";
type NotificationItem = {
  title: string;
  body: string;
  segment: string;
  recipients: number;
  count: number;
  sent_by: string;
  sent_at: string;
  priority: Priority;
};

// Priority tag pill — info/warning/urgent
function PriorityTag({ p }: { p: Priority }) {
  const styles: Record<Priority, string> = {
    info: "bg-(--color-brand)/10 text-(--color-brand) border border-(--color-brand)/20",
    warning:
      "bg-(--color-warning-subtle) text-(--color-warning-dark) border border-(--color-warning-border)",
    urgent:
      "bg-(--color-danger-subtle) text-(--color-danger) border border-(--color-danger-muted)",
  };
  return (
    <span
      className={[
        "inline-flex items-center px-2 py-0.5 rounded-full text-[0.6875rem] font-semibold",
        styles[p],
      ].join(" ")}
    >
      {p}
    </span>
  );
}

const RECENT_NOTIFS = [
  {
    title: "System Maintenance Scheduled",
    body: "Our platform will undergo maintenance on Feb 5th from 2AM-4AM WAT.",
    segment: "All Users",
    count: 12453,
    recipients: 12453,
    sent_by: "System",
    sent_at: "2024-02-01 10:30",
    priority: "info" as Priority,
  },
  {
    title: "Complete Your KYC Verification",
    body: "You're almost there! Complete your KYC to unlock full platform features.",
    segment: "KYC Pending",
    count: 4219,
    recipients: 4219,
    sent_by: "System",
    sent_at: "2024-01-31 14:00",
    priority: "warning" as Priority,
  },
  {
    title: "New Feature: Instant Card Funding",
    body: "You can now instantly fund your Naira card from your crypto wallet!",
    segment: "KYC Completed",
    count: 8234,
    recipients: 8234,
    sent_by: "System",
    sent_at: "2024-01-30 09:15",
    priority: "info" as Priority,
  },
] satisfies NotificationItem[];

const NOTIF_HISTORY = [
  {
    title: "System Maintenance Scheduled",
    body: "Our platform will undergo maintenance on Feb 5th from 2AM-4AM WAT.",
    segment: "All Users",
    recipients: 12453,
    sent_by: "Sarah Chen",
    sent_at: "2024-02-01 10:30",
    priority: "info" as Priority,
  },
  {
    title: "Complete Your KYC Verification",
    body: "You're almost there! Complete your KYC to unlock full platform features.",
    segment: "KYC Pending",
    recipients: 4219,
    sent_by: "James Wilson",
    sent_at: "2024-01-31 14:00",
    priority: "warning" as Priority,
  },
  {
    title: "New Feature: Instant Card Funding",
    body: "You can now instantly fund your Naira card from your crypto wallet!",
    segment: "KYC Completed",
    recipients: 8234,
    sent_by: "Maria Garcia",
    sent_at: "2024-01-30 09:15",
    priority: "info" as Priority,
  },
];

const SEGMENT_DATA = {
  all: {
    label: "All Users",
    count: 12453,
    desc: "Send to all registered users",
    icon: Users,
  },
  "kyc-completed": {
    label: "KYC Completed",
    count: 8234,
    desc: "Users with verified KYC",
    icon: ShieldCheck,
  },
  "kyc-pending": {
    label: "KYC Pending",
    count: 4219,
    desc: "Users without verified KYC",
    icon: Clock,
  },
};

function formatCount(value: unknown) {
  const count = typeof value === "number" ? value : Number(value ?? 0);
  return Number.isFinite(count) ? count.toLocaleString() : "0";
}

function stringValue(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function normalizeNotification(value: unknown): NotificationItem {
  const item =
    value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  const recipients = Number(
    item.recipients ?? item.recipient_count ?? item.count ?? 0,
  );
  const count = Number.isFinite(recipients) ? recipients : 0;

  return {
    title: stringValue(item.title ?? item.heading, "Untitled notification"),
    body: stringValue(
      item.message ?? item.body ?? item.content,
      "No message provided",
    ),
    segment: stringValue(
      item.segment ?? item.audience ?? item.target,
      "All Users",
    ),
    recipients: count,
    count,
    sent_by: stringValue(item.sent_by ?? item.created_by ?? item.admin_name, "Admin"),
    sent_at: stringValue(item.sent_at ?? item.created_at ?? item.date, "—"),
    priority: (item.priority ?? "info") as Priority,
  };
}

export default function NotificationsPage() {
  usePageTitle(
    "Notifications",
    "Send push notifications and manage bulk messaging to user segments",
  );

  const [segment, setSegment] = useState<Segment>("all");
  const [priority, setPriority] = useState<Priority>("info");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  const { data: apiNotifications = [] } = useNotifications();
  const createNotification = useCreateNotification();

  const notifications = useMemo<NotificationItem[]>(
    () =>
      apiNotifications.length
        ? apiNotifications.map(normalizeNotification)
        : NOTIF_HISTORY.map(normalizeNotification),
    [apiNotifications],
  );

  const selectedData = SEGMENT_DATA[segment];

  const handleSend = () => {
    createNotification.mutate({
      title,
      message,
      priority,
      segment,
      target_segment: segment,
    });
  };

  return (
    <Box p={6} className="space-y-5">
      <Box>
        <Text variant="heading" color="primary" as="h2">
          Send Push Notifications
        </Text>
        <Text variant="caption" color="tertiary">
          Broadcast messages to user segments across the NectaSwap platform
        </Text>
      </Box>

      {/* Main two-column layout */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Left: compose area */}
        <div className="lg:col-span-2 space-y-4">
          {/* Select Target Audience */}
          <Card>
            <Card.Header title="Select Target Audience" />
            <Card.Body padded>
              <div className="grid grid-cols-3 gap-3">
                {(
                  Object.entries(SEGMENT_DATA) as [
                    Segment,
                    (typeof SEGMENT_DATA)[Segment],
                  ][]
                ).map(([key, data]) => {
                  const Icon = data.icon;
                  const isActive = segment === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setSegment(key)}
                      className={[
                        "relative rounded-(--radius-md) border-2 p-4 text-left transition-all",
                        isActive
                          ? "border-(--color-brand) bg-[rgba(78,43,204,0.04)]"
                          : "border-(--color-border) hover:border-(--color-brand)/40",
                      ].join(" ")}
                    >
                      {isActive && (
                        <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-(--color-brand)" />
                      )}
                      <Icon
                        size={16}
                        className={
                          isActive
                            ? "text-(--color-brand)"
                            : "text-(--color-text-muted)"
                        }
                      />
                      <Text
                        variant="micro"
                        color="muted"
                        className="block mt-2"
                      >
                        {data.label}
                      </Text>
                      <Text
                        variant="heading"
                        color="primary"
                        weight="semibold"
                        as="p"
                        className="text-xl leading-tight"
                      >
                        {formatCount(data.count)}
                      </Text>
                      <Text variant="micro" color="muted">
                        {data.desc}
                      </Text>
                    </button>
                  );
                })}
              </div>
            </Card.Body>
          </Card>

          {/* Compose Notification */}
          <Card>
            <Card.Header title="Compose Notification" />
            <Card.Body padded>
              <Stack gap={4}>
                {/* Priority Level — 3-segment toggle */}
                <Box>
                  <Text
                    variant="micro"
                    color="secondary"
                    className="block mb-2"
                  >
                    Priority Level
                  </Text>
                  <div className="grid grid-cols-3 gap-2">
                    {(["info", "warning", "urgent"] as Priority[]).map((p) => (
                      <button
                        key={p}
                        onClick={() => setPriority(p)}
                        className={[
                          "rounded-(--radius-sm) py-2 text-[0.8125rem] font-medium transition-colors border capitalize",
                          priority === p
                            ? p === "info"
                              ? "bg-(--color-brand) text-white border-(--color-brand)"
                              : p === "warning"
                                ? "bg-(--color-warning) text-white border-(--color-warning)"
                                : "bg-(--color-danger)  text-white border-(--color-danger)"
                            : "bg-white border-(--color-border) text-(--color-text-secondary) hover:border-(--color-text-muted)",
                        ].join(" ")}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </Box>

                {/* Notification Title */}
                <Box>
                  <Text
                    variant="micro"
                    color="secondary"
                    className="block mb-1.5"
                  >
                    Notification Title
                  </Text>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter a clear, concise title..."
                    className="w-full rounded-(--radius-sm) border border-(--color-border) bg-white px-3 py-2.5 text-[0.8125rem] text-(--color-text-primary) placeholder:text-(--color-text-muted) outline-none focus:border-(--color-brand) transition-colors"
                  />
                </Box>

                {/* Message Content */}
                <Box>
                  <Text
                    variant="micro"
                    color="secondary"
                    className="block mb-1.5"
                  >
                    Message Content
                  </Text>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your notification message here..."
                    rows={5}
                    className="w-full rounded-(--radius-sm) border border-(--color-border) bg-white px-3 py-2.5 text-[0.8125rem] text-(--color-text-primary) placeholder:text-(--color-text-muted) outline-none focus:border-(--color-brand) resize-none transition-colors"
                  />
                  <Row justify="between" className="mt-1">
                    <Text variant="micro" color="muted">
                      {message.length} characters
                    </Text>
                    <Text variant="micro" color="muted">
                      Recommended: 50-120 characters
                    </Text>
                  </Row>
                </Box>

                {/* Delivery Schedule */}
                <Box>
                  <Text
                    variant="micro"
                    color="secondary"
                    className="block mb-2"
                  >
                    Delivery Schedule
                  </Text>
                  <Row gap={3}>
                    <Button className="flex-1 justify-center" onClick={handleSend} disabled={createNotification.isPending}>
                      {createNotification.isPending ? "Sending..." : "Send Now"}
                    </Button>
                    <Button
                      variant="secondary"
                      className="flex-1 justify-center"
                    >
                      <CalendarClock size={13} />
                      Schedule Later
                    </Button>
                  </Row>
                </Box>

                {/* Send to N Users button */}
                <Button className="w-full justify-center" onClick={handleSend} disabled={createNotification.isPending}>
                  <Send size={13} />
                  {createNotification.isPending ? "Sending..." : `Send to ${formatCount(selectedData.count)} Users`}
                </Button>
              </Stack>
            </Card.Body>
          </Card>

          {/* Notification History */}
          <Box>
            <Text variant="subtitle" color="primary" weight="semibold" as="p">
              Notification History
            </Text>
            <Text variant="micro" color="muted">
              Complete log of all sent notifications
            </Text>
          </Box>
          <Card noPadding>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-(--color-bg-subtle)">
                  <tr className="border-b border-(--color-border)">
                    {[
                      "Notification",
                      "Segment",
                      "Recipients",
                      "Sent By",
                      "Sent At",
                      "Priority",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-5 py-3 text-left whitespace-nowrap"
                      >
                        <Text variant="micro" color="muted" uppercase>
                          {h}
                        </Text>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {notifications.map((n, i) => (
                    <tr
                      key={i}
                      className="border-b border-(--color-border) last:border-0 hover:bg-(--color-bg-subtle)"
                    >
                      <td className="px-5 py-3.5">
                        <Stack gap={0}>
                          <Text
                            variant="caption"
                            color="primary"
                            weight="semibold"
                            as="p"
                          >
                            {n.title}
                          </Text>
                          <Text
                            variant="micro"
                            color="muted"
                            as="p"
                            className="max-w-60 truncate"
                          >
                            {n.body}
                          </Text>
                        </Stack>
                      </td>
                      <td className="px-5 py-3.5">
                        <Text variant="caption" color="secondary">
                          {n.segment}
                        </Text>
                      </td>
                      <td className="px-5 py-3.5">
                        <Text variant="caption" color="primary" weight="medium">
                          {formatCount(n.recipients)}
                        </Text>
                      </td>
                      <td className="px-5 py-3.5">
                        <Text variant="caption" color="secondary">
                          {n.sent_by}
                        </Text>
                      </td>
                      <td className="px-5 py-3.5">
                        <Text variant="caption" color="secondary">
                          {n.sent_at}
                        </Text>
                      </td>
                      <td className="px-5 py-3.5">
                        <PriorityTag p={n.priority} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Right: Live Preview + Recent Notifications */}
        <Stack gap={4}>
          {/* Live Preview */}
          <Card>
            <Card.Header title="Live Preview" />
            <Card.Body padded>
              <Row justify="between" align="center" className="mb-3">
                <Text variant="micro" color="muted">
                  TARGET
                </Text>
                <Text variant="micro" color="brand" weight="medium">
                  {selectedData.label}
                </Text>
              </Row>

              {/* Mock notification preview */}
              <Box className="rounded-(--radius-md) border border-(--color-border) bg-(--color-bg-subtle) p-3">
                <Row gap={2} align="start">
                  <Box className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-(--color-brand)">
                    <Text variant="micro" color="white" weight="semibold">
                      N
                    </Text>
                  </Box>
                  <Stack gap={0}>
                    <Text variant="caption" color="primary" weight="semibold">
                      {title || "Notification Title"}
                    </Text>
                    <Text variant="micro" color="secondary" className="mt-0.5">
                      {message || "Your message content will appear here..."}
                    </Text>
                    <Text variant="micro" color="muted" className="mt-1">
                      Just now
                    </Text>
                  </Stack>
                </Row>
              </Box>

              <Row gap={6} className="mt-4">
                <Stack gap={0}>
                  <Text
                    variant="heading"
                    color="primary"
                    weight="semibold"
                    as="p"
                    className="text-xl"
                  >
                    {formatCount(selectedData.count)}
                  </Text>
                  <Text variant="micro" color="muted">
                    Recipients
                  </Text>
                </Stack>
                <Stack gap={0}>
                  <Text
                    variant="heading"
                    weight="semibold"
                    className="text-xl text-(--color-success-mid)"
                    as="p"
                  >
                    {"< 1min"}
                  </Text>
                  <Text variant="micro" color="muted">
                    Delivery Time
                  </Text>
                </Stack>
              </Row>
            </Card.Body>
          </Card>

          {/* Recent Notifications */}
          <Card>
            <Card.Header title="Recent Notifications" />
            <Card.Body padded>
              <Stack gap={3}>
                {(apiNotifications.length ? notifications.slice(0, 3) : RECENT_NOTIFS).map((n, i) => (
                  <Box
                    key={i}
                    className={
                      i < (apiNotifications.length ? notifications.slice(0, 3) : RECENT_NOTIFS).length - 1
                        ? "pb-3 border-b border-(--color-border)"
                        : ""
                    }
                  >
                    <Row justify="between" align="start" gap={2}>
                      <Text
                        variant="caption"
                        color="primary"
                        weight="semibold"
                        className="flex-1"
                      >
                        {n.title}
                      </Text>
                      <PriorityTag p={n.priority} />
                    </Row>
                    <Text
                      variant="micro"
                      color="secondary"
                      className="mt-0.5 block"
                    >
                      {n.body}
                    </Text>
                    <Row justify="between" className="mt-1">
                      <Text variant="micro" color="muted">
                        {n.segment}
                      </Text>
                      <Text variant="micro" color="muted">
                        {formatCount(n.count)} sent
                      </Text>
                    </Row>
                  </Box>
                ))}
              </Stack>
            </Card.Body>
          </Card>
        </Stack>
      </div>
    </Box>
  );
}
