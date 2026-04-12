import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PropertyDetailActions } from "@/components/properties/property-detail-actions";
import { PropertyDetailStatusForm } from "@/components/properties/property-detail-status-form";
import {
  formatFar,
  formatMoney,
  formatMoneyUsd,
  formatScorePercent,
  formatSqft,
} from "@/lib/far-calculations";
import { FarBuildoutGauge } from "@/components/properties/far-buildout-gauge";
import { DealMemoPanel } from "@/components/properties/deal-memo-panel";
import { InvestmentReadPanel } from "@/components/properties/investment-read-panel";
import { DealCalculator } from "@/components/properties/deal-calculator";
import { QuickDealCalculator } from "@/components/properties/quick-deal-calculator";
import { getDisplayMetricsForRow } from "@/lib/property-display-metrics";
import { getDevelopmentAnalysisForProperty } from "@/lib/development-analysis";
import { getDealMemo } from "@/lib/deal-memo";
import { getOpportunityEngineRead } from "@/lib/opportunity-engine";
import { cn } from "@/lib/utils";
import type { PropertyRow } from "@/types/property";

function num(v: unknown): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function PropertyDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    notFound();
  }

  const p = data as PropertyRow;
  const lot = num(p.lot_size_sqft);
  const built = num(p.built_floor_area_sqft);
  const maxF = num(p.max_far);
  const est =
    p.estimated_value_per_sqft == null ? null : num(p.estimated_value_per_sqft);
  const m = getDisplayMetricsForRow(p);
  const dev = getDevelopmentAnalysisForProperty(p);
  const engineRead = getOpportunityEngineRead(p);
  const dealMemo = getDealMemo(p, engineRead);

  return (
    <div className="space-y-12 lg:space-y-16">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <Link
            href="/dashboard"
            className="text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-950"
          >
            ← Back to dashboard
          </Link>
          <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
            Street address
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-neutral-950">
            {p.address}
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            {p.city}, {p.state}
          </p>
          <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
            Zoning district
          </p>
          <p className="mt-1 text-sm font-medium text-neutral-800">
            {p.zoning_district}
          </p>
        </div>
        <div className="flex w-full flex-col gap-4 sm:w-auto sm:items-end">
          <PropertyDetailStatusForm propertyId={p.id} status={p.status} />
          <PropertyDetailActions propertyId={p.id} />
        </div>
      </div>

      <section
        className={cn(
          "overflow-hidden rounded-2xl border border-neutral-200/50 bg-white",
          "shadow-[0_2px_10px_rgba(15,23,42,0.04),0_28px_64px_-28px_rgba(15,23,42,0.1)] ring-1 ring-neutral-950/[0.035]",
        )}
      >
        <div className="px-8 pb-10 pt-10 md:px-10 md:pb-12 md:pt-11">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-neutral-400">
            Opportunity value
          </p>
          <p className="mt-4 text-4xl font-semibold tracking-tight text-neutral-950 tabular-nums sm:text-5xl md:text-6xl md:tracking-tighter">
            {formatMoney(m.opportunity_value)}
          </p>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-neutral-500">
            Implied upside from unused buildable area
          </p>
        </div>

        <div
          className="mx-8 h-px bg-gradient-to-r from-transparent via-neutral-200/50 to-transparent md:mx-10"
          aria-hidden
        />

        <div className="px-8 py-10 md:px-10 md:py-12">
          <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-400">
            Parcel &amp; FAR
          </h2>
          <dl className="mt-6 grid max-w-3xl gap-0 sm:grid-cols-2 sm:gap-x-12">
            <DetailMetricRow
              label="Lot size (sq ft)"
              value={formatSqft(lot)}
            />
            <DetailMetricRow
              label="Built floor area (sq ft)"
              value={formatSqft(built)}
            />
            <DetailMetricRow label="Max FAR" value={formatFar(maxF)} />
            <DetailMetricRow
              label="Current built FAR"
              value={formatFar(m.current_built_far)}
            />
            <DetailMetricRow
              label="Remaining FAR"
              value={formatFar(m.remaining_far)}
            />
            <DetailMetricRow
              label="Unused buildable area (sq ft)"
              value={formatSqft(m.unused_buildable_sqft)}
            />
            <DetailMetricRow
              label="Underbuilt score"
              value={formatScorePercent(m.underbuilt_score)}
              score
            />
            <DetailMetricRow
              label="Est. value per buildable sq ft"
              value={est != null ? formatMoneyUsd(est, 2) : "—"}
            />
          </dl>
          <div className="mt-10 max-w-3xl pt-10">
            <div className="mb-8 h-px bg-gradient-to-r from-transparent via-neutral-200/50 to-transparent" />
            <FarBuildoutGauge
              currentBuiltFar={m.current_built_far}
              maxFar={maxF}
              remainingFar={m.remaining_far}
            />
          </div>
        </div>

        <div className="px-8 py-10 md:px-10 md:py-12">
          <div className="mb-10 h-px bg-gradient-to-r from-transparent via-neutral-200/50 to-transparent" />
          <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-400">
            Development analysis
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-neutral-500">
            Pro forma on unused buildable area. Exit value uses the field below,
            or falls back to est. value per buildable sq ft.
          </p>
          <dl className="mt-6 grid max-w-3xl gap-0 sm:grid-cols-2 sm:gap-x-12">
            <DetailMetricRow
              label="Construction cost per sq ft"
              value={
                p.construction_cost_per_sqft != null &&
                num(p.construction_cost_per_sqft) > 0
                  ? formatMoneyUsd(num(p.construction_cost_per_sqft), 2)
                  : "—"
              }
            />
            <DetailMetricRow
              label="Soft cost (%)"
              value={`${dev.soft_cost_percentage}%`}
            />
            <DetailMetricRow
              label="Exit value per buildable sq ft (input)"
              value={
                p.exit_value_per_sqft != null && num(p.exit_value_per_sqft) > 0
                  ? formatMoneyUsd(num(p.exit_value_per_sqft), 2)
                  : "—"
              }
            />
            <DetailMetricRow
              label="Effective exit $/sf (used)"
              value={
                dev.effective_exit_per_sqft != null
                  ? formatMoneyUsd(dev.effective_exit_per_sqft, 2)
                  : "—"
              }
            />
            <DetailMetricRow
              label="Total buildable area (sq ft)"
              value={formatSqft(dev.total_buildable_sqft)}
            />
            <DetailMetricRow
              label="Unused buildable area (sq ft)"
              value={formatSqft(dev.unused_buildable_sqft)}
            />
            <DetailMetricRow
              label="Construction cost"
              value={formatMoney(dev.construction_cost)}
            />
            <DetailMetricRow
              label="Soft cost"
              value={formatMoney(dev.soft_cost)}
            />
            <DetailMetricRow
              label="Total cost"
              value={formatMoney(dev.total_cost)}
            />
            <DetailMetricRow
              label="Project value"
              value={formatMoney(dev.project_value)}
            />
            <DetailMetricRow
              label="Estimated profit"
              value={formatMoney(dev.estimated_profit)}
              emphasize
            />
          </dl>

          <DealCalculator
            lotSizeSqft={lot}
            maxFar={maxF}
            initialConstructionCostPerSqft={
              p.construction_cost_per_sqft != null &&
              num(p.construction_cost_per_sqft) > 0
                ? num(p.construction_cost_per_sqft)
                : null
            }
            initialSoftCostPercentage={dev.soft_cost_percentage}
            initialExitValuePerSqftFromEstimate={
              est != null && est > 0 ? est : null
            }
          />

          <QuickDealCalculator
            lotSizeSqft={lot}
            builtFloorAreaSqft={built}
            maxFar={maxF}
            estimatedValuePerBuildableSqft={est}
            initialConstructionCostPerSqft={
              p.construction_cost_per_sqft != null &&
              num(p.construction_cost_per_sqft) > 0
                ? num(p.construction_cost_per_sqft)
                : null
            }
            initialExitValuePerSqft={
              p.exit_value_per_sqft != null && num(p.exit_value_per_sqft) > 0
                ? num(p.exit_value_per_sqft)
                : null
            }
            initialSoftCostPercentage={dev.soft_cost_percentage}
            unusedBuildableSqft={dev.unused_buildable_sqft}
          />
        </div>

        <div className="space-y-10 px-8 pb-10 pt-10 md:px-10 md:pb-12">
          <div className="h-px bg-gradient-to-r from-transparent via-neutral-200/50 to-transparent" />
          <DealMemoPanel memo={dealMemo} />
          <div className="h-px bg-gradient-to-r from-transparent via-neutral-200/50 to-transparent" />
          <InvestmentReadPanel
            embedded
            read={engineRead}
            underbuiltScore={m.underbuilt_score}
          />
        </div>

        <div className="bg-gradient-to-b from-neutral-50/50 to-neutral-50/20 px-8 py-10 md:px-10 md:py-11">
          <div className="mb-8 h-px bg-gradient-to-r from-transparent via-neutral-200/45 to-transparent" />
          <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-400">
            Notes
          </h2>
          <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-neutral-800">
            {p.notes?.trim() ? p.notes : "—"}
          </p>
        </div>
      </section>
    </div>
  );
}

function DetailMetricRow({
  label,
  value,
  emphasize,
  score,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
  score?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-8 border-b border-neutral-100/45 py-3.5 sm:border-0 sm:py-3">
      <dt className="text-[11px] font-medium uppercase tracking-wide text-neutral-400">
        {label}
      </dt>
      <dd
        className={cn(
          "text-right font-mono font-medium tabular-nums text-neutral-950",
          score && "text-lg font-semibold tracking-tight sm:text-xl",
          emphasize && !score && "text-base font-semibold sm:text-lg",
          !emphasize && !score && "text-sm",
        )}
      >
        {value}
      </dd>
    </div>
  );
}
