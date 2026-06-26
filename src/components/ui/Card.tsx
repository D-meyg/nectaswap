import { cn } from "@/lib/utils";
import { type ReactNode } from "react";
import { Text } from "./Text";

interface CardProps {
  className?: string;
  children: ReactNode;
  noPadding?: boolean;
}

function CardRoot({ className, children }: CardProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-[8px] border border-[var(--color-border)] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.03)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
  children?: ReactNode;
}

function CardHeader({
  title,
  subtitle,
  action,
  className,
  children,
}: CardHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 border-b border-(--color-border) px-5 py-4",
        className,
      )}
    >
      {children ?? (
        <div className="min-w-0 flex-1">
          {title && (
            <Text variant="subtitle" color="primary" weight="semibold" truncate>
              {title}
            </Text>
          )}

          {subtitle && (
            <Text variant="micro" color="tertiary" className="mt-0.5">
              {subtitle}
            </Text>
          )}
        </div>
      )}

      {action && (
        <div className="flex shrink-0 items-center gap-3">{action}</div>
      )}
    </div>
  );
}

interface CardBodyProps {
  className?: string;
  children: ReactNode;
  padded?: boolean;
}

function CardBody({ className, children, padded }: CardBodyProps) {
  return (
    <div className={cn(padded && "p-5 sm:p-6", className)}>{children}</div>
  );
}

interface CardFooterProps {
  className?: string;
  children: ReactNode;
}

function CardFooter({ className, children }: CardFooterProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 border-t border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-5 py-4",
        className,
      )}
    >
      {children}
    </div>
  );
}

interface CardSectionProps {
  className?: string;
  children: ReactNode;
}

function CardSection({ className, children }: CardSectionProps) {
  return (
    <div
      className={cn(
        "border-b border-[var(--color-border)] px-5 py-4 last:border-b-0",
        className,
      )}
    >
      {children}
    </div>
  );
}

export const Card = Object.assign(CardRoot, {
  Header: CardHeader,
  Body: CardBody,
  Footer: CardFooter,
  Section: CardSection,
});
