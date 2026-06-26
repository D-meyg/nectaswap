import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type GapKey = 0 | 0.5 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12;

const gapMap: Record<GapKey, string> = {
  0: "gap-0",
  0.5: "gap-0.5",
  1: "gap-1",
  2: "gap-2",
  3: "gap-3",
  4: "gap-4",
  5: "gap-5",
  6: "gap-6",
  8: "gap-8",
  10: "gap-10",
  12: "gap-12",
};

interface StackProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  gap?: GapKey;
  align?: "start" | "center" | "end" | "stretch";
}

const alignMap = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch",
};

export function Stack({
  children,
  gap = 4,
  align = "stretch",
  className,
  ...props
}: StackProps) {
  return (
    <div
      className={cn("flex flex-col", gapMap[gap], alignMap[align], className)}
      {...props}
    >
      {children}
    </div>
  );
}
