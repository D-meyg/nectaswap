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
    <Card className="rounded-lg shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
      <Card.Header
        title="Quick Actions"
        className="border-b-0 px-4 pb-2 pt-3 [&_h4]:text-xs [&_h4]:leading-4"
      />

      <Card.Body className="px-4 pb-4 pt-0">
        <Stack gap={2}>
          <Button
            variant="secondary"
            size="md"
            onClick={onAdjustLimits}
            className="h-8 w-full justify-center text-[0.6875rem]"
          >
            {primaryLabel}
          </Button>

          <Button
            variant="danger"
            size="md"
            onClick={onFreezeCards}
            className="h-8 w-full justify-center text-[0.6875rem]"
          >
            {dangerLabel}
          </Button>
        </Stack>
      </Card.Body>
    </Card>
  );
}
