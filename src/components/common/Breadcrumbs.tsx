import { Fragment } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

import { Text } from "@/components/ui/Text";
import { cn } from "@/lib/utils";

export interface Crumb {
  label: string;
  to?: string;
}

interface BreadcrumbsProps {
  items: Crumb[];
  className?: string;
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn("mb-4", className)}>
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <Fragment key={`${item.label}-${index}`}>
              <li className="flex items-center">
                {item.to && !isLast ? (
                  <Link
                    to={item.to}
                    className="font-geom text-[0.6875rem] font-medium leading-4 text-(--color-text-tertiary) transition-colors hover:text-(--color-brand)"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <Text
                    variant="micro"
                    color={isLast ? "primary" : "tertiary"}
                    weight={isLast ? "semibold" : "medium"}
                    className="text-[0.6875rem] leading-4"
                  >
                    {item.label}
                  </Text>
                )}
              </li>

              {!isLast && (
                <ChevronRight
                  size={11}
                  className="shrink-0 text-(--color-text-muted)"
                />
              )}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
