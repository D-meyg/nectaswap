import { cn } from "@/lib/utils";
import { type ElementType, type ReactNode } from "react";

type GapKey = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10;

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

type AlignItems = "start" | "center" | "end" | "stretch" | "baseline";

type JustifyItems =
  | "start"
  | "center"
  | "end"
  | "between"
  | "around"
  | "evenly";

interface RowProps {
  as?: ElementType;
  gap?: GapKey;
  align?: AlignItems;
  justify?: JustifyItems;
  wrap?: boolean;
  className?: string;
  children: ReactNode;
}

export function Row({
  as: Tag = "div",
  gap = 3,
  align = "center",
  justify,
  wrap,
  className,
  children,
}: RowProps) {
  const alignMap: Record<AlignItems, string> = {
    start: "items-start",
    center: "items-center",
    end: "items-end",
    stretch: "items-stretch",
    baseline: "items-baseline",
  };

  const justifyMap: Record<JustifyItems, string> = {
    start: "justify-start",
    center: "justify-center",
    end: "justify-end",
    between: "justify-between",
    around: "justify-around",
    evenly: "justify-evenly",
  };

  return (
    <Tag
      className={cn(
        "flex",
        GAP[gap],
        alignMap[align],
        justify && justifyMap[justify],
        wrap && "flex-wrap",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
