/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { Box } from "@/components/ui/Box";
import { Row } from "@/components/ui/Row";
import { Stack } from "@/components/ui/Stack";

const statusDot: Record<string, string> = {
  operational: "var(--color-success-mid)",
  degraded: "var(--color-warning)",
  down: "var(--color-danger)",
};

export function SystemHealthWidget({ items }: { items: any[] }) {
  return (
    <Card noPadding>
      <Box
        px={5}
        py={4}
        className="bg-(--color-bg-subtle) shadow-(--shadow-card) border-(--color-border-02)"
      >
        <Text variant="subtitle" color="primary" weight="semibold" as="h3">
          System Health
        </Text>
      </Box>

      <Stack gap={3} className="p-5">
        {items.map((item, index) => {
          const status = String(item.status || "operational").toLowerCase();
          const dotColor = statusDot[status] ?? "var(--color-text-muted)";

          return (
            <Row
              key={item.service || index}
              justify="between"
              align="center"
              gap={4}
              className="min-h-11 rounded-md bg-(--color-bg-subtle) shadow-(--shadow-card) border-(--color-border-02) px-4 py-3"
            >
              <Row align="center" gap={3} className="min-w-0">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: dotColor }}
                />
                <Text
                  variant="caption"
                  color="primary"
                  weight="semibold"
                  truncate
                >
                  {item.service}
                </Text>
              </Row>

              <Text
                variant="micro"
                color="secondary"
                className="shrink-0 font-medium"
              >
                {item.uptime}%
              </Text>
            </Row>
          );
        })}

        {!items.length && (
          <Box className="rounded-md border border-border bg-bg-card px-4 py-8 text-center">
            <Text variant="caption" color="secondary">
              No system health data available.
            </Text>
          </Box>
        )}
      </Stack>
    </Card>
  );
}
