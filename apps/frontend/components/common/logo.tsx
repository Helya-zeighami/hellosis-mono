import { HugeiconsIcon } from "@hugeicons/react";
import { FlowerIcon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";

export function LogoMark({
  className,
  iconClassName,
}: {
  className?: string;
  iconClassName?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex size-9 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-rose-700 text-white shadow-sm",
        className,
      )}
    >
      <HugeiconsIcon icon={FlowerIcon} className={cn("size-5", iconClassName)} />
    </span>
  );
}

export function Logo({
  className,
  markClassName,
  textClassName,
}: {
  className?: string;
  markClassName?: string;
  textClassName?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark className={markClassName} />
      <span
        className={cn(
          "font-heading text-xl font-semibold tracking-tight text-foreground",
          textClassName,
        )}
      >
        Hellosis
      </span>
    </span>
  );
}
