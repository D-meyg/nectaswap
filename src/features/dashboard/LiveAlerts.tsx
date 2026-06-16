import { memo } from "react";
import { AlertTriangle, Info, Zap } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/utils";
import type { LiveAlert } from "@/api/types";

const alertConfig = {
  danger: {
    icon: AlertTriangle,
    color: "text-[var(--color-danger)]",
    bg: "bg-[var(--color-danger-subtle)]",
  },
  warning: {
    icon: Zap,
    color: "text-[var(--color-warning)]",
    bg: "bg-[var(--color-warning-subtle)]",
  },
  info: { icon: Info, color: "text-[var(--color-info)]", bg: "bg-[#EFF6FF]" },
};

// memo: alert rows only re-render when alert data changes
const AlertRow = memo(function AlertRow({
  alert,
  isLast,
}: {
  alert: LiveAlert;
  isLast: boolean;
}) {
  const cfg = (alertConfig as Record<string, unknown>)[
    alert.type
  ] as (typeof alertConfig)[keyof typeof alertConfig];
  const Icon = cfg.icon;

  return (
    <div
      className={cn(
        "flex gap-3 px-4 py-3",
        !isLast && "border-b border-[var(--color-border)]",
      )}
    >
      <div
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-full mt-0.5",
          cfg.bg,
        )}
      >
        <Icon size={13} className={cfg.color} />
      </div>
      <div className="flex-1 min-w-0">
        <Text variant="caption" color="primary" weight="medium">
          {alert.title}
        </Text>
        <Text variant="micro" color="secondary" className="mt-0.5">
          {alert.message}
        </Text>
        <Text variant="micro" color="muted" className="mt-0.5">
          {alert.created_at}
        </Text>
      </div>
    </div>
  );
});

interface LiveAlertsProps {
  alerts: LiveAlert[];
  loading?: boolean;
}

export function LiveAlerts({ alerts, loading }: LiveAlertsProps) {
  return (
    <Card className="h-full">
      <Card.Header title="Live Alerts" subtitle="Requires attention" />
      <Card.Body>
        {loading ? (
          <div className="px-4 py-3 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : alerts.length === 0 ? (
          <EmptyState
            icon={Info}
            title="No active alerts"
            description="All systems are operating normally"
          />
        ) : (
          alerts.map((a, i) => (
            <AlertRow key={a.id} alert={a} isLast={i === alerts.length - 1} />
          ))
        )}
      </Card.Body>
    </Card>
  );
}
