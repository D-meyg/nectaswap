import { cn } from "@/lib/utils";
import { type ReactNode, useEffect } from "react";
import { X } from "lucide-react";
import { Text } from "./Text";

type DrawerSide = "right" | "left";
type DrawerSize = "sm" | "md" | "lg" | "xl";

// ── Root ──────────────────────────────────────────────────
interface DrawerProps {
  open: boolean;
  onClose: () => void;
  side?: DrawerSide;
  size?: DrawerSize;
  children: ReactNode;
  closeable?: boolean;
}

const sizeMap: Record<DrawerSize, string> = {
<<<<<<< HEAD
  sm: "w-[320px]",
  md: "w-[480px]",
  lg: "w-[600px]",
  xl: "w-[760px]",
=======
  sm: "w-80",
  md: "w-[30rem]",
  lg: "w-[37.5rem]",
  xl: "w-[47.5rem]",
>>>>>>> refactoring/dummy-data
};

function DrawerRoot({
  open,
  onClose,
  side = "right",
  size = "md",
  children,
  closeable = true,
}: DrawerProps) {
  // Body scroll lock
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Escape key
  useEffect(() => {
    if (!open || !closeable) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, closeable, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0" style={{ zIndex: "var(--z-modal)" }}>
      {/* Backdrop */}
      <div
<<<<<<< HEAD
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
=======
        className="absolute inset-0 bg-black/40 backdrop-blur-[0.125rem]"
>>>>>>> refactoring/dummy-data
        onClick={closeable ? onClose : undefined}
      />
      {/* Panel — slides in from side */}
      <div
        className={cn(
          "absolute top-0 bottom-0 flex flex-col",
          "bg-white shadow-[0_0_40px_rgba(0,0,0,0.15)]",
          sizeMap[size],
          // Position + slide animation
          side === "right"
            ? "right-0 animate-in slide-in-from-right duration-200"
            : "left-0 animate-in slide-in-from-left duration-200",
        )}
      >
        {children}
      </div>
    </div>
  );
}

// ── Header ────────────────────────────────────────────────
interface DrawerHeaderProps {
  title: string;
  subtitle?: string;
  onClose?: () => void;
  className?: string;
}

function DrawerHeader({
  title,
  subtitle,
  onClose,
  className,
}: DrawerHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-4 px-5 py-4 shrink-0",
<<<<<<< HEAD
        "border-b border-[var(--color-border)]",
=======
        "border-b border-(--color-border)",
>>>>>>> refactoring/dummy-data
        className,
      )}
    >
      <div>
        <Text variant="subtitle" color="primary">
          {title}
        </Text>
        {subtitle && (
          <Text variant="micro" color="tertiary" className="mt-0.5">
            {subtitle}
          </Text>
        )}
      </div>
      {onClose && (
        <button
          onClick={onClose}
<<<<<<< HEAD
          className="flex h-7 w-7 items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-subtle)] hover:text-[var(--color-text-primary)] transition-colors"
=======
          className="flex h-7 w-7 items-center justify-center rounded-(--radius-sm) text-(--color-text-tertiary) hover:bg-(--color-bg-subtle) hover:text-(--color-text-primary) transition-colors"
>>>>>>> refactoring/dummy-data
          aria-label="Close drawer"
        >
          <X size={15} />
        </button>
      )}
    </div>
  );
}

// ── Body ──────────────────────────────────────────────────
function DrawerBody({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex-1 overflow-y-auto px-5 py-4", className)}>
      {children}
    </div>
  );
}

// ── Footer ────────────────────────────────────────────────
function DrawerFooter({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-end gap-2 px-5 py-4 shrink-0",
<<<<<<< HEAD
        "border-t border-[var(--color-border)] bg-[var(--color-bg-subtle)]",
=======
        "border-t border-(--color-border) bg-(--color-bg-subtle)",
>>>>>>> refactoring/dummy-data
        className,
      )}
    >
      {children}
    </div>
  );
}

// ── Composed export ───────────────────────────────────────
export const Drawer = Object.assign(DrawerRoot, {
  Header: DrawerHeader,
  Body: DrawerBody,
  Footer: DrawerFooter,
});