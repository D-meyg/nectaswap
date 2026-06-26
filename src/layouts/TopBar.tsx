import { memo } from "react";
import { Bell, Search, ChevronDown, LogOut, User } from "lucide-react";
import { Text } from "@/components/ui/Text";
import { Row } from "@/components/ui/Row";
import { Stack } from "@/components/ui/Stack";
import { Box } from "@/components/ui/Box";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Dropdown } from "@/components/ui/Dropdown";
import { useAuthStore } from "@/store/authStore";
import { useCurrentPageTitle } from "./AppLayout";


export const TopBar = memo(function TopBar() {
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const { title, subtitle } = useCurrentPageTitle();
  const displayName = user?.name?.trim() || "Admin";
  const firstName = displayName.split(" ")[0] || "Admin";

  return (
    <Row
      as="header"
      justify="between"
      align="center"
      gap={4}
      className="h-16 shrink-0 px-6 bg-white border-b border-(--color-border)"
    >
      {/* Left: dynamic page title + subtitle */}
      <Stack gap={0}>
        <Text as="h1" variant="heading" color="primary" weight="semibold" className="text-2xl leading-7">
          {title}
        </Text>
        <Text as="p" variant="caption" color="tertiary" className="text-[0.6875rem] leading-4">
          {subtitle}
        </Text>
      </Stack>

      {/* Right: search + bell + user */}
      <Row gap={3} align="center">
        {/* Search */}
        <Row
          gap={2}
          align="center"
          className={[
            "w-[18.75rem] h-8 px-3",
            "rounded-(--radius-sm) border border-(--color-border)",
            "bg-(--color-bg-subtle)",
            "transition-colors focus-within:border-(--color-brand) focus-within:bg-white",
          ].join(" ")}
        >
          <Search
            size={14}
            className="text-(--color-text-muted) shrink-0"
          />
          <input
            type="text"
            placeholder="Search users, transactions, cards..."
            className="flex-1 min-w-0 bg-transparent outline-none text-[0.6875rem] text-(--color-text-primary) placeholder:text-(--color-text-muted)"
          />
        </Row>

        {/* Bell */}
        <Box className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 flex items-center justify-center"
            aria-label="Notifications"
          >
            <Bell size={16} />
          </Button>
          <span className="absolute top-[0.4375rem] right-[0.4375rem] h-[0.4375rem] w-[0.4375rem] rounded-full bg-(--color-danger) ring-[1.5px] ring-white pointer-events-none" />
        </Box>

        {/* User dropdown */}
        {user && (
          <Dropdown.Root>
            <Dropdown.Trigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="flex h-8 items-center gap-2 pl-1.5 pr-2 py-1"
              >
                <Avatar name={displayName} size="sm" />
                <Text variant="caption" color="primary" weight="medium" className="text-[0.6875rem]">
                  {firstName}
                </Text>
                <ChevronDown
                  size={12}
                  className="text-(--color-text-muted)"
                />
              </Button>
            </Dropdown.Trigger>
            <Dropdown.Content align="end" side="bottom">
              <Box
                px={3}
                py={2}
                className="border-b border-(--color-border)"
              >
                <Stack gap={0}>
                  <Text
                    variant="label"
                    color="primary"
                    weight="semibold"
                    truncate
                    as="p"
                  >
                    {displayName}
                  </Text>
                  <Text variant="micro" color="muted" truncate as="p">
                    {user.email}
                  </Text>
                </Stack>
              </Box>
              <Dropdown.Item icon={<User size={13} />}>Profile</Dropdown.Item>
              <Dropdown.Separator />
              <Dropdown.Item
                icon={<LogOut size={13} />}
                onSelect={clearAuth}
                danger
              >
                Sign out
              </Dropdown.Item>
            </Dropdown.Content>
          </Dropdown.Root>
        )}
      </Row>
    </Row>
  );
});
