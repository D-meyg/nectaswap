import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface BackLinkProps {
  label: string;
  to: string;
  className?: string;
}

export function BackLink({ label, to, className }: BackLinkProps) {
  return (
    <Link
      to={to}
      className={cn(
        "inline-flex items-center gap-1.5 font-geom text-[13.5px] font-medium text-(--color-text-secondary) transition-colors hover:text-(--color-brand) focus:outline-none",
        className,
      )}
    >
      <ArrowLeft size={16} />
      {label}
    </Link>
  );
}
