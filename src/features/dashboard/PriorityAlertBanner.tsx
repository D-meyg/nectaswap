/* eslint-disable @typescript-eslint/no-explicit-any */
import { AlertTriangle, X } from "lucide-react";
import { useState } from "react";
import { Text } from "@/components/ui/Text";

export function PriorityAlertBanner({ alerts }: { alerts: any[] }) {
  const [dismissed, setDismissed] = useState(false);

  if (!alerts.length || dismissed) return null;

  return (
    <div className="rounded-xl border border-(--color-danger-muted) bg-(--color-danger-subtle) px-5 py-4 shadow-sm mb-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <AlertTriangle
            size={18}
            className="text-(--color-danger) mt-0.5 shrink-0"
          />
          <div>
            <Text variant="caption" color="danger" weight="semibold">
              {alerts.length} High-Priority{" "}
              {alerts.length === 1 ? "Issue" : "Issues"} Require Attention
            </Text>
            <ul className="mt-2 space-y-1">
              {alerts.map((a, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-(--color-danger) shrink-0" />
                  <Text variant="micro" color="danger">
                    {a.message}
                  </Text>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-(--color-danger) hover:opacity-70 transition-opacity shrink-0"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
