import { cn } from "@/lib/utils";
import { createContext, type ReactNode, useContext } from "react";
import { Text } from "./Text";

interface TabsContextValue {
  active: string;
  onChange: (value: string) => void;
}

const TabsContext = createContext<TabsContextValue>({
  active: "",
  onChange: () => {},
});

interface TabsRootProps {
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
  className?: string;
}

export function TabsRoot({
  value,
  onChange,
  children,
  className,
}: TabsRootProps) {
  return (
    <TabsContext.Provider value={{ active: value, onChange }}>
      <div className={cn("flex flex-col", className)}>{children}</div>
    </TabsContext.Provider>
  );
}

interface TabsListProps {
  children: ReactNode;
  className?: string;
}

export function TabsList({ children, className }: TabsListProps) {
  return (
    <div
      className={cn(
        "flex min-h-[48px] items-center gap-6 overflow-x-auto border-b border-(--color-border) scrollbar-hide",
        className,
      )}
    >
      {children}
    </div>
  );
}

interface TabProps {
  value: string;
  children: ReactNode;
  icon?: ReactNode;
  count?: number | string;
  className?: string;
}

export function Tab({ value, children, icon, count, className }: TabProps) {
  const { active, onChange } = useContext(TabsContext);
  const isActive = active === value;

  return (
    <button
      type="button"
      onClick={() => onChange(value)}
      className={cn(
        "inline-flex h-[48px] shrink-0 items-center gap-2 border-b-2 px-1 pb-[2px] font-geom text-[13.5px] transition-colors focus:outline-none",
        isActive
          ? "border-(--color-brand) text-(--color-brand)"
          : "border-transparent text-(--color-text-secondary) hover:border-(--color-border-02) hover:text-(--color-text-primary)",
        className,
      )}
    >
      {icon && (
        <span
          className={cn("shrink-0", isActive ? "opacity-100" : "opacity-70")}
        >
          {icon}
        </span>
      )}

      <Text
        variant="caption"
        color="inherit"
        weight={isActive ? "semibold" : "medium"}
        className="text-[13.5px]"
      >
        {children}
      </Text>

      {count !== undefined && (
        <span
          className={cn(
            "ml-1 rounded-full px-1.5 py-[1px] font-geom text-[11px] font-semibold leading-none",
            isActive
              ? "bg-(--color-brand)/10 text-(--color-brand)"
              : "bg-(--color-bg-subtle) text-(--color-text-secondary)",
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}

interface TabPanelProps {
  value: string;
  children: ReactNode;
  className?: string;
}

export function TabPanel({ value, children, className }: TabPanelProps) {
  const { active } = useContext(TabsContext);

  if (active !== value) return null;

  return (
    <div className={cn("flex-1 pt-5 animation-fade-in", className)}>
      {children}
    </div>
  );
}

interface TabsWithSidebarProps {
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
  sidebar?: ReactNode;
  sidebarWidth?: string;
  className?: string;
}

export function TabsWithSidebar({
  value,
  onChange,
  children,
  sidebar,
  sidebarWidth = "320px",
  className,
}: TabsWithSidebarProps) {
  if (!sidebar) {
    return (
      <TabsRoot value={value} onChange={onChange} className={className}>
        {children}
      </TabsRoot>
    );
  }

  const childArray = Array.isArray(children) ? children : [children];

  const tabListChildren: ReactNode[] = [];
  const panelChildren: ReactNode[] = [];

  childArray.forEach((child) => {
    if (
      child &&
      typeof child === "object" &&
      "type" in child &&
      (child as { type: unknown }).type === TabsList
    ) {
      tabListChildren.push(child);
    } else {
      panelChildren.push(child);
    }
  });

  return (
    <TabsContext.Provider value={{ active: value, onChange }}>
      <div className={cn("flex flex-col", className)}>
        {tabListChildren}

        <div className="flex items-start gap-6 mt-6">
          <div className="min-w-0 flex-1">{panelChildren}</div>

          <aside className="shrink-0" style={{ width: sidebarWidth }}>
            {sidebar}
          </aside>
        </div>
      </div>
    </TabsContext.Provider>
  );
}

export const Tabs = Object.assign(TabsRoot, {
  List: TabsList,
  Tab,
  Panel: TabPanel,
  WithSidebar: TabsWithSidebar,
});
