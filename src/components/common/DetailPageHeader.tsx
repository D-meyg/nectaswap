import { Lock, Mail, ShieldAlert, UserCheck } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Stack } from "@/components/ui/Stack";

interface QuickActionsPanelProps {
  onFreeze?: () => void;
  onMessage?: () => void;
  onVerify?: () => void;
  onFlag?: () => void;
}

export function QuickActionsPanel({
  onFreeze,
  onMessage,
  onVerify,
  onFlag,
}: QuickActionsPanelProps) {
  return (
    <Card>
      <Card.Header title="Quick Actions" />

      <Card.Body padded>
        <Stack gap={2}>
          <Button
            variant="primary"
            size="sm"
            onClick={onVerify}
            className="w-full justify-center"
          >
            <UserCheck size={13} />
            Verify User
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={onMessage}
            className="w-full justify-center"
          >
            <Mail size={13} />
            Send Message
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={onFreeze}
            className="w-full justify-center"
          >
            <Lock size={13} />
            Freeze Account
          </Button>

          <Button
            variant="danger"
            size="sm"
            onClick={onFlag}
            className="w-full justify-center"
          >
            <ShieldAlert size={13} />
            Flag Account
          </Button>
        </Stack>
      </Card.Body>
    </Card>
  );
}
