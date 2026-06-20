import { memo, useMemo, useState, type ElementType } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  ArrowLeftRight,
  Wallet,
  ShieldCheck,
  TrendingUp,
  Settings,
  Bell,
  Lock,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  CreditCard,
  BarChart2,
  Gift,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import { Tooltip } from "@/components/ui/Tooltip";
import { Text } from "@/components/ui/Text";
import { Box } from "@/components/ui/Box";
import { Row } from "@/components/ui/Row";
import { Stack } from "@/components/ui/Stack";
import { useUIStore } from "@/store/uiStore";
import { useAuthStore } from "@/store/authStore";
import { NectaLogo } from "@/assets/icons/NectaLogo";

interface NavChild {
  label: string;
  path: string;
}

interface NavItem {
  label: string;
  icon: ElementType;
  path?: string;
  children?: NavChild[];
}

const NAV_MAIN: NavItem[] = [
  { label: "Control Room", icon: LayoutDashboard, path: "/" },
  {
    label: "User Management",
    icon: Users,
    children: [
      { label: "All Users", path: "/users" },
      { label: "KYC Verification", path: "/kyc" },
      { label: "User Activity", path: "/users/activity" },
    ],
  },
  {
    label: "Transactions",
    icon: ArrowLeftRight,
    children: [
      { label: "All Transactions", path: "/transactions" },
      { label: "Pending Approvals", path: "/transactions/pending" },
      { label: "Failed Transactions", path: "/transactions/failed" },
    ],
  },
  { label: "Card Management", icon: CreditCard, path: "/cards" },
  { label: "Wallets & Liquidity", icon: Wallet, path: "/wallets" },
  {
    label: "Compliance & Risk",
    icon: ShieldCheck,
    children: [
      { label: "Risk Overview", path: "/compliance" },
      { label: "Flagged Users", path: "/compliance/flagged" },
      { label: "AML Reports", path: "/compliance/aml" },
    ],
  },
  { label: "Rates & Fees", icon: TrendingUp, path: "/rates" },
  {
    label: "Referral Program",
    icon: Gift,
    children: [
      { label: "All Referrals", path: "/referrals" },
      { label: "Payouts", path: "/referrals/payouts" },
    ],
  },
  {
    label: "Analytics",
    icon: BarChart2,
    children: [
      { label: "Overview", path: "/analytics" },
      { label: "Revenue", path: "/analytics/revenue" },
      { label: "User Growth", path: "/analytics/growth" },
    ],
  },
];

const NAV_SYSTEM: NavItem[] = [
  {
    label: "Settings",
    icon: Settings,
    children: [
      { label: "General Settings", path: "/settings" },
      { label: "Admin Users", path: "/settings/admins" },
      { label: "API Keys", path: "/settings/api-keys" },
      { label: "Audit Logs", path: "/settings/audit-logs" },
    ],
  },
  { label: "Notifications", icon: Bell, path: "/notifications" },
  { label: "Security", icon: Lock, path: "/security" },
];

const SIDEBAR_WIDTH = "w-[200px]";
const COLLAPSED_WIDTH = "w-[72px]";

function isRouteMatch(pathname: string, path: string) {
  if (path === "/") return pathname === "/";
  return pathname === path || pathname.startsWith(`${path}/`);
}

function getActiveChildPath(pathname: string, children: NavChild[]) {
  return children
    .filter((child) => isRouteMatch(pathname, child.path))
    .sort((a, b) => b.path.length - a.path.length)[0]?.path;
}

const SubItem = memo(function SubItem({
  label,
  path,
  active,
}: NavChild & { active: boolean }) {
  return (
    <NavLink
      to={path}
      className={cn(
        "flex h-[28px] items-center rounded-(--radius-sm) px-3 ml-5 transition-colors duration-200 outline-none",
        active
          ? "bg-(--color-brand)/10 text-(--color-brand)"
          : "text-(--color-text-secondary) hover:bg-(--color-bg-subtle) hover:text-(--color-text-primary)",
      )}
    >
      <Row align="center" gap={3} className="w-full min-w-0">
        <Box
          className={cn(
            "h-1.5 w-1.5 shrink-0 rounded-full transition-colors",
            active ? "bg-(--color-brand) shadow-sm" : "bg-(--color-text-muted)",
          )}
        />
        <Text
          variant="label"
          weight={active ? "semibold" : "medium"}
          color="inherit"
          className="truncate text-[11px] leading-4"
        >
          {label}
        </Text>
      </Row>
    </NavLink>
  );
});

