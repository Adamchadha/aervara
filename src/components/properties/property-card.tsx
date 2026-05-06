import { PublicDemoPropertyLink } from "@/components/demo/public-demo-property-link";
import { AnimatedMoneyValue } from "@/components/ui/animated-money-value";
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
import { computeDealConfidence } from "@/lib/deal-confidence";
import { getDealMemo } from "@/lib/deal-memo";
import { getOpportunityEngineRead } from "@/lib/opportunity-engine";
import { DealConfidenceMeter } from "@/components/properties/deal-confidence-meter";
import { FarVerticalCapacityBar } from "@/components/properties/far-vertical-capacity-bar";
import {
  computeOpportunityScoreForProperty,
  opportunityPriorityLabel,
} from "@/lib/opportunity-score";
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
  /** Preserve `?demo=true` on the Site Room link. */
  isDemo?: boolean;
  /** Standalone `/demo` workspace detail route. */
  publicDemo?: boolean;
  /** Override Site Room / detail href (e.g. `/demo/properties/…`). */
  detailHref?: string;
  /** Optional precomputed dashboard score (0-100). */
  opportunityScore?: number;
  /** Lighter frame for long pipeline lists (reduced border weight). */
  surface?: "default" | "airy" | "pipeline";
};

export function PropertyCard({
  property: p,
  emphasize = false,
  highlightLabel,
  isDemo = false,
  publicDemo = false,
  detailHref,
  opportunityScore,
  surface = "default",
}: PropertyCardProps) {
  const m = getDisplayMetricsForRow(p);
  const dev = getDevelopmentAnalysisForProperty(p);
  const read = getOpportunityEngineRead(p);
  const dealMemo = getDealMemo(p, read);
  const confidence = computeDealConfidence({
    opportunityValue: m.opportunity_value,
    underbuiltScore: m.underbuilt_score,
    complexityScore: read.complexityScore,
    speedToValueScore: read.speedToValueScore,
  });
  const tier = underbuiltTier(m.underbuilt_score);
  const badgeClass = underbuiltBadgeClass(tier);
  const tierLabel =
    tier === "high"
      ? "High opportunity"
      : tier === "medium"
        ? "Medium opportunity"
        : "Low opportunity";
  const score =
    typeof opportunityScore === "number"
      ? Math.round(opportunityScore)
      : computeOpportunityScoreForProperty(p);
  const scoreLabel = opportunityPriorityLabel(score);

  if (surface === "pipeline") {
    return (
      <article
        className={cn(
          "flex flex-col rounded-xl border border-stone-200/55 bg-white/95 px-5 py-5",
          "shadow-[0_10px_36px_-26px_rgba(15,23,42,0.12)] ring-1 ring-stone-900/[0.03]",
          "transition-[box-shadow,transform] duration-300 ease-out",
          "hover:-translate-y-0.5 hover:shadow-[0_16px_44px_-28px_rgba(15,23,42,0.14)]",
          "motion-reduce:transition-none motion-reduce:hover:translate-y-0",
          emphasize && "border-emerald-200/40 ring-emerald-900/[0.06]",
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold leading-snug text-neutral-950">
              {p.address}
            </h3>
            <p className="mt-1 text-xs text-neutral-500">
              {p.city}, {p.state}
            </p>
          </div>
          {emphasize ? (
            <span className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-700">
              Top
            </span>
          ) : null}
        </div>
        <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
          Implied upside
        </p>
        <AnimatedMoneyValue
          amount={m.air_rights_value}
          className="mt-1 text-xl font-bold tabular-nums tracking-tight text-neutral-950 sm:text-2xl"
        />
        <div className="mt-3 max-w-full">
          <DealConfidenceMeter confidence={confidence} compact />
        </div>
        <div className="mt-3 flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1 text-xs text-neutral-600">
          <span>
            Score{" "}
            <span className="font-bold tabular-nums text-neutral-900">{score}</span>
          </span>
          <span className="text-neutral-500">{scoreLabel}</span>
        </div>
        <div className="mt-4 flex justify-end border-t border-stone-100/90 pt-3">
          <PublicDemoPropertyLink
            propertyId={p.id}
            isDemo={isDemo}
            publicDemo={publicDemo}
            detailHref={detailHref}
            className="text-sm font-semibold text-emerald-600 transition-colors hover:text-emerald-500"
          >
            Open deal →
          </PublicDemoPropertyLink>
        </div>
      </article>
    );
  }

  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-[1.35rem] border bg-white",
        surface === "airy" &&
          !emphasize &&
          "border-stone-100/60 shadow-[0_12px_40px_-28px_rgba(15,23,42,0.1)] ring-0",
        surface === "airy" &&
          emphasize &&
          "border-emerald-200/30 bg-gradient-to-b from-emerald-50/25 via-white to-white shadow-[0_12px_44px_-28px_rgba(15,23,42,0.1)] ring-1 ring-emerald-800/[0.04]",
        surface === "default" &&
          (emphasize
            ? "border-stone-200/50 bg-gradient-to-b from-stone-50/95 via-white to-white shadow-[0_2px_8px_rgba(15,23,42,0.03),0_28px_64px_-24px_rgba(15,23,42,0.1)] ring-1 ring-stone-900/[0.035]"
            : "border-stone-200/45 shadow-[0_2px_8px_rgba(15,23,42,0.025),0_22px_56px_-28px_rgba(15,23,42,0.09)] ring-1 ring-stone-900/[0.028]"),
        "transition-[box-shadow,transform,border-color] duration-[520ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform",
        surface === "airy"
          ? "hover:-translate-y-0.5 hover:border-stone-200/50 hover:shadow-[0_20px_50px_-32px_rgba(15,23,42,0.12)]"
          : "hover:-translate-y-0.5 hover:scale-[1.006] hover:border-stone-200/70 hover:shadow-[0_18px_48px_-20px_rgba(15,23,42,0.12),0_6px_20px_-8px_rgba(15,23,42,0.06)]",
        "motion-reduce:transition-none motion-reduce:hover:translate-y-0",
        surface === "default" && "motion-reduce:hover:scale-100",
        surface === "airy" && emphasize && "hover:scale-100",
      )}
    >
      {/* Dominant opportunity block */}
      <div className="px-10 pb-12 pt-12 sm:px-12 sm:pt-14">
        {highlightLabel ? (
          <p
            className={cn(
              "mb-5 inline-flex rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] shadow-sm",
              surface === "airy" && emphasize
                ? "border-emerald-200/60 bg-emerald-50/50 text-emerald-900 ring-1 ring-emerald-800/[0.08]"
                : "border-neutral-200/80 bg-white/90 text-neutral-600 ring-1 ring-neutral-950/[0.04]",
            )}
          >
            {highlightLabel}
          </p>
        ) : null}
        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-neutral-400">
          Air rights value
        </p>
        <AnimatedMoneyValue
          amount={m.air_rights_value}
          className="mt-5 text-[2.4rem] font-semibold tracking-[-0.035em] text-neutral-950 tabular-nums sm:text-5xl sm:tracking-[-0.04em] lg:text-[3.5rem] lg:leading-[1.02]"
        />
        <p className="mt-5 max-w-[22rem] text-[0.9375rem] leading-relaxed text-neutral-500">
          Capitalized value of unbuilt air rights above the existing envelope.
        </p>
        <div className="mt-6 rounded-xl border border-stone-200/70 bg-white/70 px-4 py-3 text-[12px] leading-relaxed text-neutral-600">
          <span className="font-semibold uppercase tracking-[0.1em] text-neutral-400">
            Why this matters
          </span>
          <p className="mt-1.5">
            Air rights are the vertical capacity not yet built. When that capacity
            is material, the site supports premium repositioning optionality.
          </p>
        </div>
        <div className="mt-7 max-w-[22rem]">
          <DealConfidenceMeter confidence={confidence} compact />
        </div>
        <div className="mt-5 inline-flex items-center gap-2 rounded-lg border border-stone-200/80 bg-white/90 px-3 py-2 text-xs">
          <span className="font-semibold text-neutral-900">Opportunity Score {score}</span>
          <span className="text-neutral-500">· {scoreLabel}</span>
        </div>
      </div>

      <div
        className={cn(
          "mx-10 h-px bg-gradient-to-r from-transparent to-transparent sm:mx-12",
          surface === "airy" ? "via-stone-200/20" : "via-stone-200/40",
        )}
        aria-hidden
      />

      {/* Identity + score */}
      <div className="flex items-start justify-between gap-6 px-10 pb-10 pt-9 sm:px-12">
        <div className="min-w-0 flex-1">
          <h2 className="text-[1.05rem] font-semibold leading-snug tracking-tight text-neutral-950">
            {p.address}
          </h2>
          <p className="mt-2.5 text-sm font-normal leading-relaxed text-neutral-500">
            {p.city}, {p.state}
          </p>
          <div className="mt-4">
            <PropertyStatusBadge status={p.status} />
          </div>
          <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
            Zoning
          </p>
          <p className="mt-1.5 text-sm leading-snug text-neutral-700">
            {p.zoning_district}
          </p>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold tabular-nums tracking-tight",
            badgeClass,
          )}
          title={tierLabel}
        >
          {formatScorePercent(m.underbuilt_score)}
        </span>
      </div>

      <div className="px-10 pb-10 sm:px-12">
        <div
          className="rounded-2xl bg-gradient-to-b from-stone-50/90 to-white/70 p-7 shadow-[inset_0_1px_0_rgba(255,255,255,0.95)] ring-1 ring-stone-900/[0.04] transition-shadow duration-500 ease-out group-hover:shadow-[inset_0_1px_0_rgba(255,255,255,1),0_1px_0_rgba(28,25,23,0.04)]"
          aria-labelledby="aervara-read-heading"
        >
          <div className="flex gap-5">
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
              <p className="mt-3 text-[15px] font-semibold leading-snug tracking-tight text-neutral-950 sm:text-base">
                {read.recommendedPlay}
              </p>
              <div className="mt-5 space-y-2 text-xs leading-snug text-neutral-600">
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
              <div className="mt-5 flex flex-wrap gap-2">
                {read.keyFlags.slice(0, 2).map((flag) => (
                  <span
                    key={flag}
                    className="inline-flex rounded-full border border-neutral-200/60 bg-white px-3 py-1 text-[11px] font-medium text-neutral-700 shadow-sm ring-1 ring-neutral-950/[0.03]"
                  >
                    {flag}
                  </span>
                ))}
              </div>
              <p className="mt-5 border-t border-neutral-200/35 pt-4 text-[11px] leading-snug text-neutral-600">
                <span className="font-semibold uppercase tracking-[0.12em] text-neutral-400">
                  Next step
                </span>
                <span className="mt-1.5 block font-medium text-neutral-800">
                  {dealMemo.suggestedNextStep}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div
        className={cn(
          "mx-10 h-px bg-gradient-to-r from-transparent to-transparent sm:mx-12",
          surface === "airy" ? "via-stone-200/20" : "via-stone-200/35",
        )}
      />

      {/* Metrics — label / value rows for alignment */}
      <div className="flex flex-1 flex-col px-10 pb-2 pt-10 sm:px-12">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
          Parcel metrics
        </p>
        <div className="mt-4 grid gap-0 sm:grid-cols-2 sm:gap-x-12">
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
            label="Unused vertical capacity"
            value={formatFar(m.unused_vertical_capacity)}
          />
          <MetricRow
            label="Unused (sq ft)"
            value={formatSqft(m.unused_buildable_sqft)}
          />
        </div>

        <div className="mt-8 pt-8">
          <div className="mb-6 h-px bg-gradient-to-r from-transparent via-neutral-200/40 to-transparent" />
          <div className="grid gap-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
            <FarBuildoutGauge
              compact
              currentBuiltFar={m.current_built_far}
              maxFar={num(p.max_far)}
              remainingFar={m.unused_vertical_capacity}
            />
            <FarVerticalCapacityBar
              builtFar={m.current_built_far}
              maxFar={num(p.max_far)}
            />
          </div>
        </div>

        <div className="mt-8 pt-8">
          <div className="mb-6 h-px bg-gradient-to-r from-transparent via-neutral-200/40 to-transparent" />
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
            Development snapshot
          </p>
          <div className="mt-4 grid grid-cols-3 gap-4 sm:gap-5">
            <div>
              <p className="text-[10px] font-medium text-neutral-400">Profit</p>
              <AnimatedMoneyValue
                amount={dev.estimated_profit}
                className="mt-1.5 font-mono text-base font-semibold tabular-nums tracking-tight text-neutral-950 sm:text-lg"
              />
            </div>
            <div>
              <p className="text-[10px] font-medium text-neutral-400">Cost</p>
              <p className="mt-1.5 font-mono text-base font-semibold tabular-nums tracking-tight text-neutral-950 sm:text-lg">
                {formatMoney(dev.total_cost)}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-medium text-neutral-400">
                Proj. value
              </p>
              <p className="mt-1.5 font-mono text-base font-semibold tabular-nums tracking-tight text-neutral-950 sm:text-lg">
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

        <div className="mt-auto flex justify-end pb-7 pt-7">
          <PublicDemoPropertyLink
            propertyId={p.id}
            isDemo={isDemo}
            publicDemo={publicDemo}
            detailHref={detailHref}
            className="rounded-lg px-2 py-1 text-sm font-semibold text-neutral-950 underline-offset-4 transition-colors hover:bg-neutral-100/80 hover:underline"
          >
            View details
          </PublicDemoPropertyLink>
        </div>
      </div>
    </article>
  );
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-6 border-b border-neutral-100/35 py-3 sm:border-0 sm:py-2.5">
      <dt className="text-[11px] font-medium uppercase tracking-wide text-neutral-400">
        {label}
      </dt>
      <dd className="text-right font-mono text-[0.9375rem] font-medium tabular-nums text-neutral-900">
        {value}
      </dd>
    </div>
  );
}
