import { useMemo, type ReactNode } from "react";
import { formatDate } from "@/lib/date";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ChevronRight, CreditCard } from "lucide-react";

import { usePageActions, usePageTitle } from "@/layouts/AppLayout";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { Row } from "@/components/ui/Row";
import { Stack } from "@/components/ui/Stack";
import { Box } from "@/components/ui/Box";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  CardTypePill,
  KYCStatusPill,
  ApprovalStatusPill,
} from "@/components/cards/CardRequestPills";
import { useCardRequestDetail } from "@/hooks/queries/useCardRequests";
import {
  useApproveCardRequest,
  useRejectCardRequest,
  useRequestMoreInfo,
} from "@/hooks/mutations/useCardRequestMutations";
import type { CardRequestDetail } from "@/services/cardRequestService";

const QUICK_LINKS: Array<{ label: string; to: string; brand?: boolean }> = [
  { label: "View User Profile", to: "/users", brand: true },
  { label: "Check Flagged Users", to: "/compliance/flagged" },
  { label: "AML Reports", to: "/compliance/aml" },
  { label: "Card Limits & Controls", to: "/cards/limits" },
];

// ── Defensive helpers ──
function num(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value ?? 0);
  return Number.isFinite(n) ? n : 0;
}
function str(value: unknown, fallback = ""): string {
  return typeof value === "string" && value.trim() ? value : fallback;
}
function get(obj: Record<string, unknown>, keys: string[]): unknown {
  for (const k of keys) if (obj[k] !== undefined && obj[k] !== null) return obj[k];
  return undefined;
}
function normalizeType(value: unknown): CardRequestDetail["card_type"] {
  return String(value ?? "").toLowerCase().includes("phys") ? "Physical" : "Virtual";
}
function normalizeKyc(value: unknown): CardRequestDetail["kyc_status"] {
  const v = String(value ?? "").toLowerCase();
  return v.includes("not") || v === "false" || v === "unverified" || v === "pending" ? "Not Verified" : "Verified";
}
function normalizeApproval(value: unknown): CardRequestDetail["approval_status"] {
  const v = String(value ?? "").toLowerCase();
  if (v.includes("approv")) return "Approved";
  if (v.includes("reject") || v.includes("declin")) return "Rejected";
  if (v.includes("review")) return "Under Review";
  return "Pending";
}

function normalizeDetail(raw: unknown, fallbackId: string): CardRequestDetail | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const nested = r.user && typeof r.user === "object" ? (r.user as Record<string, unknown>) : {};
  const activity = r.activity && typeof r.activity === "object" ? (r.activity as Record<string, unknown>) : {};
  return {
    id: str(get(r, ["id", "request_id", "reference"]), fallbackId),
    user_id: str(get(r, ["user_id"]) ?? get(nested, ["user_id", "id"]), ""),
    user_name: str(get(r, ["user_name", "name", "full_name"]) ?? get(nested, ["name", "full_name"]), "Unknown"),
    user_email: str(get(r, ["user_email", "email"]) ?? get(nested, ["email"]), "—"),
    card_type: normalizeType(get(r, ["card_type", "type"])),
    currency: str(get(r, ["currency", "card_currency"]), "—"),
    requested_on: str(get(r, ["requested_on", "created_at", "date"]), "—"),
    kyc_status: normalizeKyc(get(r, ["kyc_status", "kyc", "kyc_verified"])),
    approval_status: normalizeApproval(get(r, ["approval_status", "status", "review_status"])),
    assigned_admin: str(get(r, ["assigned_admin", "assigned_officer", "admin"]), "Unassigned"),
    phone: str(get(r, ["phone", "phone_number"]) ?? get(nested, ["phone", "phone_number"]), "—"),
    reason: str(get(r, ["reason", "reason_for_card", "purpose"]), "—"),
    monthly_volume: num(get(r, ["monthly_volume"]) ?? get(activity, ["monthly_volume", "volume"])),
    transactions_30d: num(get(r, ["transactions_30d", "transactions"]) ?? get(activity, ["transactions", "count"])),
  };
}

