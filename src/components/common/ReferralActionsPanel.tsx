import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Stack } from "@/components/ui/Stack";

interface ReferralActionsPanelProps {
  onPayout?: () => void;
  onViewAll?: () => void;
}

export function ReferralActionsPanel({
  onPayout,
  onViewAll,
}: ReferralActionsPanelProps) {
  return (
    <Card className="rounded-[8px] shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
      <Card.Header
        title="Referral Actions"
        className="border-b-0 px-4 pb-2 pt-3 [&_h4]:text-[12px] [&_h4]:leading-4"
      />
      <Card.Body className="px-4 pb-4 pt-0">
        <Stack gap={2}>
          <Button
            size="md"
            onClick={onPayout}
            className="h-[32px] w-full justify-center text-[11px]"
          >
            Payout Earnings
          </Button>
          <Button
            variant="secondary"
            size="md"
            onClick={onViewAll}
            className="h-[32px] w-full justify-center text-[11px]"
          >
            View All Referrals
          </Button>
        </Stack>
      </Card.Body>
    </Card>
  );
}
