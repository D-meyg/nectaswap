import { cn } from "@/lib/utils";

type SpinnerSize = "xs" | "sm" | "md" | "lg";

interface SpinnerProps {
  size?: SpinnerSize;
  className?: string;
  label?: string; // sr-only accessible label
}

const sizeMap: Record<SpinnerSize, string> = {
  xs: "h-3 w-3",
  sm: "h-3.5 w-3.5",
  md: "h-5 w-5",
  lg: "h-7 w-7",
};

/**
 * Spinner — reusable loading indicator.
 * Replaces the copy-pasted SVG inside Button, DataTable, and pages.
 *
 * Usage:
 *   <Spinner />                    — medium, inherits color
 *   <Spinner size="sm" />          — inside buttons
<<<<<<< HEAD
 *   <Spinner size="lg" className="text-[var(--color-brand)]" />
=======
 *   <Spinner size="lg" className="text-(--color-brand)" />
>>>>>>> refactoring/dummy-data
 */
export function Spinner({
  size = "md",
  className,
  label = "Loading…",
}: SpinnerProps) {
  return (
    <svg
      className={cn("animate-spin", sizeMap[size], className)}
      viewBox="0 0 24 24"
      fill="none"
      aria-label={label}
      role="status"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v8H4z"
      />
    </svg>
  );
}