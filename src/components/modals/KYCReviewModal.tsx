/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { formatDate, formatDateTime } from "@/lib/date";
import {
  User,
  FileText,
  CreditCard as CardIcon,
  MapPin,
  ExternalLink,
  Mail,
  Phone,
  CalendarDays,
  Briefcase,
  RotateCcw,
  XCircle,
  CheckCircle2,
} from "lucide-react";
import type { ElementType, ReactNode } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Text } from "@/components/ui/Text";
import { Skeleton } from "@/components/ui/Skeleton";
import { useModal } from "@/hooks/ui/useModal";
import { useKYCDetail } from "@/hooks/queries/useKYC";
import {
  useReviewKYCApplication,
  useRequestResubmission,
} from "@/hooks/mutations/useKYCMutations";

export const KYC_REVIEW_MODAL_ID = "kyc-review";

function InfoRow({ label, value }: { label: string; value?: ReactNode }) {
  return (
    <div>
      <Text variant="micro" color="muted" className="mb-0.5 block text-[0.6875rem] leading-4">
        {label}
      </Text>
      <Text variant="caption" color="primary" weight="semibold" className="text-[0.8125rem] leading-4">
        {value ?? "—"}
      </Text>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: ElementType;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="mb-5 rounded-(--radius-md) border border-(--color-border) bg-(--color-bg-subtle) p-4">
      <div className="mb-4 flex items-center gap-2">
        <Icon size={14} className="text-(--color-text-secondary)" />
        <Text
          variant="label"
          color="primary"
          weight="semibold"
          className="font-geom text-[0.8125rem]"
        >
          {title}
        </Text>
      </div>
      {children}
    </section>
  );
}

/** One document tile — the View button opens the file in a new tab. */
function DocButton({
  label,
  url,
  submitted,
}: {
  label: string;
  url?: string;
  submitted?: boolean;
}) {
  const isSubmitted = Boolean(submitted && url);

  return (
    <div
      className={
        isSubmitted
          ? "flex min-h-[4.75rem] flex-1 flex-col gap-2 rounded-(--radius-sm) border border-(--color-success-muted) bg-(--color-success-bg) p-3"
          : "flex min-h-[4.75rem] flex-1 flex-col gap-2 rounded-(--radius-sm) border border-(--color-border) bg-white p-3"
      }
    >
      <div className="flex items-center gap-2">
        <FileText
          size={13}
          className={isSubmitted ? "text-(--color-success-mid)" : "text-(--color-text-muted)"}
        />
        <Text variant="caption" color="primary" weight="medium" className="text-[0.75rem]">
          {label}
        </Text>
      </div>
      {isSubmitted ? (
        <a href={url} target="_blank" rel="noreferrer" className="w-fit">
          <Button size="sm" className="h-7 w-fit px-3 text-[0.6875rem]">
            <ExternalLink size={12} />
            View
          </Button>
        </a>
      ) : (
        <Text variant="micro" color="muted">Not submitted</Text>
      )}
    </div>
  );
}

function iconValue(icon: ReactNode, value?: ReactNode) {
  if (value === null || value === undefined || value === "") return "—";
  return (
    <span className="inline-flex items-center gap-1">
      {icon}
      {value}
    </span>
  );
}

function str(value: unknown): string | undefined {
  if (typeof value === "string" && value.trim()) return value;
  if (typeof value === "number") return String(value);
  return undefined;
}

