import {
  normalizePropertyStatus,
  propertyStatusBadgeClass,
  type PropertyStatus,
} from "@/lib/property-status";
import { cn } from "@/lib/utils";

type PropertyStatusBadgeProps = {
  status: string | null | undefined;
  className?: string;
};

export function PropertyStatusBadge({
  status,
  className,
}: PropertyStatusBadgeProps) {
  const s = normalizePropertyStatus(status);
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        propertyStatusBadgeClass(s),
        className,
      )}
    >
      {s}
    </span>
  );
}

export type { PropertyStatus };
