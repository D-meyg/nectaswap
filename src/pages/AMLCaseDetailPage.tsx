import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ShieldAlert } from "lucide-react";

import { usePageActions, usePageTitle } from "@/layouts/AppLayout";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { Box } from "@/components/ui/Box";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

export default function AMLCaseDetailPage() {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();

  usePageTitle(id || "AML Case", "Case detail");

  usePageActions(
    useMemo(
      () => (
        <Button variant="secondary" size="sm" className="h-8 px-3 text-[0.6875rem]" onClick={() => navigate("/compliance/aml")}>
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
          { label: "Compliance", to: "/compliance/aml" },
          { label: "AML Reports", to: "/compliance/aml" },
          { label: id },
        ]}
      />
      <Card>
        <Box py={10}>
          <EmptyState
            icon={ShieldAlert}
            title="No case data"
            description="AML case details aren't available yet. This view will populate once the AML case endpoint is connected."
          />
        </Box>
      </Card>
    </Box>
  );
}
