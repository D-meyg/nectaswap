import { forwardRef, type SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Text } from "@/components/ui/Text";

interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options?: SelectOption[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    { label, error, hint, options = [], className, children, ...props },
    ref,
  ) => (
    <div className="flex flex-col gap-1.5">
      {label && (
        <Text variant="label" color="primary" as="label">
          {label}
        </Text>
      )}

      <div className="relative">
        <select
          ref={ref}
          className={cn(
            "h-[36px] w-full appearance-none rounded-radius-md border border-border bg-white px-3 pr-9 font-geom text-[13px] text-text-primary",
            "transition-colors focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/10",
            "disabled:cursor-not-allowed disabled:bg-bg-subtle disabled:opacity-60",
            error && "border-danger focus:border-danger",
            className,
          )}
          {...props}
        >
          {children ??
            options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
        </select>

        <ChevronDown
          size={14}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-muted"
        />
      </div>

      {error && (
        <Text variant="micro" color="danger">
          {error}
        </Text>
      )}

      {hint && !error && (
        <Text variant="micro" color="muted">
          {hint}
        </Text>
      )}
    </div>
  ),
);

Select.displayName = "Select";
