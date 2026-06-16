import { cn } from "@/lib/utils";
import { type ElementType, type ReactNode } from "react";

export type TextVariant =
  | "display"
  | "heading"
  | "title"
  | "subtitle"
  | "body"
  | "caption"
  | "label"
  | "micro";

export type TextColor =
  | "primary"
  | "secondary"
  | "tertiary"
  | "muted"
  | "success"
  | "warning"
  | "danger"
  | "brand"
  | "white"
  | "inherit";

export type TextWeight = "normal" | "medium" | "semibold" | "bold";

interface TextProps {
  variant?: TextVariant;
  color?: TextColor;
  weight?: TextWeight;
  as?: ElementType;
  uppercase?: boolean;
  truncate?: boolean;
  className?: string;
  children: ReactNode;
}

const variantStyles: Record<TextVariant, string> = {
  display:
    "font-geom text-[32px] leading-[41.6px] tracking-[-0.64px] font-semibold",
  heading:
    "font-geom text-[24px] leading-[33.6px] tracking-[-0.24px] font-semibold",
  title:
    "font-geom text-[18px] leading-[25.2px] tracking-[-0.18px] font-semibold",
  subtitle:
    "font-geom text-[15px] leading-[21px] tracking-[-0.15px] font-medium",
  body: "font-geom text-[14px] leading-[20px] tracking-[-0.14px] font-normal",
  caption:
    "font-geom text-[13px] leading-[19.5px] tracking-[0.13px] font-normal",
  label:
    "font-geom text-[12px] leading-[17.6px] tracking-[0.275px] font-medium",
  micro:
    "font-geom text-[11px] leading-[17.6px] tracking-[0.275px] font-normal",
};

const colorStyles: Record<TextColor, string> = {
  primary: "text-[var(--color-text-primary)]",
  secondary: "text-[var(--color-text-secondary)]",
  tertiary: "text-[var(--color-text-tertiary)]",
  muted: "text-[var(--color-text-muted)]",
  success: "text-[var(--color-success-dark)]",
  warning: "text-[var(--color-warning-dark)]",
  danger: "text-[var(--color-danger-dark)]",
  brand: "text-[var(--color-brand)]",
  white: "text-white",
  inherit: "text-inherit",
};

const weightStyles: Record<TextWeight, string> = {
  normal: "font-normal",
  medium: "font-medium",
  semibold: "font-semibold",
  bold: "font-bold",
};

const defaultTag: Record<TextVariant, ElementType> = {
  display: "h1",
  heading: "h2",
  title: "h3",
  subtitle: "h4",
  body: "p",
  caption: "p",
  label: "span",
  micro: "span",
};

export function Text({
  variant = "body",
  color = "primary",
  weight,
  as,
  uppercase,
  truncate,
  className,
  children,
}: TextProps) {
  const Tag = as ?? defaultTag[variant];

  return (
    <Tag
      className={cn(
        variantStyles[variant],
        colorStyles[color],
        weight && weightStyles[weight],
        uppercase && "uppercase",
        truncate && "truncate",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
