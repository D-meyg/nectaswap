import { cn } from "@/lib/utils";

const pill = "inline-flex rounded px-2 py-0.5 text-[0.6875rem] font-semibold whitespace-nowrap";

export type RiskLevel = "High" | "Critical" | "Medium" | "Low";
export type CaseStatus = "Open" | "Escalated" | "Under Review" | "Closed" | "Flagged";

const riskTone: Record<RiskLevel, string> = {
  High: "text-(--color-danger) bg-(--color-danger-subtle)",
  Critical: "text-(--color-brand) bg-[rgba(78,43,204,0.1)]",
  Medium: "text-(--color-warning-text) bg-(--color-warning-yellow-bg)",
  Low: "text-(--color-success-mid) bg-(--color-success-subtle)",
};

const statusTone: Record<CaseStatus, string> = {
  Open: "text-[#0A85D1] bg-[rgba(10,133,209,0.1)]",
  Escalated: "text-(--color-danger) bg-(--color-danger-subtle)",
  "Under Review": "text-(--color-warning-text) bg-(--color-warning-yellow-bg)",
  Closed: "text-(--color-text-secondary) bg-(--color-bg-subtle)",
  Flagged: "text-(--color-danger) bg-(--color-danger-subtle)",
};

export function RiskPill({ level, className }: { level: RiskLevel; className?: string }) {
  return <span className={cn(pill, riskTone[level], className)}>{level}</span>;
}

export function CaseStatusPill({ status, className }: { status: CaseStatus; className?: string }) {
  return <span className={cn(pill, statusTone[status], className)}>{status}</span>;
}

// KYC level pill — KYC 1 green, KYC 2 blue, KYC 3 purple
export function KycLevelPill({ level, className }: { level: 1 | 2 | 3; className?: string }) {
  const tone =
    level === 1
      ? "text-(--color-success-mid) bg-(--color-success-subtle)"
      : level === 2
        ? "text-[#0A85D1] bg-[rgba(10,133,209,0.1)]"
        : "text-(--color-brand) bg-[rgba(78,43,204,0.1)]";
  return <span className={cn(pill, tone, className)}>KYC {level}</span>;
}

// Horizontal risk-score bar with numeric value (used in Flagged Users table)
export function RiskScoreBar({ score, className }: { score: number; className?: string }) {
  const color =
    score >= 90
      ? "bg-(--color-brand)"
      : score >= 70
        ? "bg-(--color-danger)"
        : score >= 40
          ? "bg-(--color-warning)"
          : "bg-(--color-success-mid)";
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="h-1 w-16 overflow-hidden rounded-full bg-(--color-border)">
        <div className={cn("h-full rounded-full", color)} style={{ width: `${Math.min(100, score)}%` }} />
      </div>
      <span className="font-geom text-xs font-semibold tabular-nums text-(--color-text-primary)">{score}</span>
    </div>
  );
}
