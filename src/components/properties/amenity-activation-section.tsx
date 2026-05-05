import {
  buildAmenityScenarios,
  type AmenityFeasibility,
} from "@/lib/amenity-activation";
import { formatMoney, formatMoneyUsd, formatSqft } from "@/lib/far-calculations";
import { cn } from "@/lib/utils";

function FeasibilityPill({ level }: { level: AmenityFeasibility }) {
  const styles: Record<AmenityFeasibility, string> = {
    High:
      "border-stone-300/80 bg-stone-50 text-neutral-800 ring-1 ring-stone-900/[0.04]",
    Moderate:
      "border-stone-200/90 bg-white text-neutral-700 ring-1 ring-stone-900/[0.025]",
    Low: "border-stone-200/70 bg-white/80 text-neutral-600 ring-1 ring-stone-900/[0.02]",
  };
  return (
    <span
      className={cn(
        "inline-flex shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em]",
        styles[level],
      )}
    >
      {level}
    </span>
  );
}

function rentableBasisLabel(
  rentableBasis: "total_buildable" | "unused_buildable",
): string {
  return rentableBasis === "total_buildable"
    ? "Total buildable area (lot × max FAR)"
    : "Unused buildable area (envelope slack)";
}

type AmenityActivationSectionProps = {
  unusedBuildableSqft: number;
  /** Lot × max FAR; scales rent premium for roof / terrace / mixed-base programs. */
  totalBuildableSqft: number;
  /** When true, omit section title (parent `SiteRoomSection` supplies heading). */
  embedded?: boolean;
};

export function AmenityActivationSection({
  unusedBuildableSqft,
  totalBuildableSqft,
  embedded = false,
}: AmenityActivationSectionProps) {
  const scenarios = buildAmenityScenarios({
    unusedBuildableSqft,
    totalBuildableSqft,
  });

  return (
    <div className="max-w-3xl">
      <div
        className={cn(embedded ? "pb-6" : "border-b border-stone-100/90 pb-8")}
      >
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
          Envelope screening
        </p>
        {!embedded ? (
          <>
            <h3 className="mt-3 text-lg font-semibold tracking-tight text-neutral-950">
              Amenity activation potential
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-600">
              Unused envelope can support more than units — it can create differentiated
              tenant and resident experiences.
            </p>
          </>
        ) : null}
        <p
          className={cn(
            "max-w-2xl text-sm leading-relaxed text-neutral-600",
            embedded ? "mt-2" : "mt-3",
          )}
        >
          Aervara does not only identify unused capacity — it suggests how that capacity
          could become a differentiated leasing and retention advantage.
        </p>
        <p
          className={cn(
            "text-xs font-medium tabular-nums text-neutral-500",
            embedded ? "mt-3" : "mt-4",
          )}
        >
          Unused buildable area (screening input):{" "}
          <span className="font-mono text-neutral-800">
            {formatSqft(unusedBuildableSqft)} sq ft
          </span>
        </p>
        <p className="mt-1 text-xs text-neutral-500">
          Total buildable area:{" "}
          <span className="font-mono text-neutral-800">
            {formatSqft(totalBuildableSqft)} sq ft
          </span>
        </p>
        <p className="mt-3 text-xs font-medium leading-relaxed text-neutral-500">
          Directional estimate for screening — not underwriting
        </p>
      </div>

      <ul className="mt-8 divide-y divide-stone-200/55">
        {scenarios.map((s) => {
          const y = s.yield;
          return (
            <li key={s.id} className="px-1 py-6 sm:py-7">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h4 className="text-[0.9375rem] font-semibold tracking-tight text-neutral-950">
                  {s.name}
                </h4>
                <FeasibilityPill level={s.feasibility} />
              </div>
              <p className="mt-2.5 text-sm leading-relaxed text-neutral-600">
                {s.description}
              </p>
              <p className="mt-3 text-xs leading-relaxed text-neutral-500">
                <span className="font-medium text-neutral-600">Why it matters: </span>
                {s.valueNote}
              </p>

              <div className="mt-4 pt-1">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
                  Amenity yield
                </p>
                <dl className="mt-3 space-y-2 text-xs text-neutral-600">
                  <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
                    <dt className="shrink-0 text-neutral-500">Rent premium (gross / sq ft / yr)</dt>
                    <dd className="text-right font-mono text-[0.8125rem] text-neutral-900">
                      +{formatMoneyUsd(y.premiumPerSqftLow, 2)} –{" "}
                      {formatMoneyUsd(y.premiumPerSqftHigh, 2)} / sq ft
                    </dd>
                  </div>
                  <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
                    <dt className="shrink-0 text-neutral-500">
                      {rentableBasisLabel(y.rentableBasis)}
                    </dt>
                    <dd className="text-right font-mono text-[0.8125rem] text-neutral-800">
                      {formatSqft(y.rentableSqft)} sq ft
                    </dd>
                  </div>
                  <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
                    <dt className="shrink-0 text-neutral-500">Est. annual NOI uplift</dt>
                    <dd className="text-right font-mono text-[0.8125rem] font-medium text-neutral-900">
                      {formatMoney(y.annualNoiUpliftLow)} – {formatMoney(y.annualNoiUpliftHigh)} / yr
                    </dd>
                  </div>
                </dl>
                <p className="mt-2 text-[10px] leading-relaxed text-neutral-400">
                  Annualized as rent premium × rentable area; does not net operating
                  expenses or capital cost.
                </p>
              </div>
            </li>
          );
        })}
      </ul>

      <p className="mt-8 border-t border-stone-200/65 pt-4 text-xs leading-relaxed text-neutral-600">
        Typical recreational courts and amenity decks require meaningful clear area,
        structural capacity, access, and zoning review. Aervara treats this as an early
        screening signal, not design advice.
      </p>
    </div>
  );
}
