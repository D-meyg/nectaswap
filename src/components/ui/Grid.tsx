import { cn } from "@/lib/utils";
import { type ElementType, type ReactNode } from "react";

type GapKey = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10;
type ColKey = 1 | 2 | 3 | 4 | 5 | 6 | 12;

const GAP: Record<GapKey, string> = {
  0: "gap-0",
  1: "gap-1",
  2: "gap-2",
  3: "gap-3",
  4: "gap-4",
  5: "gap-5",
  6: "gap-6",
  8: "gap-8",
  10: "gap-10",
};

const COLS: Record<ColKey, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-5",
  6: "grid-cols-6",
  12: "grid-cols-12",
};

const SM: Record<ColKey, string> = {
  1: "sm:grid-cols-1",
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
  4: "sm:grid-cols-4",
  5: "sm:grid-cols-5",
  6: "sm:grid-cols-6",
  12: "sm:grid-cols-12",
};

const LG: Record<ColKey, string> = {
  1: "lg:grid-cols-1",
  2: "lg:grid-cols-2",
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
  5: "lg:grid-cols-5",
  6: "lg:grid-cols-6",
  12: "lg:grid-cols-12",
};

interface GridProps {
  as?: ElementType;
  cols?: ColKey;
  sm?: ColKey;
  lg?: ColKey;
  gap?: GapKey;
  className?: string;
  children: ReactNode;
}

export function Grid({
  as: Tag = "div",
  cols = 1,
  sm,
  lg,
  gap = 4,
  className,
  children,
}: GridProps) {
  return (
    <Tag
      className={cn(
        "grid",
        COLS[cols],
        sm && SM[sm],
        lg && LG[lg],
        GAP[gap],
        className,
      )}
    >
      {children}
    </Tag>
  );
}