function InfoPair({ label, value }: { label: string; value: ReactNode }) {
  return (
    <Row justify="between" align="center" gap={3} className="min-w-0">
      <Text variant="caption" color="tertiary" className="shrink-0 text-[0.6875rem]">{label}</Text>
      {typeof value === "string" ? (
        <Text variant="caption" color="primary" weight="semibold" className="text-right text-[0.75rem]">{value}</Text>
      ) : value}
    </Row>
  );
}

function ApplicantDetailsCard({ request }: { request: CardRequestDetail }) {
  return (
    <Card>
      <Card.Header title="Applicant Details" className="border-b-0 px-5 pb-1 pt-4 [&_h4]:text-[0.8125rem] [&_h4]:leading-5" />
      <Card.Body className="px-5 pb-5 pt-2">
        <Row gap={3} align="center" className="mb-5">
          <Avatar name={request.user_name} size="lg" />
          <Stack gap={0} className="min-w-0">
            <Text variant="subtitle" color="primary" weight="semibold" as="p">{request.user_name}</Text>
            <Text variant="micro" color="muted" as="p">{request.user_email}</Text>
          </Stack>
        </Row>
        <div className="grid grid-cols-1 gap-x-10 gap-y-4 sm:grid-cols-2">
          <InfoPair label="Phone" value={request.phone} />
          <InfoPair label="Card Type" value={<CardTypePill type={request.card_type} />} />
          <InfoPair label="Currency" value={request.currency} />
          <InfoPair label="Requested On" value={formatDate(request.requested_on)} />
          <InfoPair label="KYC Status" value={<KYCStatusPill status={request.kyc_status} />} />
          <InfoPair label="Current Status" value={<ApprovalStatusPill status={request.approval_status} />} />
          <InfoPair label="Assigned Admin" value={request.assigned_admin} />
        </div>
      </Card.Body>
    </Card>
  );
}

function QuickLinksCard({ userId }: { userId?: string }) {
  return (
    <Card>
      <Card.Header title="QUICK LINKS" className="border-b-0 px-4 pb-1 pt-3 [&_h4]:text-[0.625rem] [&_h4]:uppercase [&_h4]:tracking-[0.06em] [&_h4]:text-(--color-text-tertiary)" />
      <Card.Body className="px-4 pb-2 pt-0">
        <Stack gap={0}>
          {QUICK_LINKS.map((link) => {
            const to =
              link.label === "View User Profile" && userId
                ? `/profile/${userId}?type=user`
                : link.to;
            return (
            <Link key={link.label} to={to} className="group flex items-center justify-between border-b border-(--color-border) py-2.5 transition-colors last:border-b-0 hover:bg-(--color-bg-subtle)">
              <Text variant="caption" color={link.brand ? "brand" : "primary"} weight={link.brand ? "semibold" : "medium"} className="text-[0.75rem]">{link.label}</Text>
              <ChevronRight size={13} className="shrink-0 text-(--color-text-muted) transition-transform group-hover:translate-x-0.5" />
            </Link>
            );
          })}
        </Stack>
      </Card.Body>
    </Card>
  );
}

function ReviewActionsCard({
  onApprove,
  onReject,
  onRequestInfo,
  busy,
}: {
  onApprove: () => void;
  onReject: () => void;
  onRequestInfo: () => void;
  busy: boolean;
}) {
  return (
    <Card>
      <Card.Header title="REVIEW ACTIONS" className="border-b-0 px-4 pb-1 pt-3 [&_h4]:text-[0.625rem] [&_h4]:uppercase [&_h4]:tracking-[0.06em] [&_h4]:text-(--color-text-tertiary)" />
      <Card.Body className="px-4 pb-4 pt-1">
        <Stack gap={2}>
          <Button size="sm" disabled={busy} onClick={onApprove} className="h-9 w-full justify-center border-(--color-success-mid) bg-(--color-success-mid) text-xs text-white hover:opacity-90">Approve Request</Button>
          <Button variant="danger" size="sm" disabled={busy} onClick={onReject} className="h-9 w-full justify-center text-xs">Reject Request</Button>
          <Button variant="secondary" size="sm" disabled={busy} onClick={onRequestInfo} className="h-9 w-full justify-center text-xs">Request More Info</Button>
        </Stack>
      </Card.Body>
    </Card>
  );
}

