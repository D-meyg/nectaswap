import { cn } from "@/lib/utils";

interface AssetIconProps {
  symbol: string;
  size?: "sm" | "md";
  className?: string;
}

// Brand-tinted circular badge with the first two letters of the asset symbol.
const palette: Record<string, { bg: string; color: string }> = {
  BTC: { bg: "bg-[#F7931A]/15", color: "text-[#F7931A]" },
  ETH: { bg: "bg-[#627EEA]/15", color: "text-[#627EEA]" },
};

export function AssetIcon({ symbol, size = "md", className }: AssetIconProps) {
  const cfg = palette[symbol] ?? {
    bg: "bg-[rgba(78,43,204,0.1)]",
    color: "text-(--color-brand)",
  };
  const dim = size === "sm" ? "h-7 w-7 text-[0.625rem]" : "h-9 w-9 text-[0.6875rem]";

  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-bold uppercase",
        dim,
        cfg.bg,
        cfg.color,
        className,
      )}
    >
      {symbol.slice(0, 2)}
    </span>
  );
}
