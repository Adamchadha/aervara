import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicDemoSiteRoomMemoHeader } from "@/components/demo/public-demo-site-room-memo-header";
import { DevelopmentEnvelopeBanner } from "@/components/properties/development-envelope-banner";
import { PublicDemoPropertyExperience } from "@/components/properties/public-demo-property-experience";
import { computeDealConfidence } from "@/lib/deal-confidence";
import {
  computeProfitMarginOnCostPercent,
  getDevelopmentAnalysisForProperty,
} from "@/lib/development-analysis";
import {
  formatFar,
  formatMoney,
  formatMoneyUsd,
  formatScorePercent,
  formatSqft,
} from "@/lib/far-calculations";
import { getDealMemo } from "@/lib/deal-memo";
import { getOpportunityEngineRead } from "@/lib/opportunity-engine";
import { getDisplayMetricsForRow } from "@/lib/property-display-metrics";
import { getPublicDemoPropertyById } from "@/lib/public-demo-properties";
import type { DealReportPayload } from "@/types/deal-report-payload";

function num(v: unknown): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

export default async function PublicDemoPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const p = getPublicDemoPropertyById(id);
  if (!p) notFound();

  const lot = num(p.lot_size_sqft);
  const built = num(p.built_floor_area_sqft);
  const maxF = num(p.max_far);
  const est =
    p.estimated_value_per_sqft == null ? null : num(p.estimated_value_per_sqft);
  const m = getDisplayMetricsForRow(p);
  const dev = getDevelopmentAnalysisForProperty(p);
  const engineRead = getOpportunityEngineRead(p);
  const dealMemo = getDealMemo(p, engineRead);
  const dealConfidence = computeDealConfidence({
    opportunityValue: m.opportunity_value,
    underbuiltScore: m.underbuilt_score,
    complexityScore: engineRead.complexityScore,
    speedToValueScore: engineRead.speedToValueScore,
  });

  const hubPath = `/demo/properties/${p.id}`;

  const generatedDateLabel = new Intl.DateTimeFormat("en-US", {
    dateStyle: "long",
  }).format(new Date());

  const profitMarginPct = computeProfitMarginOnCostPercent(
    dev.estimated_profit,
    dev.total_cost,
  );
  const profitMargin =
    profitMarginPct != null
      ? `${profitMarginPct.toFixed(1)}% (yield on total cost)`
      : "—";

  const constructionPerSqft =
    p.construction_cost_per_sqft != null &&
    num(p.construction_cost_per_sqft) > 0
      ? formatMoneyUsd(num(p.construction_cost_per_sqft), 2)
      : "—";

  const dealReportPayload: DealReportPayload = {
    address: p.address,
    cityState: `${p.city}, ${p.state}`,
    zoningDistrict: p.zoning_district,
    generatedDateLabel,
    opportunityValue: formatMoney(m.opportunity_value),
    underbuiltScore: formatScorePercent(m.underbuilt_score),
    complexityScore: String(engineRead.complexityScore),
    complexityLabel: engineRead.complexityLabel,
    speedToValueScore: String(engineRead.speedToValueScore),
    speedToValueLabel: engineRead.speedToValueLabel,
    suggestedNextStep: dealMemo.suggestedNextStep,
    lotSqft: formatSqft(lot),
    builtSqft: formatSqft(built),
    maxFar: formatFar(maxF),
    currentBuiltFar: formatFar(m.current_built_far),
    remainingFar: formatFar(m.remaining_far),
    unusedBuildable: formatSqft(m.unused_buildable_sqft),
    estValuePerBuildableSqft:
      est != null && est > 0 ? formatMoneyUsd(est, 2) : "—",
    constructionPerSqft,
    softCostPct: `${dev.soft_cost_percentage}%`,
    totalProjectValue: formatMoney(dev.project_value),
    totalCost: formatMoney(dev.total_cost),
    estimatedProfit: formatMoney(dev.estimated_profit),
    profitMargin,
    executiveSummary: dealMemo.executiveSummary,
    whyItMatters: dealMemo.whyItMatters,
    keyRisks: dealMemo.keyRisks,
    keyFlags: engineRead.keyFlags,
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-12 pt-2 sm:px-6 lg:pb-16">
      <Link
        href="/demo"
        className="-ml-1 inline-flex rounded-xl px-2.5 py-1.5 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-100/90 hover:text-stone-950"
      >
        ← Back to demo deals
      </Link>

      <div className="mt-6 flex flex-col gap-8">
        <PublicDemoSiteRoomMemoHeader
          property={p}
          dealReportPayload={dealReportPayload}
          initialPipelineStatus={p.status}
        />

        <DevelopmentEnvelopeBanner
          zoning={p.zoning_district?.trim() ? p.zoning_district : "—"}
          unusedSqft={formatSqft(m.unused_buildable_sqft)}
          modeledFar={`${formatFar(m.current_built_far)} / ${formatFar(maxF)}`}
          modalFarHeadroom={formatFar(m.unused_vertical_capacity)}
          modalModeledUpside={formatMoney(m.opportunity_value)}
          trailingMargin={false}
        />

        <PublicDemoPropertyExperience
          property={p}
          metrics={m}
          dealMemo={dealMemo}
          engineRead={engineRead}
          dealConfidence={dealConfidence}
          viewerRole={null}
          dealRoom={true}
          lotSqft={lot}
          builtSqft={built}
          maxFar={maxF}
          estValuePerSqft={est}
          backHref="/demo"
          backLinkLabel="← Back to demo deals"
          applyNextPath={hubPath}
          applySourcePath={hubPath}
          suppressMarketingHeader
        />
      </div>
    </div>
  );
}
