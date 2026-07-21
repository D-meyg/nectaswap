import type { CardRequestRow } from "@/lib/dummyData";

// Card type pill — "Virtual" blue, "Physical" brand purple
export function CardTypePill({ type }: { type: CardRequestRow["card_type"] }) {
  const style =
    type === "Virtual"
      ? "text-[#0A85D1] bg-[rgba(10,133,209,0.08)]"
      : "text-(--color-brand) bg-[rgba(78,43,204,0.08)]";

  return (
    <span
      className={[
        "inline-flex px-2 py-0.5 rounded-full text-xs font-medium",
        style,
      ].join(" ")}
    >
      {type}
    </span>
  );
}

// KYC status pill — "Verified" green, "Not Verified" red
export function KYCStatusPill({
  status,
}: {
  status: CardRequestRow["kyc_status"];
}) {
  const style =
    status === "Verified"
      ? "text-(--color-success-mid) bg-(--color-success-subtle)"
      : "text-(--color-danger) bg-(--color-danger-subtle)";

  return (
    <span
      className={[
        "inline-flex px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap",
        style,
      ].join(" ")}
    >
      {status}
    </span>
  );
}

// Approval status pill — Pending/Under Review amber, Approved green, Rejected red
export function ApprovalStatusPill({
  status,
}: {
  status: CardRequestRow["approval_status"];
}) {
  const styles: Record<CardRequestRow["approval_status"], string> = {
    Pending: "text-(--color-warning-text) bg-(--color-warning-yellow-bg)",
    Approved: "text-(--color-success-mid) bg-(--color-success-subtle)",
    Rejected: "text-(--color-danger) bg-(--color-danger-subtle)",
    "Under Review":
      "text-(--color-warning-text) bg-(--color-warning-yellow-bg)",
  };

  return (
    <span
      className={[
        "inline-flex px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap",
        styles[status],
      ].join(" ")}
    >
      {status}
    </span>
  );
}
