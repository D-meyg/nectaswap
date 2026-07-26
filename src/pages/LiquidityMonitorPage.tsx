import { usePageTitle } from "@/layouts/AppLayout";
import { Box } from "@/components/ui/Box";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Activity } from "lucide-react";

export default function LiquidityMonitorPage() {
  usePageTitle(
    "Liquidity Monitor",
    "Monitor platform reserves, settlement balances, liquidity health and operational risk",
  );

  return (
    <Box p={6}>
      <Card>
        <Box py={10}>
          <EmptyState
            icon={Activity}
            title="No liquidity data"
            description="Liquidity monitoring data isn't available yet. This view will populate once the liquidity endpoint is connected."
          />
        </Box>
      </Card>
    </Box>
  );
}