const NavGroup = memo(function NavGroup({
  item,
  collapsed,
}: {
  item: NavItem & { children: NavChild[] };
  collapsed: boolean;
}) {
  const { pathname } = useLocation();

  const activeChildPath = useMemo(
    () => getActiveChildPath(pathname, item.children),
    [pathname, item.children],
  );

  const isGroupActive = Boolean(activeChildPath);
  const [manualExpanded, setManualExpanded] = useState(false);
  const expanded = isGroupActive || manualExpanded;

  const Icon = item.icon;

  const trigger = (
    <button
      type="button"
      onClick={() => {
        if (!collapsed) setManualExpanded((value) => !value);
      }}
      className={cn(
        "flex w-full items-center justify-between rounded-(--radius-sm) py-2 transition-colors outline-none h-[32px]",
        isGroupActive
          ? "bg-(--color-brand) text-white shadow-[0_2px_4px_rgba(78,43,204,0.12)]"
          : "text-(--color-text-secondary) hover:bg-(--color-bg-subtle) hover:text-(--color-text-primary)",
        collapsed ? "px-0" : "px-2.5",
      )}
    >
      <Row
        align="center"
        justify={collapsed ? "center" : "start"}
        gap={collapsed ? 0 : 3}
        className="min-w-0 flex-1 h-full"
      >
        <Icon
          size={14}
          strokeWidth={isGroupActive ? 2.2 : 1.8}
          className="shrink-0"
        />

        <div
          className={cn(
            "transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] whitespace-nowrap overflow-hidden text-left",
            collapsed ? "max-w-0 opacity-0" : "max-w-[130px] opacity-100",
          )}
        >
          <Text
            variant="caption"
            weight={isGroupActive ? "semibold" : "medium"}
            color="inherit"
            className="text-[11px] leading-4"
          >
            {item.label}
          </Text>
        </div>
      </Row>

      <div
        className={cn(
          "transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden shrink-0 flex items-center justify-center",
          collapsed ? "max-w-0 opacity-0" : "max-w-[20px] opacity-100",
        )}
      >
        <ChevronDown
          size={12}
          strokeWidth={2}
          className={cn(
            "shrink-0 transition-transform duration-200",
            expanded && "rotate-180",
          )}
        />
      </div>
    </button>
  );

  return (
    <Box>
      {collapsed ? (
        <Tooltip content={item.label} side="right">
          <div className="w-full">{trigger}</div>
        </Tooltip>
      ) : (
        trigger
      )}

      {!collapsed && expanded && (
        <Stack gap={0} className="mt-1 mb-1">
          {item.children.map((child) => (
            <SubItem
              key={child.path}
              {...child}
              active={activeChildPath === child.path}
            />
          ))}
        </Stack>
      )}
    </Box>
  );
});

const NavLinkItem = memo(function NavLinkItem({
  item,
  collapsed,
}: {
  item: NavItem;
  collapsed: boolean;
}) {
  const { pathname } = useLocation();
  const Icon = item.icon;
  const isActive = item.path ? isRouteMatch(pathname, item.path) : false;

  const link = (
    <NavLink
      to={item.path!}
      className={cn(
        "flex items-center rounded-(--radius-sm) py-2 transition-colors outline-none h-[32px]",
        isActive
          ? "bg-(--color-brand) text-white shadow-[0_2px_4px_rgba(78,43,204,0.12)]"
          : "text-(--color-text-secondary) hover:bg-(--color-bg-subtle) hover:text-(--color-text-primary)",
        collapsed ? "px-0" : "px-2.5",
      )}
    >
      <Row
        align="center"
        justify={collapsed ? "center" : "start"}
        gap={collapsed ? 0 : 3}
        className="min-w-0 w-full h-full"
      >
        <Icon
          size={14}
          strokeWidth={isActive ? 2.2 : 1.8}
          className="shrink-0"
        />

        <div
          className={cn(
            "transition-all duration-300 ease-in-out whitespace-nowrap overflow-hidden text-left",
            collapsed ? "max-w-0 opacity-0" : "max-w-[130px] opacity-100",
          )}
        >
          <Text
            variant="caption"
            weight={isActive ? "semibold" : "medium"}
            color="inherit"
            className="text-[11px] leading-4"
          >
            {item.label}
          </Text>
        </div>
      </Row>
    </NavLink>
  );

  return collapsed ? (
    <Tooltip content={item.label} side="right">
      <div className="w-full">{link}</div>
    </Tooltip>
  ) : (
    link
  );
});

