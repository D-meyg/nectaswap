import { Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Text";
import { Row } from "@/components/ui/Row";
import { Stack } from "@/components/ui/Stack";
import { cn } from "@/lib/utils";

interface UserLike {
  id?: string | number;
  user_id?: string | number;
  name?: string;
  full_name?: string;
  email?: string;
  status?: string;
  last_active?: string;
  lastActive?: string;
}

interface UserHeaderProps {
  user: UserLike;
  onFreeze?: () => void;
  freezeLoading?: boolean;
  className?: string;
}

function UserStatus({ status }: { status?: string }) {
  const value = status || "Active";

  const isFrozen = value.toLowerCase() === "frozen";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm px-1.5 py-0.5 font-geom text-[10.5px] font-semibold uppercase leading-none",
        isFrozen
          ? "bg-(--color-danger-subtle) text-(--color-danger)"
          : "bg-(--color-success-bg) text-(--color-success-dark)"
      )}
    >
      {value}
    </span>
  );
}

export function UserHeader({
  user,
  onFreeze,
  freezeLoading,
  className,
}: UserHeaderProps) {
  const name = user.name || user.full_name || "Unknown User";
  const email = user.email || "unknown@email.com";
  const id = user.id || user.user_id || "1";
  const lastActive = user.last_active || user.lastActive || "N/A";
  const isFrozen = user.status?.toLowerCase() === "frozen";

  return (
    <section className={cn("mb-3", className)}>
      <Row
        align="start"
        justify="between"
        gap={3}
        className="flex-col sm:flex-row"
      >
        <Stack gap={1} className="min-w-0">
          <Row align="center" gap={2} className="min-w-0">
            <Text
              as="h2"
              variant="heading"
              color="primary"
              weight="semibold"
              truncate
              className="text-[1.375rem] leading-7"
            >
              {name}
            </Text>

            <UserStatus status={user.status} />

            <Text
              variant="caption"
              color="secondary"
              weight="medium"
              as="span"
              className="ml-0.5 text-[0.6875rem]"
            >
              ID: {id}
            </Text>
          </Row>

          <Row align="center" gap={2}>
            <Text variant="caption" color="secondary" as="span" className="text-[0.6875rem]">
              {email}
            </Text>

            <span className="h-1 w-1 rounded-full bg-(--color-border-02)" />

            <Text variant="caption" color="secondary" as="span" className="text-[0.6875rem]">
              Last active: {lastActive}
            </Text>
          </Row>
        </Stack>

        <Row align="center" gap={2} className="w-full sm:mt-1 sm:w-auto">
          <Button
            variant="secondary"
            size="md"
            className="h-8 w-full px-3 text-[0.6875rem] sm:w-auto"
          >
            <Mail size={14} />
            Send Message
          </Button>

          <Button
            variant={isFrozen ? "primary" : "danger"}
            size="md"
            loading={freezeLoading}
            onClick={onFreeze}
            className="h-8 w-full px-3 text-[0.6875rem] sm:w-auto"
          >
            <Lock size={14} />
            {isFrozen ? "Unfreeze Account" : "Freeze Account"}
          </Button>
        </Row>
      </Row>
    </section>
  );
}
