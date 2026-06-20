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
    <section className={cn("mb-8", className)}>
      {backTo && (
        <Link
          to={backTo}
          className="mb-4 inline-flex w-fit items-center gap-2 font-geom text-sm font-medium text-(--color-text-secondary) transition-colors hover:text-(--color-text-primary)"
        >
          <ArrowLeft size={16} />
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
          <Row align="center" gap={3} className="mb-1.5 min-w-0 flex-wrap">
            {typeof title === "string" ? (
              <Text
                as="h2"
                variant="heading"
                color="primary"
                weight="semibold"
                truncate
                className="text-[28px] tracking-tight leading-[34px]"
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
                className="ml-1"
              >
                {idLabel}
              </Text>
            )}
          </Row>

          {subtitle && (
            <Text
              variant="caption"
              color="secondary"
              className="mb-1 max-w-[680px]"
            >
              {subtitle}
            </Text>
          )}

          {meta && (
            <Row align="center" gap={3} className="flex-wrap">
              {meta}
            </Row>
          )}
        </div>

        <Row align="center" gap={3} className="w-full sm:w-auto mt-4 sm:mt-0">
          {actions}

          {onExport && (
            <Button
              variant="secondary"
              size="md"
              onClick={onExport}
              className="h-[40px] px-4 w-full sm:w-auto"
            >
              <Download size={16} />
              Export Details
            </Button>
          )}
        </Row>
      </Row>
    </section>
  );
}
