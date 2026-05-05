import { cn } from "@/lib/utils";

type PlanUsagePillProps = {
  propertyCount: number;
  freeLimit: number;
  isPro: boolean;
  className?: string;
};

/** Compact plan badge for the dashboard shell (server-rendered). */
export function PlanUsagePill({
  propertyCount,
  freeLimit,
  isPro,
  className,
}: PlanUsagePillProps) {
  if (isPro) {
    return (
      <span
        className={cn(
          "hidden rounded-full border border-stone-200/70 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-neutral-600 shadow-sm sm:inline-flex",
          className,
        )}
      >
        Pro
      </span>
    );
  }

  return (
    <span
      className={cn(
        "hidden rounded-full border border-stone-200/70 bg-stone-50/90 px-3 py-1 text-[11px] font-semibold tabular-nums tracking-wide text-neutral-700 shadow-sm sm:inline-flex",
        className,
      )}
    >
      {propertyCount}/{freeLimit} properties
    </span>
  );
}
