import { notFound } from "next/navigation";
import { DemoPipelineStatus } from "@/components/demo/demo-pipeline-status";
import { PublicDemoPropertyExperience } from "@/components/properties/public-demo-property-experience";
import { computeDealConfidence } from "@/lib/deal-confidence";
import { getDealMemo } from "@/lib/deal-memo";
import { getOpportunityEngineRead } from "@/lib/opportunity-engine";
import { getDisplayMetricsForRow } from "@/lib/property-display-metrics";
import { getPublicDemoPropertyById } from "@/lib/public-demo-properties";

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

  return (
    <>
      <div className="mx-auto max-w-5xl pb-8 pt-2">
        <div className="rounded-2xl border border-stone-200/70 bg-white/90 px-5 py-5 shadow-sm">
          <DemoPipelineStatus initialStatus={p.status} />
        </div>
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
      />
    </>
  );
}
