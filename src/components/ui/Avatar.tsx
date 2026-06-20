import { cn } from "@/lib/utils";

type AvatarSize = "xs" | "sm" | "md" | "lg";

interface AvatarProps {
  name: string;
  src?: string;
  size?: AvatarSize;
  className?: string;
}

const sizeMap: Record<AvatarSize, { wrapper: string; text: string }> = {
  xs: { wrapper: "h-6 w-6", text: "text-[9px]" },
  sm: { wrapper: "h-8 w-8", text: "text-[11px]" },
  md: { wrapper: "h-10 w-10", text: "text-[14px]" },
  lg: { wrapper: "h-12 w-12", text: "text-[16px]" },
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function Avatar({ name, src, size = "md", className }: AvatarProps) {
  const { wrapper, text } = sizeMap[size];

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn("rounded-full object-cover shrink-0", wrapper, className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-(--color-brand) shrink-0 shadow-sm",
        wrapper,
        className,
      )}
    >
      <span className={cn("font-semibold text-white tracking-wide", text)}>
        {getInitials(name)}
      </span>
    </div>
  );
}
