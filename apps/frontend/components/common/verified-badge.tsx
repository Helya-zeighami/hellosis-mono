import { HugeiconsIcon } from "@hugeicons/react";
import { ShieldCheck } from "@hugeicons/core-free-icons";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function VerifiedBadge({
  label,
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1 border-success/30 bg-success/10 text-success dark:bg-success/15",
        className,
      )}
    >
      <HugeiconsIcon icon={ShieldCheck} />
      {label ?? "Verified"}
    </Badge>
  );
}
