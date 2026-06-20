import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Text } from "@/components/ui/Text";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, rightIcon, className, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && (
        <Text variant="label" color="primary" as="label">
          {label}
        </Text>
      )}

      <div className="relative">
        {leftIcon && (
          <span className="absolute left-3 top-1/2 flex -translate-y-1/2 text-(--color-text-tertiary)">
            {leftIcon}
          </span>
        )}

        <input
          ref={ref}
          className={cn(
            "h-[36px] w-full rounded-(--radius-md) border border-(--color-border) bg-white px-3 font-geom text-[13px] text-(--color-text-primary)",
            "placeholder:text-(--color-text-muted)",
            "transition-colors focus:border-(--color-brand) focus:outline-none focus:ring-2 focus:ring-(--color-brand)/10",
            "disabled:cursor-not-allowed disabled:bg-(--color-bg-subtle) disabled:opacity-60",
            error &&
              "border-(--color-danger) focus:border-(--color-danger)",
            leftIcon && "pl-9",
            rightIcon && "pr-9",
            className,
          )}
          {...props}
        />

        {rightIcon && (
          <span className="absolute right-3 top-1/2 flex -translate-y-1/2 text-(--color-text-tertiary)">
            {rightIcon}
          </span>
        )}
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

Input.displayName = "Input";
