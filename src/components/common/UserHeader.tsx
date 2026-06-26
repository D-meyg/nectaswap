import { Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Text";
import { Row } from "@/components/ui/Row";
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
        "inline-flex items-center rounded-sm px-2.5 py-1 font-geom text-[11.5px] font-semibold tracking-wide uppercase leading-none",
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
    <section className={cn("mb-8", className)}>
      <Row
        align="start"
        justify="between"
        gap={4}
        className="flex-col sm:flex-row"
      >
        <div className="min-w-0">
          <Row align="center" gap={3} className="mb-1.5 min-w-0">
            <Text
              as="h2"
              variant="heading"
              color="primary"
              weight="semibold"
              truncate
              className="text-[28px] tracking-tight leading-[34px]"
            >
              {name}
            </Text>

            <UserStatus status={user.status} />

            <Text variant="caption" color="secondary" weight="medium" as="span" className="ml-1">
              ID: {id}
            </Text>
          </Row>

          <Row align="center" gap={3}>
            <Text variant="caption" color="secondary" as="span">
              {email}
            </Text>

            <span className="h-1.5 w-1.5 rounded-full bg-(--color-border-02)" />

            <Text variant="caption" color="secondary" as="span">
              Last active: {lastActive}
            </Text>
          </Row>
        </div>

        <Row align="center" gap={3} className="w-full sm:w-auto mt-4 sm:mt-0">
          <Button
            variant="secondary"
            size="md"
            className="h-[40px] px-4 w-full sm:w-auto"
          >
            <Mail size={16} />
            Send Message
          </Button>

          <Button
            variant={isFrozen ? "primary" : "danger"}
            size="md"
            loading={freezeLoading}
            onClick={onFreeze}
            className="h-[40px] px-4 w-full sm:w-auto"
          >
            <Lock size={16} />
            {isFrozen ? "Unfreeze Account" : "Freeze Account"}
          </Button>
        </Row>
      </Row>
    </section>
  );
}