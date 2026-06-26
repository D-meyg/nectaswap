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
    "font-geom text-[2rem] leading-[2.6rem] tracking-[-0.64px] font-semibold",
  heading:
    "font-geom text-2xl leading-[2.1rem] tracking-[-0.24px] font-semibold",
  title:
    "font-geom text-lg leading-[1.575rem] tracking-[-0.18px] font-semibold",
  subtitle:
    "font-geom text-[0.9375rem] leading-[1.3125rem] tracking-[-0.15px] font-medium",
  body: "font-geom text-sm leading-5 tracking-[-0.14px] font-normal",
  caption:
    "font-geom text-[0.8125rem] leading-[1.21875rem] tracking-[0.13px] font-normal",
  label:
    "font-geom text-xs leading-[1.1rem] tracking-[0.275px] font-medium",
  micro:
    "font-geom text-[0.6875rem] leading-[1.1rem] tracking-[0.275px] font-normal",
};

const colorStyles: Record<TextColor, string> = {
  primary: "text-(--color-text-primary)",
  secondary: "text-(--color-text-secondary)",
  tertiary: "text-(--color-text-tertiary)",
  muted: "text-(--color-text-muted)",
  success: "text-(--color-success-dark)",
  warning: "text-(--color-warning-dark)",
  danger: "text-(--color-danger-dark)",
  brand: "text-(--color-brand)",
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
