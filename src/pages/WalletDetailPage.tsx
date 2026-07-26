import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Wallet } from "lucide-react";

import { usePageActions, usePageTitle } from "@/layouts/AppLayout";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { Box } from "@/components/ui/Box";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

const WALLET_LABELS: Record<string, string> = {
  hot: "Hot Wallet",
  cold: "Cold Wallet",
  settlement: "Settlement Wallet",
  reserve: "Reserve Wallet",
};

export default function WalletDetailPage() {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const label = WALLET_LABELS[id] ?? "Wallet";

  usePageTitle(label, "Wallet detail");

  usePageActions(
    useMemo(
      () => (
        <Button variant="secondary" size="sm" className="h-8 px-3 text-[0.6875rem]" onClick={() => navigate("/wallets/liquidity")}>
          <ArrowLeft size={13} />
          Back
        </Button>
      ),
      [navigate],
    ),
  );

  return (
    <Box p={6}>
      <Breadcrumbs
        items={[
          { label: "Home", to: "/" },
          { label: "Wallets", to: "/wallets" },
          { label },
        ]}
      />
      <Card>
        <Box py={10}>
          <EmptyState
            icon={Wallet}
            title="No wallet data"
            description="Wallet balances, holdings and settlements aren't available yet. This view will populate once the wallet endpoint is connected."
          />
        </Box>
      </Card>
    </Box>
  );
}
