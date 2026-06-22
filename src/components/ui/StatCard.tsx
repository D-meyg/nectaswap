import { memo, type ReactNode } from "react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Text } from "@/components/ui/Text";

export interface StatCardProps {
  label: string;
  value: string | number;
  delta?: number;
  deltaLabel?: string;
  icon?: ReactNode;
  status?: "success" | "warning" | "danger" | "info";
  loading?: boolean;
  className?: string;
}

const statusColor: Record<NonNullable<StatCardProps["status"]>, string> = {
  success: "text-(--color-success-mid) bg-(--color-success-subtle)",
  warning: "text-(--color-warning-dark) bg-(--color-warning-subtle)",
  danger: "text-(--color-danger-dark) bg-(--color-danger-subtle)",
  info: "text-(--color-brand) bg-[rgba(78,43,204,0.08)]",
};

export const StatCard = memo(function StatCard({
  label,
  value,
  delta,
  deltaLabel,
  icon,
  status,
  loading,
  className,
}: StatCardProps) {
  if (loading) {
    return (
      <div
        className={cn(
          "min-h-[7.25rem] rounded-lg border border-(--color-border) bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)]",
          className,
        )}
      >
        <div className="mb-4 h-4 w-28 animate-pulse rounded bg-(--color-border)" />
        <div className="h-8 w-32 animate-pulse rounded bg-(--color-border)" />
      </div>
    );
  }

  const isPositive = delta !== undefined && delta >= 0;
  const isNegative = delta !== undefined && delta < 0;

  return (
    <div
      className={cn(
        "flex min-h-[7.25rem] flex-col justify-between rounded-lg border border-(--color-border) bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] transition-shadow hover:shadow-[0_4px_20px_rgba(0,0,0,0.05)]",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <Text variant="caption" color="secondary" weight="medium">
          {label}
        </Text>

        {icon && (
          <span
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
              status
                ? statusColor[status]
                : "bg-(--color-bg-subtle) text-(--color-text-secondary)",
            )}
          >
            {icon}
          </span>
        )}
      </div>

      <div className="mt-1">
        <Text
          variant="display"
          color="primary"
          weight="semibold"
          className="text-[1.75rem] leading-[2.125rem] tracking-[-0.02em]"
        >
          {value}
        </Text>

        {delta !== undefined && (
          <div className="mt-2 flex items-center gap-1.5">
            {isPositive ? (
              <TrendingUp
                size={14}
                className="text-(--color-success-mid)"
              />
            ) : (
              <TrendingDown size={14} className="text-(--color-danger)" />
            )}

            <Text
              variant="caption"
              color={isPositive ? "success" : isNegative ? "danger" : "muted"}
              weight="semibold"
            >
              {isPositive ? "+" : ""}
              {delta}%
            </Text>

            {deltaLabel && (
              <Text variant="caption" color="muted">
                {deltaLabel}
              </Text>
            )}
          </div>
        )}
      </div>
    </div>
  );
});
