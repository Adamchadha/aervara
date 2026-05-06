import Link from "next/link";
import { notFound } from "next/navigation";
import { DemoPipelineStatus } from "@/components/demo/demo-pipeline-status";
import { DashboardHeroTopDeal } from "@/components/properties/dashboard-hero-top-deal";
import { PublicDemoPropertyExperience } from "@/components/properties/public-demo-property-experience";
import { computeDealConfidence } from "@/lib/deal-confidence";
import { formatFar, formatSqft } from "@/lib/far-calculations";
import { getDealMemo } from "@/lib/deal-memo";
import { getOpportunityEngineRead } from "@/lib/opportunity-engine";
import {
  computeOpportunityScoreForProperty,
  computeOpportunityScores,
  opportunityPriorityLabel,
} from "@/lib/opportunity-score";
import { getDisplayMetricsForRow } from "@/lib/property-display-metrics";
import {
  getPublicDemoProperties,
  getPublicDemoPropertyById,
  PUBLIC_DEMO_HERO_ADDRESS,
  PUBLIC_DEMO_WABASH_OPPORTUNITY_SCORE,
} from "@/lib/public-demo-properties";

function num(v: unknown): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

const HERO_THESIS =
  "Underbuilt urban parcel with meaningful vertical capacity and premium repositioning optionality.";

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
  const engineRead = getOpportunityEngineRead(p);
  const dealMemo = getDealMemo(p, engineRead);
  const dealConfidence = computeDealConfidence({
    opportunityValue: m.opportunity_value,
    underbuiltScore: m.underbuilt_score,
    complexityScore: engineRead.complexityScore,
    speedToValueScore: engineRead.speedToValueScore,
  });

  const hubPath = `/demo/properties/${p.id}`;

  const demoScores = computeOpportunityScores(getPublicDemoProperties());
  const rankedScore =
    demoScores.get(p.id) ?? computeOpportunityScoreForProperty(p);
  const heroOpportunityScore =
    p.address === PUBLIC_DEMO_HERO_ADDRESS
      ? PUBLIC_DEMO_WABASH_OPPORTUNITY_SCORE
      : rankedScore;

  const farHeadroom = Math.max(0, maxF - num(m.current_built_far));
  const insightBullets: [string, string] = [
    `${formatSqft(m.unused_buildable_sqft)} sq ft unused buildable in the modeled envelope.`,
    `${formatFar(m.current_built_far)} built FAR vs ${formatFar(maxF)} max · ${formatFar(farHeadroom)} headroom · ${p.zoning_district}.`,
  ];

  const heroPriority = opportunityPriorityLabel(heroOpportunityScore);
  const opportunityValue = m.opportunity_value ?? 0;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-12 pt-2 sm:px-6 lg:pb-16">
      <Link
        href="/demo"
        className="-ml-1 inline-flex rounded-xl px-2.5 py-1.5 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-100/90 hover:text-stone-950"
      >
        ← Back to demo deals
      </Link>

      <div className="mt-6">
        <DashboardHeroTopDeal
          property={p}
          opportunityValue={opportunityValue}
          opportunityScore={heroOpportunityScore}
          priorityLabel={heroPriority}
          thesisLine={HERO_THESIS}
          insightBullets={insightBullets}
          isDemo
          publicDemo
          ctaHref="#site-room"
        />
      </div>

      <div className="mt-8 space-y-8 border-t border-stone-200/35 pt-8">
        <div className="rounded-2xl border border-stone-200/70 bg-white/90 px-5 py-5 shadow-sm">
          <DemoPipelineStatus initialStatus={p.status} />
        </div>
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
