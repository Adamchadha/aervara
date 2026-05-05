import { getBuildHereConcept } from "@/lib/build-here-concept";
import { BuildHereMassingGraphic } from "@/components/properties/build-here-massing-graphic";
import { cn } from "@/lib/utils";
import type { PropertyRow } from "@/types/property";

type BuildHereSectionProps = {
  property: PropertyRow;
};

export function BuildHereSection({ property }: BuildHereSectionProps) {
  const c = getBuildHereConcept(property);

  return (
    <article
      className={cn(
        "overflow-hidden rounded-2xl border border-neutral-200/55 bg-white",
        "shadow-[0_2px_10px_rgba(15,23,42,0.04),0_20px_48px_-28px_rgba(15,23,42,0.08)] ring-1 ring-neutral-950/[0.03]",
      )}
      aria-labelledby="build-here-heading"
    >
      <div className="grid gap-0 lg:grid-cols-[minmax(240px,300px)_1fr]">
        <BuildHereMassingGraphic
          concept={c}
          className="min-h-[220px] border-b border-neutral-200/50 lg:min-h-[280px] lg:border-b-0 lg:border-r lg:border-neutral-200/50"
        />
        <div className="flex flex-col justify-center px-6 py-8 md:px-9 md:py-10 lg:pl-10 lg:pr-11">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-neutral-400">
            What would I build here?
          </p>
          <h3
            id="build-here-heading"
            className="mt-3 text-lg font-semibold leading-snug tracking-tight text-neutral-950 md:text-xl"
          >
            {c.buildingType}
          </h3>

          <dl className="mt-8 grid gap-6 sm:grid-cols-3 sm:gap-5">
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                Rough floors
              </dt>
              <dd className="mt-1.5 font-mono text-2xl font-semibold tabular-nums tracking-tight text-neutral-950">
                ~{c.estimatedFloors}
              </dd>
            </div>
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                Rough units
              </dt>
              <dd className="mt-1.5 font-mono text-2xl font-semibold tabular-nums tracking-tight text-neutral-950">
                {c.unitCount != null ? `~${c.unitCount}` : "—"}
              </dd>
              <p className="mt-1 text-[11px] leading-snug text-neutral-400">
                {c.unitCount != null
                  ? "Residential-led heuristic (illustrative)"
                  : "Non-residential typology"}
              </p>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                Use mix
              </dt>
              <dd className="mt-1.5 text-sm font-medium leading-snug text-neutral-800">
                {c.useMix}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="border-t border-neutral-200/50 bg-gradient-to-b from-neutral-50/40 to-white/80 px-6 py-7 md:px-9 md:py-8">
        <p className="text-sm leading-relaxed text-neutral-600">{c.explanation}</p>
        <p className="mt-3 text-[11px] leading-relaxed text-neutral-400">
          Illustrative only. Not a surveyed parcel boundary or approved building footprint. Conceptual
          massing only—not architectural, zoning, or parking advice.
        </p>
      </div>
    </article>
  );
}