export function KYCReviewModal() {
  const { isOpen, close, props } = useModal(KYC_REVIEW_MODAL_ID);
  const [rejectReason, setRejectReason] = useState("");

  const applicationId = String(props?.kycId ?? "");
  // Queue row used as a fallback so the header isn't blank while the detail
  // request is in flight.
  const queueItem = (props?.application ?? {}) as Record<string, any>;

  const { data: detail, isLoading } = useKYCDetail(isOpen ? applicationId : "");
  const review = useReviewKYCApplication();
  const requestResubmission = useRequestResubmission();

  useEffect(() => {
    if (isOpen) setRejectReason("");
  }, [isOpen, applicationId]);

  const d = (detail ?? {}) as Record<string, any>;
  const userInfo = (d.user_information ?? {}) as Record<string, any>;
  const appDetails = (d.application_details ?? {}) as Record<string, any>;
  const identity = (d.identity_documents ?? {}) as Record<string, any>;
  const documents = (identity.documents ?? {}) as Record<string, any>;
  const address = (d.address_information ?? {}) as Record<string, any>;

  const fullName = str(userInfo.full_name) ?? str(queueItem.user) ?? "—";
  const tier = str(appDetails.tier_requested) ?? str(queueItem.type);
  const submitted =
    appDetails.submitted_date ?? queueItem.submitted_at ?? undefined;
  const priority = str(appDetails.priority) ?? "normal";

  const busy = review.isPending || requestResubmission.isPending;

  const handleApprove = () => {
    if (!applicationId) return;
    review.mutate(
      { id: applicationId, action: "approve" },
      { onSuccess: () => close() },
    );
  };

  const handleReject = () => {
    if (!applicationId || !rejectReason.trim()) return;
    review.mutate(
      {
        id: applicationId,
        action: "reject",
        rejection_reason: rejectReason.trim(),
      },
      { onSuccess: () => close() },
    );
  };

  const handleResubmission = () => {
    if (!applicationId) return;
    requestResubmission.mutate(
      { id: applicationId, reason: rejectReason.trim() || undefined },
      { onSuccess: () => close() },
    );
  };

  return (
    <Modal open={isOpen} onClose={close} size="xl" className="max-w-[46rem] rounded-[6px]">
      <Modal.Header
        title="KYC Application Review"
        subtitle="Review and verify user identity documents"
        onClose={close}
        className="px-6 py-5 [&_h4]:text-[1.375rem] [&_h4]:leading-7 [&_span]:text-[0.8125rem]"
      />

      <Modal.Body className="px-6 py-5">
        {isLoading && !detail ? (
          <div className="space-y-4">
            <Skeleton className="h-[9rem] w-full rounded-(--radius-md)" />
            <Skeleton className="h-[6rem] w-full rounded-(--radius-md)" />
            <Skeleton className="h-[10rem] w-full rounded-(--radius-md)" />
          </div>
        ) : (
          <div>
            <Section icon={User} title="User Information">
              <div className="grid grid-cols-2 gap-x-12 gap-y-4">
                <InfoRow label="Full Name" value={fullName} />
                <InfoRow
                  label="User ID"
                  value={str(userInfo.user_id) ? `#${userInfo.user_id}` : "—"}
                />
                <InfoRow
                  label="Email"
                  value={iconValue(<Mail size={12} />, str(userInfo.email))}
                />
                <InfoRow
                  label="Phone"
                  value={iconValue(<Phone size={12} />, str(userInfo.phone))}
                />
                <InfoRow
                  label="Date of Birth"
                  value={iconValue(
                    <CalendarDays size={12} />,
                    userInfo.date_of_birth ? formatDate(userInfo.date_of_birth) : undefined,
                  )}
                />
                <InfoRow
                  label="Occupation"
                  value={iconValue(<Briefcase size={12} />, str(userInfo.occupation))}
                />
              </div>
            </Section>

            <Section icon={FileText} title="Application Details">
              <div className="grid grid-cols-3 gap-x-6 gap-y-4">
                <InfoRow
                  label="Tier Requested"
                  value={
                    tier ? (
                      <span className="text-(--color-brand)">
                        {/^\d+$/.test(tier) ? `Tier ${tier}` : tier}
                      </span>
                    ) : (
                      "—"
                    )
                  }
                />
                <InfoRow
                  label="Submitted Date"
                  value={submitted ? formatDateTime(submitted) : "—"}
                />
                <div>
                  <Text
                    variant="micro"
                    color="muted"
                    uppercase
                    className="mb-1.5 block"
                  >
                    Priority
                  </Text>
                  <Badge
                    variant={priority === "high" ? "danger" : "neutral"}
                    label={priority}
                    dot={false}
                  />
                </div>
              </div>
            </Section>

            <Section icon={CardIcon} title="Identity Documents">
              <div className="grid grid-cols-2 gap-x-8 gap-y-5 mb-6">
                <InfoRow label="ID Type" value={str(identity.id_type)} />
                <InfoRow label="ID Number" value={str(identity.id_number)} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <DocButton
                  label={str(documents.id_document?.label) ?? "ID Document"}
                  url={documents.id_document?.url}
                  submitted={documents.id_document?.submitted}
                />
                <DocButton
                  label={str(documents.selfie?.label) ?? "Selfie"}
                  url={documents.selfie?.url}
                  submitted={documents.selfie?.submitted}
                />
                <DocButton
                  label={str(documents.address_proof?.label) ?? "Address Proof"}
                  url={documents.address_proof?.url}
                  submitted={documents.address_proof?.submitted}
                />
              </div>
            </Section>

            <Section icon={MapPin} title="Address Information">
              <div className="grid grid-cols-2 gap-x-8 gap-y-5">
                <InfoRow
                  label="Residential Address"
                  value={str(address.residential_address)}
                />
                <InfoRow label="Proof Type" value={str(address.proof_type)} />
                {str(address.country) && (
                  <InfoRow label="Country" value={str(address.country)} />
                )}
              </div>
            </Section>

            {/* Rejection reason — required before an application can be
                rejected, optional context for a resubmission request. */}
            <div className="rounded-(--radius-md) border border-(--color-warning-border) bg-(--color-warning-yellow-bg) p-4">
              <Text
                variant="label"
                color="primary"
                weight="semibold"
                className="mb-2 block text-[0.8125rem]"
              >
                Rejection Reason (if rejecting)
              </Text>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Provide detailed reason for rejection..."
                rows={3}
                className="w-full resize-none rounded-(--radius-sm) border border-(--color-warning-border) bg-white px-3 py-2.5 text-[0.8125rem] text-(--color-text-primary) outline-none placeholder:text-(--color-text-muted) focus:border-(--color-brand)"
              />
            </div>
          </div>
        )}
      </Modal.Body>

      <Modal.Footer className="px-6 py-4">
        <Button variant="secondary" size="sm" onClick={close} disabled={busy}>
          Cancel
        </Button>

        <Button
          variant="secondary"
          size="sm"
          onClick={handleResubmission}
          disabled={busy || !applicationId}
        >
          <RotateCcw size={13} />
          {requestResubmission.isPending ? "Requesting…" : "Request Resubmission"}
        </Button>

        <Button
          variant="danger"
          size="sm"
          onClick={handleReject}
          disabled={busy || !applicationId || !rejectReason.trim()}
          title={
            !rejectReason.trim()
              ? "Add a rejection reason first"
              : undefined
          }
        >
          <XCircle size={13} />
          Reject
        </Button>

        <Button
          size="sm"
          onClick={handleApprove}
          disabled={busy || !applicationId}
        >
          <CheckCircle2 size={13} />
          {review.isPending ? "Submitting…" : "Approve Application"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
