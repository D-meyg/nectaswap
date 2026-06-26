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
      className="py-4 border-b border-(--color-border) last:border-0"
    >
      <Row align="center" gap={4}>
        <Box className="flex h-10 w-10 shrink-0 items-center justify-center rounded-(--radius-md) bg-(--color-bg-subtle)">
          <FileText size={18} className="text-(--color-text-secondary)" />
        </Box>
        <Stack gap={0.5}>
          <Text
            variant="caption"
            color="primary"
            weight="semibold"
            className="text-[13.5px]"
          >
            {doc.type}
          </Text>
          <Text variant="micro" color="tertiary">
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
          "inline-flex items-center rounded-sm px-2.5 py-1 font-geom text-[11.5px] font-semibold tracking-wide uppercase leading-none",
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
    <div className="relative flex gap-5">
      <div className="flex flex-col items-center">
        {/* Timeline Dot */}
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-(--color-success-bg) z-10 ring-4 ring-white">
          <CheckCircle size={14} className="text-(--color-success-dark)" />
        </div>
        {/* Connecting Line */}
        {!isLast && (
          <div className="absolute top-7 bottom-[-16px] left-[13px] w-[2px] bg-(--color-border)" />
        )}
      </div>

      <div className={cn("w-full", !isLast ? "pb-8" : "")}>
        <Stack gap={1}>
          <Text
            variant="caption"
            color="primary"
            weight="semibold"
            className="text-[13.5px] leading-none"
          >
            {event.event}
          </Text>
          <Text variant="micro" color="tertiary">
            {event.date} by{" "}
            <span className="font-medium text-(--color-text-secondary)">
              {event.by}
            </span>
          </Text>
        </Stack>
        <Text
          variant="caption"
          color="secondary"
          className="mt-2.5 block leading-relaxed"
        >
          {event.description}
        </Text>
      </div>
    </div>
  );
}

// ── Submitted documents (mock for now) ────────────────────
const MOCK_DOCS: KYCDocument[] = [
  {
    id: "1",
    type: "National ID",
    status: "approved",
    reviewed_by: "Sarah Chen",
    reviewed_at: "2024-01-15",
  },
  {
    id: "2",
    type: "Selfie",
    status: "approved",
    reviewed_by: "Sarah Chen",
    reviewed_at: "2024-01-15",
  },
  {
    id: "3",
    type: "Utility Bill",
    status: "approved",
    reviewed_by: "Sarah Chen",
    reviewed_at: "2024-01-15",
  },
];

interface KYCTabProps {
  userId: string;
}

export function KYCTab({ userId }: KYCTabProps) {
  const { data: history, isLoading } = useKYCHistory(userId);

  return (
    <Stack gap={6}>
      {/* Submitted Documents */}
      <Card className="rounded-[8px] shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
        <Card.Header
          title="Submitted Documents"
          className="border-b border-(--color-border) pb-4"
        />
        <Card.Body className="px-5 pt-0 pb-1">
          {MOCK_DOCS.map((doc) => (
            <DocRow key={doc.id} doc={doc} />
          ))}
        </Card.Body>
      </Card>

      {/* Verification History */}
      <Card className="rounded-[8px] shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
        <Card.Header
          title="Verification History"
          className="border-b border-(--color-border) pb-4"
        />
        <Card.Body className="p-6">
          {isLoading ? (
            <Stack gap={6}>
              <Skeleton className="h-[60px] w-full rounded-(--radius-md)" />
              <Skeleton className="h-[60px] w-full rounded-(--radius-md)" />
            </Stack>
          ) : !history || history.length === 0 ? (
            <EmptyState
              icon={Clock}
              title="No history yet"
              description="Verification events will appear here"
            />
          ) : (
            <div className="pt-2">
              {history.map((event, i) => (
                <TimelineEvent
                  key={event.id}
                  event={event}
                  isLast={i === history.length - 1}
                />
              ))}
            </div>
          )}
        </Card.Body>
      </Card>
    </Stack>
  );
}
