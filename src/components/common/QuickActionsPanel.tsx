import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Stack } from "@/components/ui/Stack";

interface QuickActionsPanelProps {
  onAdjustLimits?: () => void;
  onFreezeCards?: () => void;
  primaryLabel?: string;
  dangerLabel?: string;
}

export function QuickActionsPanel({
  onAdjustLimits,
  onFreezeCards,
  primaryLabel = "Adjust Limits",
  dangerLabel = "Freeze All Cards",
}: QuickActionsPanelProps) {
  return (
    <Card className="rounded-[8px] shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
      <Card.Header title="Quick Actions" className="border-b-0 pb-3" />

      <Card.Body className="px-5 pb-5 pt-0">
        <Stack gap={2.5}>
          <Button
            variant="secondary"
            size="md"
            onClick={onAdjustLimits}
            className="h-[40px] w-full justify-center text-[13.5px]"
          >
            {primaryLabel}
          </Button>

          <Button
            variant="danger"
            size="md"
            onClick={onFreezeCards}
            className="h-[40px] w-full justify-center text-[13.5px]"
          >
            {dangerLabel}
          </Button>
        </Stack>
      </Card.Body>
    </Card>
  );
}