export default function CardRequestDetailPage() {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: raw, isLoading } = useCardRequestDetail(id);
  const request = useMemo(() => normalizeDetail(raw, id), [raw, id]);

  const approve = useApproveCardRequest();
  const reject = useRejectCardRequest();
  const requestInfo = useRequestMoreInfo();
  const busy = approve.isPending || reject.isPending || requestInfo.isPending;

  const handleApprove = () => approve.mutate(id, { onSuccess: () => navigate("/cards/requests") });
  const handleReject = () => reject.mutate(id, { onSuccess: () => navigate("/cards/requests") });
  const handleRequestInfo = () => requestInfo.mutate({ id });

  usePageTitle(
    request ? request.id : "Card Request",
    request ? `${request.user_name} · ${request.card_type} Card · ${request.currency}` : "Card request details",
  );

  usePageActions(
    useMemo(
      () =>
        request ? (
          <>
            <Button variant="secondary" size="sm" className="h-8 px-3 text-[0.6875rem]" onClick={() => navigate("/cards/requests")}>
              <ArrowLeft size={13} />
              Back
            </Button>
            <Button variant="danger" size="sm" disabled={busy} onClick={handleReject} className="h-8 px-3 text-[0.6875rem]">Reject</Button>
            <Button size="sm" disabled={busy} onClick={handleApprove} className="h-8 border-(--color-success-mid) bg-(--color-success-mid) px-3 text-[0.6875rem] text-white hover:opacity-90">Approve</Button>
          </>
        ) : (
          <Button variant="secondary" size="sm" className="h-8 px-3 text-[0.6875rem]" onClick={() => navigate("/cards/requests")}>
            <ArrowLeft size={13} />
            Back
          </Button>
        ),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [navigate, request, busy],
    ),
  );

  if (isLoading) {
    return (
      <Box p={6}>
        <Stack gap={3} className="mb-4">
          <Skeleton className="h-6 w-48 rounded-(--radius-sm)" />
          <Skeleton className="h-4 w-72 rounded-(--radius-sm)" />
        </Stack>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <Skeleton className="h-64 rounded-lg lg:col-span-2" />
          <Skeleton className="h-64 rounded-lg" />
        </div>
      </Box>
    );
  }

  if (!request) {
    return (
      <Box p={6}>
        <EmptyState icon={CreditCard} title="Card request not found" description="This request does not exist or may have been removed." />
      </Box>
    );
  }

  return (
    <Box p={6}>
      <Breadcrumbs
        items={[
          { label: "Home", to: "/" },
          { label: "Cards", to: "/cards" },
          { label: "Card Requests", to: "/cards/requests" },
          { label: request.id },
        ]}
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Stack gap={5} className="lg:col-span-2">
          <ApplicantDetailsCard request={request} />

          <Card>
            <Card.Header title="Reason for Card" className="border-b-0 px-5 pb-1 pt-4 [&_h4]:text-[0.8125rem] [&_h4]:leading-5" />
            <Card.Body className="px-5 pb-5 pt-1">
              <Text variant="caption" color="secondary" className="text-[0.75rem] leading-5">{request.reason}</Text>
            </Card.Body>
          </Card>

          <Card>
            <Card.Header title="Transaction Activity (30d)" className="border-b-0 px-5 pb-1 pt-4 [&_h4]:text-[0.8125rem] [&_h4]:leading-5" />
            <Card.Body className="px-5 pb-5 pt-2">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <Stack gap={1}>
                  <Text variant="micro" color="tertiary" as="p">Monthly Volume</Text>
                  <Text variant="title" color="primary" weight="semibold" as="p" className="text-[1.125rem] leading-6">₦ {request.monthly_volume.toLocaleString()}</Text>
                </Stack>
                <Stack gap={1}>
                  <Text variant="micro" color="tertiary" as="p">Transactions</Text>
                  <Text variant="title" color="primary" weight="semibold" as="p" className="text-[1.125rem] leading-6">{request.transactions_30d.toLocaleString()}</Text>
                </Stack>
              </div>
            </Card.Body>
          </Card>
        </Stack>

        <Stack gap={5}>
          <QuickLinksCard userId={request.user_id} />
          <ReviewActionsCard onApprove={handleApprove} onReject={handleReject} onRequestInfo={handleRequestInfo} busy={busy} />
        </Stack>
      </div>
    </Box>
  );
}
