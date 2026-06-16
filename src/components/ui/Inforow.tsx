import { type ReactNode } from "react";
import { Stack } from "./Stack";
import { Text } from "./Text";

interface InfoRowProps {
  label: string;
  value?: ReactNode;
}


export function InfoRow({ label, value }: InfoRowProps) {
  return (
    <Stack gap={1}>
      <Text variant="micro" color="muted" uppercase>
        {label}
      </Text>
      {typeof value === "string" || typeof value === "number" ? (
        <Text variant="caption" color="primary" weight="medium">
          {value}
        </Text>
      ) : (
        (value ?? (
          <Text variant="caption" color="muted">
            —
          </Text>
        ))
      )}
    </Stack>
  );
}