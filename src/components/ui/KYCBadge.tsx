import { cn } from "@/lib/utils";

type KYCStatus = "Verified" | "Pending" | "Expired" | string;

interface KYCBadgeProps {
  status: KYCStatus;
  className?: string;
}

const styleMap: Record<string, string> = {
  Verified: "text-(--color-success-mid)",
  Pending: "text-(--color-warning-dark)",
  Expired: "text-(--color-danger)",
};

export function KYCBadge({ status, className }: KYCBadgeProps) {
  const color = styleMap[status] ?? "text-(--color-text-muted)";
  return (
    <span
      className={cn(
        "text-[0.8125rem] font-semibold tracking-wide uppercase",
        color,
        className,
      )}
    >
      {status}
    </span>
  );
}
