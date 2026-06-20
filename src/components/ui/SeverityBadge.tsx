import { cn } from "@/lib/utils";

interface SeverityBadgeProps {
  severity: string;
  className?: string;
}

export function SeverityBadge({ severity, className }: SeverityBadgeProps) {
  const value = severity.toLowerCase();

  const styles =
    value === "high" || value === "critical"
      ? "bg-danger-subtle text-danger border-danger-muted"
      : value === "medium" || value === "warning"
        ? "bg-warning-subtle text-warning-dark border-warning-border"
        : "bg-success-bg text-success-mid border-success-muted";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 font-geom text-[12px] font-medium capitalize leading-[18px]",
        styles,
        className,
      )}
    >
      {severity}
    </span>
  );
}

interface ComplianceStatusTextProps {
  status: string;
  className?: string;
}

export function ComplianceStatusText({
  status,
  className,
}: ComplianceStatusTextProps) {
  const value = status.toLowerCase();

  const color =
    value === "active" || value === "resolved" || value === "cleared"
      ? "text-success-mid"
      : value === "pending" || value === "investigating"
        ? "text-warning-dark"
        : value === "blocked" || value === "rejected"
          ? "text-danger"
          : "text-text-secondary";

  return (
    <span
      className={cn(
        "font-geom text-[13px] font-medium capitalize leading-none",
        color,
        className,
      )}
    >
      {status}
    </span>
  );
}
