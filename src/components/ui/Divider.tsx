import { cn } from "@/lib/utils";

interface DividerProps {
  vertical?: boolean;
  className?: string;
  label?: string; // optional centered label (e.g. "OR")
}

/**
 * Divider — replaces <div className="h-px bg-[var(--color-border)]">
 * scattered across TopBar, dropdowns, card sections, modals.
 *
 * Usage:
 *   <Divider />                  — full-width horizontal line
 *   <Divider vertical />         — vertical line (needs parent height)
 *   <Divider label="OR" />       — horizontal with centered label
 */
export function Divider({ vertical, className, label }: DividerProps) {
  if (vertical) {
    return (
      <div
        className={cn("w-px self-stretch bg-[var(--color-border)]", className)}
        role="separator"
        aria-orientation="vertical"
      />
    );
  }

  if (label) {
    return (
      <div
        className={cn("flex items-center gap-3", className)}
        role="separator"
      >
        <div className="flex-1 h-px bg-[var(--color-border)]" />
        <span className="text-[11px] text-[var(--color-text-muted)] font-medium uppercase tracking-[0.5px]">
          {label}
        </span>
        <div className="flex-1 h-px bg-[var(--color-border)]" />
      </div>
    );
  }

  return (
    <div
      className={cn("h-px w-full bg-[var(--color-border)]", className)}
      role="separator"
      aria-orientation="horizontal"
    />
  );
}