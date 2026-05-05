import {
  computeOpportunityMetrics,
  formatFar,
  formatMoney,
  formatScorePercent,
  formatSqft,
} from "@/lib/far-calculations";
import { cn } from "@/lib/utils";

type PropertyMetricsProps = {
  lotSizeSqft: number;
  builtFloorAreaSqft: number;
  maxFar: number;
  estimatedValuePerSqft?: number | null;
  className?: string;
  dense?: boolean;
};

export function PropertyMetrics({
  lotSizeSqft,
  builtFloorAreaSqft,
  maxFar,
  estimatedValuePerSqft = null,
  className,
  dense,
}: PropertyMetricsProps) {
  const m = computeOpportunityMetrics(
    lotSizeSqft,
    builtFloorAreaSqft,
    maxFar,
    estimatedValuePerSqft,
  );

  const items = [
    { label: "Max buildable area", value: `${formatSqft(m.max_buildable_sqft)} sq ft` },
    { label: "Current built FAR", value: formatFar(m.current_built_far) },
    {
      label: "Unused vertical capacity",
      value: formatFar(m.unused_vertical_capacity),
    },
    {
      label: "Unused buildable area",
      value: `${formatSqft(m.unused_buildable_sqft)} sq ft`,
    },
    { label: "Underbuilt score", value: formatScorePercent(m.underbuilt_score) },
    { label: "Air rights value", value: formatMoney(m.air_rights_value) },
  ];

  return (
    <dl
      className={cn(
        "grid gap-4 sm:grid-cols-2",
        dense && "gap-3 sm:grid-cols-3 lg:grid-cols-6",
        className,
      )}
    >
      {items.map(({ label, value }) => (
        <div
          key={label}
          className={cn(
            "rounded-md border border-neutral-100 bg-neutral-50/80 px-4 py-3",
            label === "Air rights value" &&
              "border-neutral-900/15 bg-white shadow-sm",
          )}
        >
          <dt className="text-xs font-medium uppercase tracking-wide text-neutral-500">
            {label}
          </dt>
          <dd className="mt-1 font-mono text-sm font-semibold tabular-nums text-neutral-950">
            {value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
