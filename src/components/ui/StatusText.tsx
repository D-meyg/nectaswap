import { cn } from "@/lib/utils";

interface StatusTextProps {
  status: string;
  className?: string;
}

const successStatuses = [
  "active",
  "approved",
  "completed",
  "success",
  "healthy",
  "secure",
  "operational",
];

const warningStatuses = [
  "pending",
  "review",
  "warning",
  "low",
  "degraded",
  "frozen",
];

const dangerStatuses = [
  "failed",
  "blocked",
  "rejected",
  "suspended",
  "critical",
  "danger",
];

export function StatusText({ status, className }: StatusTextProps) {
  const value = status.toLowerCase();

  const color = successStatuses.includes(value)
    ? "text-(--color-success-mid)"
    : warningStatuses.includes(value)
      ? "text-(--color-warning-dark)"
      : dangerStatuses.includes(value)
        ? "text-(--color-danger)"
        : "text-(--color-text-secondary)";

  return (
    <span
      className={cn(
        "font-geom text-[13px] font-semibold tracking-wide uppercase leading-none",
        color,
        className,
      )}
    >
      {status}
    </span>
  );
}
