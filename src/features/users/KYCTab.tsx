import { CheckCircle, FileText, Clock } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Row } from "@/components/ui/Row";
import { Stack } from "@/components/ui/Stack";
import { Box } from "@/components/ui/Box";
import { useKYCHistory } from "@/hooks/queries/useUserDetail";
import { cn } from "@/lib/utils";
import type { KYCDocument } from "@/api/types";

// ── Document row ──────────────────────────────────────────
function DocRow({ doc }: { doc: KYCDocument }) {
  const isApproved = doc.status === "approved";

  return (
    <Row
      align="center"
      justify="between"
      className="min-h-12 rounded-(--radius-sm) border border-(--color-border) bg-white px-4 py-2"
    >
      <Row align="center" gap={3}>
        <Box className="flex h-7 w-7 shrink-0 items-center justify-center rounded-(--radius-sm) bg-(--color-bg-card)">
          <FileText size={15} className="text-(--color-text-secondary)" />
        </Box>
        <Stack gap={0.5}>
          <Text
            variant="caption"
            color="primary"
            weight="semibold"
            className="text-xs leading-4"
          >
            {doc.type}
          </Text>
          <Text variant="micro" color="tertiary" className="text-[0.6875rem] leading-4">
            Reviewed by{" "}
            <span className="font-medium text-(--color-text-secondary)">
              {doc.reviewed_by}
            </span>{" "}
            on {doc.reviewed_at}
          </Text>
        </Stack>
      </Row>
      <span
        className={cn(
        "inline-flex items-center rounded-sm px-2.5 py-1 font-geom text-[0.6875rem] font-semibold leading-none",
          isApproved
            ? "bg-(--color-success-bg) text-(--color-success-dark)"
            : "bg-(--color-danger-subtle) text-(--color-danger)",
        )}
      >
        {isApproved ? "Approved" : "Rejected"}
      </span>
    </Row>
  );
}

// ── Timeline event ────────────────────────────────────────
function TimelineEvent({
  event,
  isLast,
}: {
  event: {
    id: string;
    event: string;
    date: string;
    by: string;
    description: string;
  };
  isLast: boolean;
}) {
  return (
    <div className="relative flex gap-3 rounded-(--radius-sm) border border-(--color-border) bg-white px-4 py-3">
      <div className="flex flex-col items-center">
        <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-(--color-brand)" />
        {!isLast && (
          <div className="absolute bottom-[-0.625rem] left-[1.1875rem] top-5 w-px bg-(--color-border)" />
        )}
        <div className="sr-only">
          <CheckCircle size={14} />
        </div>
      </div>

      <div className="w-full">
        <Stack gap={0}>
          <Text
            variant="caption"
            color="primary"
            weight="semibold"
            className="text-xs leading-4"
          >
            {event.event}
          </Text>
          <Text variant="micro" color="tertiary" className="text-[0.6875rem] leading-4">
            {event.date} by{" "}
            <span className="font-medium text-(--color-text-secondary)">
              {event.by}
            </span>
          </Text>
        </Stack>
        <Text
          variant="caption"
          color="secondary"
          className="block text-[0.6875rem] leading-4"
        >
          {event.description}
        </Text>
      </div>
    </div>
  );
}


interface KYCTabProps {
  userId: string;
}

export function KYCTab({ userId }: KYCTabProps) {
  const { data: rawKyc, isLoading } = useKYCHistory(userId);
  const kycData = rawKyc as any;
  const docs: KYCDocument[] = kycData?.documents ?? [];
  const historyEvents: Array<{ id: string; event: string; date: string; by: string; description: string }> =
    Array.isArray(kycData?.history) ? kycData.history :
    Array.isArray(kycData?.events) ? kycData.events :
    Array.isArray(kycData) ? kycData : [];

  return (
    <Stack gap={4}>
      <Card className="rounded-lg shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
        <Card.Header
          title="Submitted Documents"
          className="border-b-0 px-4 pb-2 pt-4 [&_h4]:text-[0.8125rem] [&_h4]:leading-4"
        />
        <Card.Body className="space-y-3 px-4 pb-4 pt-0">
          {docs.length === 0 ? (
            <Text variant="caption" color="muted">No documents submitted</Text>
          ) : docs.map((doc) => (
            <DocRow key={doc.id} doc={doc} />
          ))}
        </Card.Body>
      </Card>

      <Card className="rounded-lg shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
        <Card.Header
          title="Verification History"
          className="border-b-0 px-4 pb-2 pt-4 [&_h4]:text-[0.8125rem] [&_h4]:leading-4"
        />
        <Card.Body className="px-4 pb-4 pt-0">
          {isLoading ? (
            <Stack gap={6}>
              <Skeleton className="h-[3.75rem] w-full rounded-(--radius-md)" />
              <Skeleton className="h-[3.75rem] w-full rounded-(--radius-md)" />
            </Stack>
          ) : historyEvents.length === 0 ? (
            <EmptyState
              icon={Clock}
              title="No history yet"
              description="Verification events will appear here"
            />
          ) : (
            <div className="space-y-3">
              {historyEvents.map((event, i) => (
                <TimelineEvent
                  key={event.id ?? i}
                  event={event}
                  isLast={i === historyEvents.length - 1}
                />
              ))}
            </div>
          )}
        </Card.Body>
      </Card>
    </Stack>
  );
}
