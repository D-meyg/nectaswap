import * as RadixDropdown from "@radix-ui/react-dropdown-menu";
import { cn } from "@/lib/utils";
import { Check, ChevronRight } from "lucide-react";
import { type ReactNode } from "react";

/**
 * Dropdown — composable menu built on Radix DropdownMenu.
 * Radix handles: positioning, keyboard nav, focus trap, ARIA.
 * We handle: appearance via design system tokens.
 *
 * Usage:
 *   <Dropdown.Root>
 *     <Dropdown.Trigger asChild>
 *       <Button variant="ghost">Actions</Button>
 *     </Dropdown.Trigger>
 *     <Dropdown.Content>
 *       <Dropdown.Item icon={<Eye />} onSelect={() => {}}>View</Dropdown.Item>
 *       <Dropdown.Item icon={<Lock />} onSelect={() => {}} danger>Freeze</Dropdown.Item>
 *       <Dropdown.Separator />
 *       <Dropdown.Item icon={<Trash2 />} onSelect={() => {}} danger>Delete</Dropdown.Item>
 *     </Dropdown.Content>
 *   </Dropdown.Root>
 *
 * Used in: TopBar user menu, table row actions, bulk action menus
 */

// ── Shared content styles ─────────────────────────────────
const contentStyles = cn(
  "z-(--z-dropdown) min-w-40 overflow-hidden",
  "rounded-(--radius-md)",
  "bg-white border border-(--color-border)",
  "shadow-[0_4px_16px_rgba(0,0,0,0.10)]",
  "py-1",
  // Animations
  "animate-in fade-in-0 zoom-in-95",
  "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
  "data-[side=bottom]:slide-in-from-top-2",
  "data-[side=top]:slide-in-from-bottom-2",
);

const itemBaseStyles = cn(
  "relative flex items-center gap-2.5 select-none outline-none cursor-pointer",
  "px-3 py-[0.4375rem] text-[0.8125rem] transition-colors",
  "data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed",
);

// ── Content ───────────────────────────────────────────────
interface ContentProps {
  children: ReactNode;
  align?: "start" | "center" | "end";
  side?: "top" | "right" | "bottom" | "left";
  className?: string;
}

function Content({
  children,
  align = "end",
  side = "bottom",
  className,
}: ContentProps) {
  return (
    <RadixDropdown.Portal>
      <RadixDropdown.Content
        align={align}
        side={side}
        sideOffset={6}
        className={cn(contentStyles, className)}
      >
        {children}
      </RadixDropdown.Content>
    </RadixDropdown.Portal>
  );
}

// ── Item ──────────────────────────────────────────────────
interface ItemProps {
  children: ReactNode;
  icon?: ReactNode;
  onSelect?: () => void;
  danger?: boolean;
  disabled?: boolean;
  className?: string;
}

function Item({
  children,
  icon,
  onSelect,
  danger,
  disabled,
  className,
}: ItemProps) {
  return (
    <RadixDropdown.Item
      onSelect={onSelect}
      disabled={disabled}
      className={cn(
        itemBaseStyles,
        danger
          ? "text-(--color-danger) focus:bg-(--color-danger-subtle)"
          : "text-(--color-text-primary) focus:bg-(--color-bg-subtle)",
        className,
      )}
    >
      {icon && (
        <span
          className={cn(
            "shrink-0",
            danger
              ? "text-(--color-danger)"
              : "text-(--color-text-muted)",
          )}
        >
          {icon}
        </span>
      )}
      <span className="flex-1 truncate">{children}</span>
    </RadixDropdown.Item>
  );
}

// ── CheckboxItem ──────────────────────────────────────────
interface CheckboxItemProps {
  children: ReactNode;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  disabled?: boolean;
}

function CheckboxItem({
  children,
  checked,
  onCheckedChange,
  disabled,
}: CheckboxItemProps) {
  return (
    <RadixDropdown.CheckboxItem
      checked={checked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
      className={cn(
        itemBaseStyles,
        "text-(--color-text-primary) focus:bg-(--color-bg-subtle) pl-8",
      )}
    >
      <RadixDropdown.ItemIndicator className="absolute left-3">
        <Check size={12} className="text-(--color-brand)" />
      </RadixDropdown.ItemIndicator>
      {children}
    </RadixDropdown.CheckboxItem>
  );
}

// ── Sub-menu ──────────────────────────────────────────────
interface SubTriggerProps {
  children: ReactNode;
  icon?: ReactNode;
  className?: string;
}

function SubTrigger({ children, icon, className }: SubTriggerProps) {
  return (
    <RadixDropdown.SubTrigger
      className={cn(
        itemBaseStyles,
        "text-(--color-text-primary) focus:bg-(--color-bg-subtle)",
        className,
      )}
    >
      {icon && (
        <span className="text-(--color-text-muted) shrink-0">{icon}</span>
      )}
      <span className="flex-1 truncate">{children}</span>
      <ChevronRight size={12} className="text-(--color-text-muted)" />
    </RadixDropdown.SubTrigger>
  );
}

function SubContent({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <RadixDropdown.Portal>
      <RadixDropdown.SubContent
        sideOffset={4}
        className={cn(contentStyles, className)}
      >
        {children}
      </RadixDropdown.SubContent>
    </RadixDropdown.Portal>
  );
}

// ── Label + Separator ─────────────────────────────────────
function Label({ children }: { children: ReactNode }) {
  return (
    <RadixDropdown.Label className="px-3 py-1.5">
      <span className="text-[0.6875rem] font-medium text-(--color-text-muted) uppercase tracking-[0.5px]">
        {children}
      </span>
    </RadixDropdown.Label>
  );
}

function Separator() {
  return (
    <RadixDropdown.Separator className="h-px bg-(--color-border) my-1" />
  );
}

// ── Composed export ───────────────────────────────────────
export const Dropdown = {
  Root: RadixDropdown.Root,
  Trigger: RadixDropdown.Trigger,
  Sub: RadixDropdown.Sub,
  Content,
  Item,
  CheckboxItem,
  SubTrigger,
  SubContent,
  Label,
  Separator,
};