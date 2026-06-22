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
    <Card className="rounded-lg shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
      <Card.Header
        title="Referral Actions"
        className="border-b-0 px-4 pb-2 pt-3 [&_h4]:text-xs [&_h4]:leading-4"
      />
      <Card.Body className="px-4 pb-4 pt-0">
        <Stack gap={2}>
          <Button
            size="md"
            onClick={onPayout}
            className="h-8 w-full justify-center text-[0.6875rem]"
          >
            Payout Earnings
          </Button>
          <Button
            variant="secondary"
            size="md"
            onClick={onViewAll}
            className="h-8 w-full justify-center text-[0.6875rem]"
          >
            View All Referrals
          </Button>
        </Stack>
      </Card.Body>
    </Card>
  );
}
