import { type ReactNode } from "react";
import { ChevronLeft } from "lucide-react";
import { Box } from "./Box";
import { Row } from "./Row";
import { Stack } from "./Stack";
import { Text } from "./Text";
import { Button } from "./Button";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  backTo?: string; // Optional: If provided, renders a back arrow
  onBack?: () => void;
}

export function PageHeader({ title, subtitle, action, backTo, onBack }: PageHeaderProps) {
  return (
    <Box pb={4} className="border-b border-(--color-border) mb-6">
      <Row justify="between" align="center">
        <Row gap={3} align="center">
          {(backTo || onBack) && (
            <Button variant="ghost" size="sm" onClick={onBack} className="px-2">
              <ChevronLeft size={18} />
            </Button>
          )}
          <Stack gap={1}>
            <Text variant="heading" color="primary" className="font-geom">
              {title}
            </Text>
            {subtitle && (
              <Text variant="caption" color="muted">
                {subtitle}
              </Text>
            )}
          </Stack>
        </Row>

        {action && <Box>{action}</Box>}
      </Row>
    </Box>
  );
}