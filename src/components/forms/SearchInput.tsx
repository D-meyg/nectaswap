import { forwardRef } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      value,
      onChange,
      placeholder = "Search users, transactions, cards...",
      className,
    },
    ref,
  ) => {
    return (
      <div
        className={cn(
          "flex h-[40px] items-center gap-2.5 rounded-(--radius-md) border border-(--color-border) bg-white px-3.5",
          "transition-all duration-200 focus-within:border-(--color-brand) focus-within:ring-4 focus-within:ring-(--color-brand)/10",
          className,
        )}
      >
        <Search size={16} className="shrink-0 text-(--color-text-muted)" />

        <input
          ref={ref}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="min-w-0 flex-1 bg-transparent font-geom text-[13.5px] font-medium text-(--color-text-primary) outline-none placeholder:text-(--color-text-muted) placeholder:font-normal"
        />

        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="shrink-0 text-(--color-text-muted) transition-colors hover:text-(--color-text-secondary) focus:outline-none"
          >
            <X size={16} />
          </button>
        )}
      </div>
    );
  },
);

SearchInput.displayName = "SearchInput";
