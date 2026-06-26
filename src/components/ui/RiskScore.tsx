import { cn } from "@/lib/utils";

interface RiskScoreProps {
  score: number;
  className?: string;
}

export function RiskScore({ score, className }: RiskScoreProps) {
  const level =
    score >= 70
      ? {
          text: "High",
          bg: "bg-(--color-danger-subtle)",
          color: "text-(--color-danger)",
          border: "border-(--color-danger-muted)",
        }
      : score >= 40
        ? {
            text: "Medium",
            bg: "bg-(--color-warning-subtle)",
            color: "text-(--color-warning-dark)",
            border: "border-(--color-warning-border)",
          }
        : {
            text: "Low",
            bg: "bg-(--color-success-bg)",
            color: "text-(--color-success-mid)",
            border: "border-(--color-success-muted)",
          };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-geom text-[11px] font-semibold tracking-wide uppercase leading-none",
        level.bg,
        level.color,
        level.border,
        className,
      )}
    >
      <span className="text-[12px] tabular-nums font-bold">{score}</span>
      <span className="w-[1px] h-3 bg-current opacity-30" />
      {level.text}
    </span>
  );
}
