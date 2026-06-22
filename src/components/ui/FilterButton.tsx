import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface FilterButtonProps {
  label: string;
  value?: string;
  active?: boolean;
  className?: string;
  icon?: ReactNode;
  onClick?: () => void;
}

export function FilterButton({
  label,
  value,
  active,
  className,
  icon,
  onClick,
}: FilterButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-10 shrink-0 items-center gap-2 rounded-(--radius-md) border px-3.5 font-geom text-[13.5px] font-medium transition-all duration-200 focus:outline-none",
        active
          ? "border-(--color-brand) bg-(--color-brand)/5 text-(--color-brand)"
          : "border-(--color-border) bg-white text-(--color-text-secondary) hover:bg-(--color-bg-subtle) hover:text-(--color-text-primary)",
        className,
      )}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span className="whitespace-nowrap">{value || label}</span>
      {!icon && (
        <ChevronDown size={14} strokeWidth={2.5} className="shrink-0 ml-0.5" />
      )}
    </button>
  );
}
