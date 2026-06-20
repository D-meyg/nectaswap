import { cn } from "@/lib/utils";
import { type ElementType, type ReactNode, forwardRef } from "react";

export type SpacingKey = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10;

/**
 * Static lookup maps — every class string is written out explicitly
 * so Tailwind v4's scanner can detect them at build time and never purge them.
 * Dynamic string interpolation like `${prefix}-${val}` would be invisible to
 * the scanner, causing classes to be missing in production.
 */
const P: Record<SpacingKey, string> = {
  0: "p-0",
  1: "p-1",
  2: "p-2",
  3: "p-3",
  4: "p-4",
  5: "p-5",
  6: "p-6",
  8: "p-8",
  10: "p-10",
};
const PX: Record<SpacingKey, string> = {
  0: "px-0",
  1: "px-1",
  2: "px-2",
  3: "px-3",
  4: "px-4",
  5: "px-5",
  6: "px-6",
  8: "px-8",
  10: "px-10",
};
const PY: Record<SpacingKey, string> = {
  0: "py-0",
  1: "py-1",
  2: "py-2",
  3: "py-3",
  4: "py-4",
  5: "py-5",
  6: "py-6",
  8: "py-8",
  10: "py-10",
};
const PT: Record<SpacingKey, string> = {
  0: "pt-0",
  1: "pt-1",
  2: "pt-2",
  3: "pt-3",
  4: "pt-4",
  5: "pt-5",
  6: "pt-6",
  8: "pt-8",
  10: "pt-10",
};
const PB: Record<SpacingKey, string> = {
  0: "pb-0",
  1: "pb-1",
  2: "pb-2",
  3: "pb-3",
  4: "pb-4",
  5: "pb-5",
  6: "pb-6",
  8: "pb-8",
  10: "pb-10",
};
const PL: Record<SpacingKey, string> = {
  0: "pl-0",
  1: "pl-1",
  2: "pl-2",
  3: "pl-3",
  4: "pl-4",
  5: "pl-5",
  6: "pl-6",
  8: "pl-8",
  10: "pl-10",
};
const PR: Record<SpacingKey, string> = {
  0: "pr-0",
  1: "pr-1",
  2: "pr-2",
  3: "pr-3",
  4: "pr-4",
  5: "pr-5",
  6: "pr-6",
  8: "pr-8",
  10: "pr-10",
};
const M: Record<SpacingKey, string> = {
  0: "m-0",
  1: "m-1",
  2: "m-2",
  3: "m-3",
  4: "m-4",
  5: "m-5",
  6: "m-6",
  8: "m-8",
  10: "m-10",
};
const MX: Record<SpacingKey, string> = {
  0: "mx-0",
  1: "mx-1",
  2: "mx-2",
  3: "mx-3",
  4: "mx-4",
  5: "mx-5",
  6: "mx-6",
  8: "mx-8",
  10: "mx-10",
};
const MY: Record<SpacingKey, string> = {
  0: "my-0",
  1: "my-1",
  2: "my-2",
  3: "my-3",
  4: "my-4",
  5: "my-5",
  6: "my-6",
  8: "my-8",
  10: "my-10",
};
const MT: Record<SpacingKey, string> = {
  0: "mt-0",
  1: "mt-1",
  2: "mt-2",
  3: "mt-3",
  4: "mt-4",
  5: "mt-5",
  6: "mt-6",
  8: "mt-8",
  10: "mt-10",
};
const MB: Record<SpacingKey, string> = {
  0: "mb-0",
  1: "mb-1",
  2: "mb-2",
  3: "mb-3",
  4: "mb-4",
  5: "mb-5",
  6: "mb-6",
  8: "mb-8",
  10: "mb-10",
};

interface BoxProps {
  as?: ElementType;
  p?: SpacingKey;
  px?: SpacingKey;
  py?: SpacingKey;
  pt?: SpacingKey;
  pb?: SpacingKey;
  pl?: SpacingKey;
  pr?: SpacingKey;
  m?: SpacingKey;
  mx?: SpacingKey;
  my?: SpacingKey;
  mt?: SpacingKey;
  mb?: SpacingKey;
  className?: string;
  children?: ReactNode;
  style?: React.CSSProperties;
  [key: `data-${string}`]: unknown;
  [key: `aria-${string}`]: unknown;
}

export const Box = forwardRef<HTMLElement, BoxProps>(function Box(
  {
    as: Tag = "div",
    p,
    px,
    py,
    pt,
    pb,
    pl,
    pr,
    m,
    mx,
    my,
    mt,
    mb,
    className,
    children,
    ...rest
  },
  ref,
) {
  return (
    <Tag
      ref={ref}
      className={
        cn(
          p !== undefined && P[p],
          px !== undefined && PX[px],
          py !== undefined && PY[py],
          pt !== undefined && PT[pt],
          pb !== undefined && PB[pb],
          pl !== undefined && PL[pl],
          pr !== undefined && PR[pr],
          m !== undefined && M[m],
          mx !== undefined && MX[mx],
          my !== undefined && MY[my],
          mt !== undefined && MT[mt],
          mb !== undefined && MB[mb],
          className,
        ) || undefined
      }
      {...rest}
    >
      {children}
    </Tag>
  );
});
