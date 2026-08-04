import { CheckCircle, FileText, Clock, ExternalLink } from "lucide-react";
import { formatDate } from "@/lib/date";
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
  const reviewedAt = doc.reviewed_at ? formatDate(doc.reviewed_at) : "";

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
            {doc.reviewed_by ? (
              <>
                Reviewed by{" "}
                <span className="font-medium text-(--color-text-secondary)">
                  {doc.reviewed_by}
                </span>
                {reviewedAt ? ` on ${reviewedAt}` : ""}
              </>
            ) : reviewedAt ? (
              `Reviewed on ${reviewedAt}`
            ) : (
              "Awaiting review"
            )}
          </Text>
        </Stack>
      </Row>
      <Row align="center" gap={2}>
        {doc.url && (
          <a
            href={doc.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 rounded-sm px-2 py-1 font-geom text-[0.6875rem] font-semibold text-(--color-brand) hover:bg-(--color-bg-subtle)"
          >
            <ExternalLink size={12} />
            View
          </a>
        )}
        <span
          className={cn(
          "inline-flex items-center rounded-sm px-2.5 py-1 font-geom text-[0.6875rem] font-semibold capitalize leading-none",
            isApproved
              ? "bg-(--color-success-bg) text-(--color-success-dark)"
              : "bg-(--color-danger-subtle) text-(--color-danger)",
          )}
        >
          {doc.status || "pending"}
        </span>
      </Row>
    </Row>
  );
}

// ── KYC status summary ────────────────────────────────────
function StatusPill({ label, ok }: { label: string; ok: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm px-2.5 py-1 font-geom text-[0.6875rem] font-semibold leading-none",
        ok
          ? "bg-(--color-success-bg) text-(--color-success-dark)"
          : "bg-(--color-bg-card) text-(--color-text-secondary)",
      )}
    >
      {label}: {ok ? "Verified" : "Not verified"}
    </span>
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

  // API shape: { kyc_level, kyc_verified, bvn_verified, nin_verified,
  //              submitted_documents[], verification_history[] }
  const docs: KYCDocument[] = (
    kycData?.submitted_documents ??
    kycData?.documents ??
    []
  ).map((doc: any, i: number) => ({
    ...doc,
    id: doc?.id ?? `${doc?.type ?? "doc"}-${i}`,
  }));

  const rawHistory: any[] = Array.isArray(kycData?.verification_history)
    ? kycData.verification_history
    : Array.isArray(kycData?.history)
      ? kycData.history
      : Array.isArray(kycData?.events)
        ? kycData.events
        : Array.isArray(kycData)
          ? kycData
          : [];

  const historyEvents = rawHistory.map((item, i) => ({
    id: String(item?.id ?? `kyc-event-${i}`),
    event:
      item?.event ??
      [item?.document_type, item?.tier != null ? `Tier ${item.tier}` : null]
        .filter(Boolean)
        .join(" • ") ??
      "Verification",
    date: formatDate(item?.reviewed_at ?? item?.submitted_at ?? item?.date),
    by: item?.by ?? item?.reviewed_by ?? "System",
    description: item?.description ?? `Status: ${item?.status ?? "pending"}`,
  }));

  const hasStatus =
    kycData &&
    typeof kycData === "object" &&
    !Array.isArray(kycData) &&
    (kycData.kyc_level != null || kycData.kyc_verified != null);

  return (
    <Stack gap={4}>
      {hasStatus && (
        <Card className="rounded-lg shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          <Card.Header
            title="Verification Status"
            className="border-b-0 px-4 pb-2 pt-4 [&_h4]:text-[0.8125rem] [&_h4]:leading-4"
          />
          <Card.Body className="px-4 pb-4 pt-0">
            <Row align="center" gap={2} className="flex-wrap">
              <span className="inline-flex items-center rounded-sm bg-(--color-bg-card) px-2.5 py-1 font-geom text-[0.6875rem] font-semibold text-(--color-text-primary)">
                KYC Level: {kycData.kyc_level ?? "—"}
              </span>
              <StatusPill label="KYC" ok={Boolean(kycData.kyc_verified)} />
              <StatusPill label="BVN" ok={Boolean(kycData.bvn_verified)} />
              <StatusPill label="NIN" ok={Boolean(kycData.nin_verified)} />
            </Row>
          </Card.Body>
        </Card>
      )}

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