export const Sidebar = memo(function Sidebar() {
  const open = useUIStore((state) => state.sidebarOpen);
  const toggle = useUIStore((state) => state.toggleSidebar);
  const user = useAuthStore((state) => state.user);
  const collapsed = !open;

  return (
    <aside
      className={cn(
        "relative z-(--z-sidebar) flex h-screen shrink-0 flex-col overflow-visible bg-white text-(--color-text-primary)",
        "border-r border-(--color-border) transition-[width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] shadow-[1px_0_10px_rgba(0,0,0,0.02)]",
        collapsed ? COLLAPSED_WIDTH : SIDEBAR_WIDTH,
      )}
    >
      {/* Toggle Button */}
      <button
        type="button"
        onClick={toggle}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="absolute -right-3 top-[22px] z-20 flex h-6 w-6 items-center justify-center rounded-full border border-(--color-border) bg-white text-(--color-text-tertiary) shadow-sm transition-colors hover:text-(--color-brand) hover:border-(--color-brand) focus:outline-none"
      >
        {collapsed ? (
          <ChevronRight size={14} strokeWidth={2.5} />
        ) : (
          <ChevronLeft size={14} strokeWidth={2.5} />
        )}
      </button>

      {/* Brand Header */}
      <Box
        className={cn(
          "flex h-[64px] shrink-0 flex-col justify-center border-b border-(--color-border) transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
          collapsed ? "px-0 items-center" : "px-5",
        )}
      >
        <div
          className={cn(
            "overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
            collapsed ? "max-w-[22px]" : "max-w-[132px]",
          )}
        >
          <NectaLogo height={22} className="max-w-none" />
        </div>

        <div
          className={cn(
            "transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap",
            collapsed
              ? "max-h-0 opacity-0 mt-0"
              : "max-h-3.5 opacity-100 mt-1",
          )}
        >
          <Text
            variant="micro"
            color="tertiary"
            weight="semibold"
            className="block uppercase tracking-widest text-[8.5px]"
          >
            Admin Control Panel
          </Text>
        </div>
      </Box>

      {/* Navigation Area */}
      <Box
        className={cn(
          "flex-1 overflow-y-auto overflow-x-hidden py-4 scrollbar-hide transition-all duration-300 ease-in-out",
          collapsed ? "px-3" : "px-3",
        )}
      >
        <Stack gap={1}>
          {NAV_MAIN.map((item) =>
            item.children ? (
              <NavGroup
                key={item.label}
                item={item as NavItem & { children: NavChild[] }}
                collapsed={collapsed}
              />
            ) : (
              <NavLinkItem key={item.label} item={item} collapsed={collapsed} />
            ),
          )}
        </Stack>

        <Box className="mt-5 pt-4 border-t border-(--color-border)">
          <div
            className={cn(
              "transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap",
              collapsed
                ? "max-h-0 opacity-0 mb-0"
                : "max-h-[16px] opacity-100 mb-3",
            )}
          >
            <Text
              variant="micro"
              color="tertiary"
              weight="bold"
              className="block px-2.5 uppercase tracking-wider text-[9.5px]"
            >
              System
            </Text>
          </div>

          <Stack gap={1}>
            {NAV_SYSTEM.map((item) =>
              item.children ? (
                <NavGroup
                  key={item.label}
                  item={item as NavItem & { children: NavChild[] }}
                  collapsed={collapsed}
                />
              ) : (
                <NavLinkItem
                  key={item.label}
                  item={item}
                  collapsed={collapsed}
                />
              ),
            )}
          </Stack>
        </Box>
      </Box>

      {/* User Footer Profile */}
      {user && (
        <Box
          className={cn(
            "flex h-[64px] shrink-0 items-center border-t border-(--color-border) bg-(--color-bg-subtle) transition-colors hover:bg-[rgba(0,0,0,0.02)] overflow-hidden",
            collapsed ? "justify-center px-0" : "px-4",
          )}
        >
          <Row
            align="center"
            justify={collapsed ? "center" : "start"}
            gap={collapsed ? 0 : 3}
            className="w-full min-w-0"
          >
            <div className="shrink-0">
              <Avatar name={user.name} size="md" />
            </div>

            <div
              className={cn(
                "transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] whitespace-nowrap overflow-hidden flex flex-col",
                collapsed ? "max-w-0 opacity-0" : "max-w-[130px] opacity-100",
              )}
            >
              <Text
                variant="caption"
                color="primary"
                weight="semibold"
                className="truncate text-[11px] leading-4"
              >
                {user.name}
              </Text>
              <Text
                variant="micro"
                color="tertiary"
                className="truncate text-[9.5px] leading-3"
              >
                {user.email}
              </Text>
            </div>
          </Row>
        </Box>
      )}
    </aside>
  );
});
