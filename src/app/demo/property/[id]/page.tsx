import { notFound } from "next/navigation";
import {
  DemoPropertyCinematicHero,
  DemoPropertyHeroFadeBridge,
} from "@/components/demo/demo-property-cinematic-hero";
import { DemoPipelineStatus } from "@/components/demo/demo-pipeline-status";
import { PublicDemoPropertyExperience } from "@/components/properties/public-demo-property-experience";
import { computeDealConfidence } from "@/lib/deal-confidence";
import { requestFullAccessHref } from "@/lib/demo-flow";
import { getDealMemo } from "@/lib/deal-memo";
import { formatFar, formatMoney, formatSqft } from "@/lib/far-calculations";
import { getOpportunityEngineRead } from "@/lib/opportunity-engine";
import {
  computeOpportunityScoreForProperty,
  computeOpportunityScores,
} from "@/lib/opportunity-score";
import { getDisplayMetricsForRow } from "@/lib/property-display-metrics";
import {
  getPublicDemoProperties,
  getPublicDemoPropertyById,
} from "@/lib/public-demo-properties";

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
  const engineRead = getOpportunityEngineRead(p);
  const dealMemo = getDealMemo(p, engineRead);
  const dealConfidence = computeDealConfidence({
    opportunityValue: m.opportunity_value,
    underbuiltScore: m.underbuilt_score,
    complexityScore: engineRead.complexityScore,
    speedToValueScore: engineRead.speedToValueScore,
  });

  const hubPath = `/demo/properties/${p.id}`;
  const accessHref = requestFullAccessHref({
    nextPath: hubPath,
    sourceRoute: hubPath,
  });

  const demoScores = computeOpportunityScores(getPublicDemoProperties());
  const opportunityScore =
    demoScores.get(p.id) ?? computeOpportunityScoreForProperty(p);

  const potentialValueLine =
    m.opportunity_value != null && Number.isFinite(m.opportunity_value)
      ? `${formatMoney(m.opportunity_value)} potential development value`
      : "Modeled value unavailable";

  return (
    <>
      <DemoPropertyCinematicHero
        address={p.address}
        subtitle={`${p.city}, ${p.state} • ${p.zoning_district}`}
        potentialValueLine={potentialValueLine}
        unusedBuildableLine={`${formatSqft(m.unused_buildable_sqft)} sq ft unused buildable`}
        farLine={`${formatFar(m.current_built_far)} / ${formatFar(maxF)}`}
        opportunityScore={opportunityScore}
        backHref="/demo"
        backLabel="← Back to demo deals"
        siteRoomHash="#site-room"
        accessHref={accessHref}
      />

      <div className="mx-auto w-full max-w-5xl">
        <DemoPropertyHeroFadeBridge>
          <div className="px-4 pb-2 pt-5 sm:px-6 sm:pt-7">
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
        </DemoPropertyHeroFadeBridge>
      </div>
    </>
  );
}
