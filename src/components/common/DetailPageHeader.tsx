import type { ReactNode } from "react";
import { ArrowLeft, Download } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Text";
import { Row } from "@/components/ui/Row";
import { cn } from "@/lib/utils";

interface DetailPageHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  statusPill?: ReactNode;
  idLabel?: ReactNode;
  meta?: ReactNode;
  actions?: ReactNode;
  backLabel?: string;
  backTo?: string;
  onExport?: () => void;
  className?: string;
}

export function DetailPageHeader({
  title,
  subtitle,
  statusPill,
  idLabel,
  meta,
  actions,
  backLabel,
  backTo,
  onExport,
  className,
}: DetailPageHeaderProps) {
  return (
    <section className={cn("mb-4", className)}>
      {backTo && (
        <Link
          to={backTo}
          className="mb-3 inline-flex w-fit items-center gap-1.5 font-geom text-[0.6875rem] font-medium leading-4 text-(--color-text-secondary) transition-colors hover:text-(--color-text-primary)"
        >
          <ArrowLeft size={12} />
          {backLabel || "Back"}
        </Link>
      )}

      <Row
        align="start"
        justify="between"
        gap={4}
        className="flex-col sm:flex-row"
      >
        <div className="min-w-0">
          <Row align="center" gap={2} className="mb-1 min-w-0 flex-wrap">
            {typeof title === "string" ? (
              <Text
                as="h2"
                variant="heading"
                color="primary"
                weight="semibold"
                truncate
                className="text-[1.375rem] leading-7"
              >
                {title}
              </Text>
            ) : (
              title
            )}

            {statusPill}

            {idLabel && (
              <Text
                variant="caption"
                color="secondary"
                weight="medium"
                as="span"
                className="ml-1 text-[0.6875rem]"
              >
                {idLabel}
              </Text>
            )}
          </Row>

          {subtitle && (
            <Text
              variant="caption"
              color="secondary"
              className="mb-1 max-w-[42.5rem] text-[0.6875rem] leading-4"
            >
              {subtitle}
            </Text>
          )}

          {meta && (
            <Row align="center" gap={2} className="flex-wrap [&_p]:text-[0.6875rem] [&_span]:text-[0.6875rem]">
              {meta}
            </Row>
          )}
        </div>

        <Row align="center" gap={2} className="w-full sm:w-auto mt-3 sm:mt-0">
          {actions}

          {onExport && (
            <Button
              variant="secondary"
              size="md"
              onClick={onExport}
              className="h-8 px-3 text-[0.6875rem] w-full sm:w-auto"
            >
              <Download size={13} />
              Export Details
            </Button>
          )}
        </Row>
      </Row>
    </section>
  );
}
