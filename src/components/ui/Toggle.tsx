import { cn } from "@/lib/utils";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  size?: "sm" | "md";
}


export function Toggle({
  checked,
  onChange,
  disabled,
  size = "md",
}: ToggleProps) {
  const trackW = size === "sm" ? "w-8" : "w-11";
  const trackH = size === "sm" ? "h-4" : "h-6";
  const thumbS = size === "sm" ? "h-3 w-3" : "h-[18px] w-[18px]";
  const thumbT = size === "sm" ? "top-0.5 left-0.5" : "top-[3px] left-[3px]";
  const translateX = size === "sm" ? "translate-x-4" : "translate-x-5";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex shrink-0 rounded-full transition-colors duration-200",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-(--color-brand) focus-visible:ring-offset-2",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        trackW,
        trackH,
        checked ? "bg-(--color-brand)" : "bg-(--color-border)",
      )}
    >
      <span
        className={cn(
          "absolute rounded-full bg-white shadow-sm transition-transform duration-200",
          thumbS,
          thumbT,
          checked ? translateX : "translate-x-0",
        )}
      />
    </button>
  );
}
