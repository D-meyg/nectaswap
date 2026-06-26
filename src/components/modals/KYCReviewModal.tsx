import { useState } from "react";
import {
  User,
  FileText,
  CreditCard as CardIcon,
  MapPin,
  ExternalLink,
  Mail,
  Phone,
} from "lucide-react";
import type { ElementType, ReactNode } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Text } from "@/components/ui/Text";
import { useModal } from "@/hooks/ui/useModal";
import type { KYCSubmission } from "@/api/types";

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

function DocButton({ label, submitted = true }: { label: string; submitted?: boolean }) {
  return (
    <div
      className={
        submitted
          ? "flex min-h-[4.75rem] flex-1 flex-col gap-2 rounded-(--radius-sm) border border-(--color-success-muted) bg-(--color-success-bg) p-3"
          : "flex min-h-[4.75rem] flex-1 flex-col gap-2 rounded-(--radius-sm) border border-(--color-border) bg-white p-3"
      }
    >
      <div className="flex items-center gap-2">
        <FileText size={13} className={submitted ? "text-(--color-success-mid)" : "text-(--color-text-muted)"} />
        <Text variant="caption" color="primary" weight="medium" className="text-[0.75rem]">
          {label}
        </Text>
      </div>
      {submitted ? (
        <Button size="sm" className="h-7 w-fit px-3 text-[0.6875rem]">
          <ExternalLink size={12} />
          View
        </Button>
      ) : (
        <Text variant="micro" color="muted">Not submitted</Text>
      )}
    </div>
  );
}

function iconValue(icon: React.ReactNode, value: string) {
  return (
    <span className="inline-flex items-center gap-1">
      {icon}
      {value}
    </span>
  );
}

export function KYCReviewModal() {
  const { isOpen, close, props } = useModal(KYC_REVIEW_MODAL_ID);
  const [rejectReason, setRejectReason] = useState("");
  const [showReject, setShowReject] = useState(false);
  const application = props?.application as KYCSubmission | undefined;

  const kycData = {
    full_name: application?.user_name ?? "Unknown User",
    user_id: application?.user_id ?? String(props?.kycId ?? "N/A"),
    email: application?.user_email ?? "N/A",
    phone: "N/A",
    date_of_birth: "N/A",
    occupation: "N/A",
    tier_requested: application?.tier ?? "N/A",
    submitted_date: application?.submitted_at ?? "N/A",
    priority: application?.priority ?? "normal",
    id_type: "National ID",
    id_number: "N/A",
    residential_address: "N/A",
    proof_type: "N/A",
    documents: application?.documents ?? 0,
    total_docs: application?.total_docs ?? 0,
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
        <div>
          <Section icon={User} title="User Information">
            <div className="grid grid-cols-2 gap-x-12 gap-y-4">
              <InfoRow label="Full Name" value={kycData.full_name} />
              <InfoRow label="User ID" value={`#${kycData.user_id}`} />
              <InfoRow label="Email" value={iconValue(<Mail size={12} />, kycData.email)} />
              <InfoRow label="Phone" value={iconValue(<Phone size={12} />, kycData.phone)} />
              <InfoRow
                label="Date of Birth"
                value={kycData.date_of_birth}
              />
              <InfoRow label="Occupation" value={kycData.occupation} />
            </div>
          </Section>

          <Section icon={FileText} title="Application Details">
            <div className="grid grid-cols-3 gap-x-6 gap-y-4">
              <InfoRow
                label="Tier Requested"
                value={kycData.tier_requested}
              />
              <InfoRow
                label="Submitted Date"
                value={kycData.submitted_date}
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
                  variant={
                    kycData.priority === "high" ? "danger" : "neutral"
                  }
                  label={kycData.priority}
                  dot={false}
                />
              </div>
            </div>
          </Section>

          <Section icon={CardIcon} title="Identity Documents">
            <div className="grid grid-cols-2 gap-x-8 gap-y-5 mb-6">
              <InfoRow label="ID Type" value={kycData.id_type} />
              <InfoRow label="ID Number" value={kycData.id_number} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <DocButton label="ID Document" submitted={kycData.documents >= 1} />
              <DocButton label="Selfie" submitted={kycData.documents >= 2} />
              <DocButton label="Address Proof" submitted={kycData.documents >= 3} />
            </div>
          </Section>

          <Section icon={MapPin} title="Address Information">
            <div className="grid grid-cols-2 gap-x-8 gap-y-5">
              <InfoRow
                label="Residential Address"
                value={kycData.residential_address}
              />
              <InfoRow label="Proof Type" value={kycData.proof_type} />
            </div>
          </Section>

          {showReject && (
            <div className="rounded-xl border border-(--color-danger-muted) bg-(--color-danger-subtle) p-5 mt-6 transition-all shadow-sm">
              <Text
                variant="label"
                color="danger"
                weight="semibold"
                className="mb-2 block"
              >
                Rejection Reason
              </Text>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Provide a reason for rejection…"
                rows={3}
                className="w-full rounded-lg border border-(--color-danger-muted) bg-white px-4 py-3 text-sm outline-none resize-none focus:ring-2 focus:ring-(--color-danger-muted)"
              />
            </div>
          )}
        </div>
      </Modal.Body>

      <Modal.Footer className="px-6 py-4">
        <Button variant="secondary" size="sm" onClick={close}>
          Cancel
        </Button>
        <Button variant="secondary" size="sm" onClick={close}>
          Request Resubmission
        </Button>

        {showReject ? (
          <Button
            variant="danger"
            size="sm"
            onClick={close}
            disabled={!rejectReason.trim()}
          >
            Confirm Reject
          </Button>
        ) : (
          <Button
            variant="danger"
            size="sm"
            onClick={() => setShowReject(true)}
          >
            Reject
          </Button>
        )}

        <Button size="sm" onClick={close}>
          Approve Application
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
