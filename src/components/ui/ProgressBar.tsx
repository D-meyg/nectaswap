import { cn } from "@/lib/utils";
import { Text } from "./Text";

interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showValues?: boolean;
  className?: string;
}

export function ProgressBar({
  value,
  max = 100,
  label,
  showValues,
  className,
}: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  const color =
    pct >= 90
      ? "bg-[var(--color-danger)]"
      : pct >= 70
        ? "bg-[var(--color-warning)]"
        : "bg-[var(--color-brand)]";

  return (
    <div className={cn("w-full flex flex-col gap-1.5", className)}>
      {(label || showValues) && (
        <div className="flex items-center justify-between">
          {label && (
            <Text variant="micro" color="secondary" weight="medium">
              {label}
            </Text>
          )}

          {showValues && (
            <Text variant="micro" color="muted" weight="medium">
              {pct}%
            </Text>
          )}
        </div>
      )}

      <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--color-border)]">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            color,
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
