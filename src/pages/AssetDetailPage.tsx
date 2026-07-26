import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Coins } from "lucide-react";

import { usePageActions, usePageTitle } from "@/layouts/AppLayout";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { Box } from "@/components/ui/Box";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

export default function AssetDetailPage() {
  const { symbol = "" } = useParams<{ symbol: string }>();
  const navigate = useNavigate();
  const sym = symbol.toUpperCase();

  usePageTitle(sym || "Asset", "Asset detail");

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
          { label: "Assets", to: "/wallets/liquidity" },
          { label: sym },
        ]}
      />
      <Card>
        <Box py={10}>
          <EmptyState
            icon={Coins}
            title="No asset data"
            description="Asset balances and transactions aren't available yet. This view will populate once the asset endpoint is connected."
          />
        </Box>
      </Card>
    </Box>
  );
}
