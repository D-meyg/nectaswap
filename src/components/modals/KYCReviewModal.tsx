import { useState } from "react";
import {
  User,
  FileText,
  CreditCard as CardIcon,
  MapPin,
  ExternalLink,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Text } from "@/components/ui/Text";
import { useModal } from "@/hooks/ui/useModal";

export const KYC_REVIEW_MODAL_ID = "kyc-review";

function InfoRow({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <Text variant="micro" color="muted" uppercase className="mb-1 block">
        {label}
      </Text>
      <Text variant="caption" color="primary" weight="medium">
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
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-(--color-border) p-5 mb-5 bg-white shadow-sm">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-(--color-border)">
        <Icon size={18} className="text-(--color-text-muted)" />
        <Text
          variant="label"
          color="secondary"
          weight="semibold"
          className="font-geom"
        >
          {title}
        </Text>
      </div>
      {children}
    </div>
  );
}

function DocButton({ label }: { label: string }) {
  return (
    <div className="flex-1 rounded-lg border border-(--color-border) bg-(--color-bg-subtle) p-4 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <FileText size={16} className="text-(--color-brand)" />
        <Text variant="caption" color="secondary" weight="medium">
          {label}
        </Text>
      </div>
      <Button
        variant="secondary"
        size="sm"
        className="w-full justify-center text-(--color-brand) bg-white border border-(--color-border) hover:bg-(--color-bg-subtle)"
      >
        <ExternalLink size={14} className="mr-1.5" />
        View Document
      </Button>
    </div>
  );
}

export function KYCReviewModal() {
  const { isOpen, close } = useModal(KYC_REVIEW_MODAL_ID);
  const [rejectReason, setRejectReason] = useState("");
  const [showReject, setShowReject] = useState(false);

  const mockKycData = {
    full_name: "Jonathan Doe",
    user_id: "US-99482",
    email: "jonathan.doe@example.com",
    phone: "+234 800 123 4567",
    date_of_birth: "14 Aug 1990",
    occupation: "Software Engineer",
    tier_requested: "Tier 3 (Unlimited)",
    submitted_date: "Oct 24, 2023",
    priority: "high",
    id_type: "National Identity Card",
    id_number: "NIN-847294829",
    residential_address: "14 Admiralty Way, Lekki Phase 1, Lagos",
    proof_type: "Utility Bill",
  };

  return (
    <Modal open={isOpen} onClose={close} size="xl">
      <Modal.Header
        title="KYC Application Review"
        subtitle="Review and verify user identity documents"
        onClose={close}
      />

      <Modal.Body>
        <div className="py-2">
          <Section icon={User} title="User Information">
            <div className="grid grid-cols-2 gap-x-8 gap-y-5">
              <InfoRow label="Full Name" value={mockKycData.full_name} />
              <InfoRow label="User ID" value={mockKycData.user_id} />
              <InfoRow label="Email" value={mockKycData.email} />
              <InfoRow label="Phone" value={mockKycData.phone} />
              <InfoRow
                label="Date of Birth"
                value={mockKycData.date_of_birth}
              />
              <InfoRow label="Occupation" value={mockKycData.occupation} />
            </div>
          </Section>

          <Section icon={FileText} title="Application Details">
            <div className="grid grid-cols-3 gap-x-6 gap-y-4">
              <InfoRow
                label="Tier Requested"
                value={mockKycData.tier_requested}
              />
              <InfoRow
                label="Submitted Date"
                value={mockKycData.submitted_date}
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
                    mockKycData.priority === "high" ? "danger" : "neutral"
                  }
                  label={mockKycData.priority}
                  dot={false}
                />
              </div>
            </div>
          </Section>

          <Section icon={CardIcon} title="Identity Documents">
            <div className="grid grid-cols-2 gap-x-8 gap-y-5 mb-6">
              <InfoRow label="ID Type" value={mockKycData.id_type} />
              <InfoRow label="ID Number" value={mockKycData.id_number} />
            </div>
            <div className="flex gap-4">
              <DocButton label="ID Document" />
              <DocButton label="Selfie" />
              <DocButton label="Address Proof" />
            </div>
          </Section>

          <Section icon={MapPin} title="Address Information">
            <div className="grid grid-cols-2 gap-x-8 gap-y-5">
              <InfoRow
                label="Residential Address"
                value={mockKycData.residential_address}
              />
              <InfoRow label="Proof Type" value={mockKycData.proof_type} />
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
                className="w-full rounded-lg border border-(--color-danger-muted) bg-white px-4 py-3 text-[14px] outline-none resize-none focus:ring-2 focus:ring-(--color-danger-muted)"
              />
            </div>
          )}
        </div>
      </Modal.Body>

      <Modal.Footer>
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
