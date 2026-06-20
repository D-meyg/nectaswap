import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { Row } from "@/components/ui/Row";
import { Stack } from "@/components/ui/Stack";

interface RiskIndicatorsPanelProps {
  velocityCheck?: string | boolean | null;
  amlScreening?: string | boolean | null;
}

function normalize(
  value: string | boolean | null | undefined,
  fallback: string,
) {
  if (typeof value === "boolean") return value ? fallback : "Review";
  return value || fallback;
}

function RiskRow({ label, value }: { label: string; value: string }) {
  const isPass =
    value.toLowerCase().includes("pass") ||
    value.toLowerCase().includes("clear");

  return (
    <Row
      justify="between"
      align="center"
      className="h-[30px] rounded-(--radius-sm) border border-(--color-border) bg-(--color-bg-card) px-3"
    >
      <Text variant="caption" color="secondary" weight="medium" className="text-[11px]">
        {label}
      </Text>

      <Text
        variant="caption"
        color={isPass ? "success" : "warning"}
        weight="semibold"
        className="text-[10px]"
      >
        {value}
      </Text>
    </Row>
  );
}

export function RiskIndicatorsPanel({
  velocityCheck,
  amlScreening,
}: RiskIndicatorsPanelProps) {
  return (
    <Card className="rounded-[8px] shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
      <Card.Header
        title="Risk Indicators"
        className="border-b-0 px-4 pb-2 pt-3 [&_h4]:text-[12px] [&_h4]:leading-4"
      />

      <Card.Body className="px-4 pb-4 pt-0">
        <Stack gap={2}>
          <RiskRow
            label="Velocity Check"
            value={normalize(velocityCheck, "Pass")}
          />
          <RiskRow
            label="AML Screening"
            value={normalize(amlScreening, "Clear")}
          />
        </Stack>
      </Card.Body>
    </Card>
  );
}
