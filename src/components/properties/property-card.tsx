import Link from "next/link";
import {
  formatFar,
  formatMoney,
  formatMoneyUsd,
  formatScorePercent,
  formatSqft,
  underbuiltBadgeClass,
  underbuiltTier,
} from "@/lib/far-calculations";
import { getDisplayMetricsForRow } from "@/lib/property-display-metrics";
import { getDevelopmentAnalysisForProperty } from "@/lib/development-analysis";
import { FarBuildoutGauge } from "@/components/properties/far-buildout-gauge";
import { PropertyStatusBadge } from "@/components/properties/property-status-badge";
import { getOpportunityEngineRead } from "@/lib/opportunity-engine";
import { cn } from "@/lib/utils";
import type { PropertyRow } from "@/types/property";

function num(v: unknown): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

type PropertyCardProps = {
  property: PropertyRow;
  /** Stronger frame and tint for dashboard “top picks”. */
  emphasize?: boolean;
  /** Optional pill above the hero metric (e.g. “Top deal”). */
  highlightLabel?: string;
};

export function PropertyCard({
  property: p,
  emphasize = false,
  highlightLabel,
}: PropertyCardProps) {
  const m = getDisplayMetricsForRow(p);
  const dev = getDevelopmentAnalysisForProperty(p);
  const read = getOpportunityEngineRead(p);
  const tier = underbuiltTier(m.underbuilt_score);
  const badgeClass = underbuiltBadgeClass(tier);
  const tierLabel =
    tier === "high"
      ? "High opportunity"
      : tier === "medium"
        ? "Medium opportunity"
        : "Low opportunity";

  return (
    <article
      className={cn(
        "flex h-full flex-col overflow-hidden rounded-2xl border bg-white",
        emphasize
          ? "border-amber-200/70 bg-gradient-to-b from-amber-50/70 via-white to-white shadow-[0_2px_12px_rgba(180,83,9,0.08),0_24px_48px_-16px_rgba(15,23,42,0.08)] ring-1 ring-amber-400/25"
          : "border-neutral-200/50 shadow-[0_2px_8px_rgba(15,23,42,0.04),0_20px_48px_-20px_rgba(15,23,42,0.07)] ring-1 ring-neutral-950/[0.035]",
        "transition-[box-shadow,transform] duration-300 hover:shadow-[0_8px_32px_-8px_rgba(15,23,42,0.1)]",
      )}
    >
      {/* Dominant opportunity block */}
      <div className="px-8 pb-9 pt-9">
        {highlightLabel ? (
          <p className="mb-4 inline-flex rounded-full border border-amber-200/80 bg-amber-100/90 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-amber-950">
            {highlightLabel}
          </p>
        ) : null}
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-neutral-400">
          Opportunity value
        </p>
        <p className="mt-3 text-4xl font-semibold tracking-tight text-neutral-950 tabular-nums sm:text-5xl sm:tracking-tighter">
          {formatMoney(m.opportunity_value)}
        </p>
        <p className="mt-3 max-w-[20rem] text-sm leading-relaxed text-neutral-500">
          Implied upside from unused buildable area
        </p>
      </div>

      <div
        className="mx-8 h-px bg-gradient-to-r from-transparent via-neutral-200/50 to-transparent"
        aria-hidden
      />

      {/* Identity + score */}
      <div className="flex items-start justify-between gap-4 px-8 pb-8 pt-7">
        <div className="min-w-0 flex-1">
          <h2 className="text-[15px] font-semibold leading-snug tracking-tight text-neutral-950">
            {p.address}
          </h2>
          <p className="mt-1.5 text-sm text-neutral-500">
            {p.city}, {p.state}
          </p>
          <div className="mt-3">
            <PropertyStatusBadge status={p.status} />
          </div>
          <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
            Zoning
          </p>
          <p className="mt-1 text-sm leading-snug text-neutral-700">
            {p.zoning_district}
          </p>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold tabular-nums tracking-tight",
            badgeClass,
          )}
          title={tierLabel}
        >
          {formatScorePercent(m.underbuilt_score)}
        </span>
      </div>

      <div className="px-8 pb-8">
        <div
          className="rounded-2xl bg-gradient-to-b from-neutral-50/95 to-white/40 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] ring-1 ring-neutral-950/[0.06]"
          aria-labelledby="aervara-read-heading"
        >
          <div className="flex gap-4">
            <div
              className="w-1 shrink-0 rounded-full bg-neutral-900/90"
              aria-hidden
            />
            <div className="min-w-0 flex-1">
              <p
                id="aervara-read-heading"
                className="text-[10px] font-bold uppercase tracking-[0.26em] text-neutral-500"
              >
                Aervara Read
              </p>
              <p className="mt-2.5 text-[15px] font-semibold leading-snug tracking-tight text-neutral-950">
                {read.recommendedPlay}
              </p>
              <div className="mt-4 space-y-1.5 text-xs leading-snug text-neutral-600">
                <p>
                  <span className="text-neutral-400">Complexity</span>{" "}
                  <span className="font-medium text-neutral-800">
                    {read.complexityLabel}
                  </span>
                </p>
                <p>
                  <span className="text-neutral-400">Speed-to-value</span>{" "}
                  <span className="font-medium text-neutral-800">
                    {read.speedToValueLabel}
                  </span>
                </p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {read.keyFlags.slice(0, 2).map((flag) => (
                  <span
                    key={flag}
                    className="inline-flex rounded-full border border-neutral-200/70 bg-white/80 px-3 py-1 text-[11px] font-medium text-neutral-700 shadow-sm"
                  >
                    {flag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-8 h-px bg-gradient-to-r from-transparent via-neutral-200/50 to-transparent" />

      {/* Metrics — label / value rows for alignment */}
      <div className="flex flex-1 flex-col px-8 pb-2 pt-7">
        <div className="grid gap-0 sm:grid-cols-2 sm:gap-x-10">
          <MetricRow
            label="Lot (sq ft)"
            value={formatSqft(num(p.lot_size_sqft))}
          />
          <MetricRow
            label="Built (sq ft)"
            value={formatSqft(num(p.built_floor_area_sqft))}
          />
          <MetricRow label="Max FAR" value={formatFar(num(p.max_far))} />
          <MetricRow
            label="Built FAR"
            value={formatFar(m.current_built_far)}
          />
          <MetricRow
            label="Remaining FAR"
            value={formatFar(m.remaining_far)}
          />
          <MetricRow
            label="Unused (sq ft)"
            value={formatSqft(m.unused_buildable_sqft)}
          />
        </div>

        <div className="mt-6 pt-6">
          <div className="mb-5 h-px bg-gradient-to-r from-transparent via-neutral-200/45 to-transparent" />
          <FarBuildoutGauge
            compact
            currentBuiltFar={m.current_built_far}
            maxFar={num(p.max_far)}
            remainingFar={m.remaining_far}
          />
        </div>

        <div className="mt-6 pt-6">
          <div className="mb-5 h-px bg-gradient-to-r from-transparent via-neutral-200/45 to-transparent" />
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
            Development
          </p>
          <div className="mt-4 grid grid-cols-3 gap-4">
            <div>
              <p className="text-[10px] font-medium text-neutral-400">Profit</p>
              <p className="mt-1 font-mono text-base font-semibold tabular-nums tracking-tight text-neutral-950">
                {formatMoney(dev.estimated_profit)}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-medium text-neutral-400">Cost</p>
              <p className="mt-1 font-mono text-base font-semibold tabular-nums tracking-tight text-neutral-950">
                {formatMoney(dev.total_cost)}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-medium text-neutral-400">
                Proj. value
              </p>
              <p className="mt-1 font-mono text-base font-semibold tabular-nums tracking-tight text-neutral-950">
                {formatMoney(dev.project_value)}
              </p>
            </div>
          </div>
        </div>

        {p.estimated_value_per_sqft != null ? (
          <div className="mt-5">
            <div className="mb-5 h-px bg-gradient-to-r from-transparent via-neutral-200/45 to-transparent" />
            <p className="text-sm text-neutral-500">
              Model rate{" "}
              <span className="font-mono font-medium tabular-nums text-neutral-700">
                {formatMoneyUsd(num(p.estimated_value_per_sqft), 2)}
              </span>{" "}
              / buildable sq ft
            </p>
          </div>
        ) : null}

        <div className="mt-auto flex justify-end pb-6 pt-6">
          <Link
            href={`/properties/${p.id}`}
            className="text-sm font-semibold text-neutral-950 underline-offset-4 hover:underline"
          >
            View details
          </Link>
        </div>
      </div>
    </article>
  );
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-6 border-b border-neutral-100/40 py-2.5 sm:border-0 sm:py-2.5">
      <dt className="text-[11px] font-medium uppercase tracking-wide text-neutral-400">
        {label}
      </dt>
      <dd className="text-right font-mono text-sm font-medium tabular-nums text-neutral-900">
        {value}
      </dd>
    </div>
  );
}
