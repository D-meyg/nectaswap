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

interface StackProps {
  as?: ElementType;
  gap?: GapKey;
  align?: "start" | "center" | "end" | "stretch";
  className?: string;
  children: ReactNode;
}

export function Stack({
  as: Tag = "div",
  gap = 4,
  align,
  className,
  children,
}: StackProps) {
  const alignMap = {
    start: "items-start",
    center: "items-center",
    end: "items-end",
    stretch: "items-stretch",
  };

  return (
    <Tag
      className={cn(
        "flex flex-col",
        GAP[gap],
        align && alignMap[align],
        className,
      )}
    >
      {children}
    </Tag>
  );
}
