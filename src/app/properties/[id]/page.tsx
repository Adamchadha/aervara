import type { ReactNode } from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getEffectiveUserRole } from "@/lib/user-profile-db";
import type { DealRoomInterestRow } from "@/components/properties/property-deal-room";
import { SiteRoomOpportunityHub } from "@/components/properties/site-room-opportunity-hub";
import { PropertyDetailStatusForm } from "@/components/properties/property-detail-status-form";
import { PropertySiteRoomActions } from "@/components/properties/property-site-room-actions";
import {
  formatFar,
  formatMoney,
  formatMoneyUsd,
  formatScorePercent,
  formatSqft,
} from "@/lib/far-calculations";
import { FarBuildoutGauge } from "@/components/properties/far-buildout-gauge";
import { FarVerticalCapacityBar } from "@/components/properties/far-vertical-capacity-bar";
import { PropertyParcelEnvelopeDiagram } from "@/components/properties/property-parcel-envelope-diagram";
import { DealMemoPanel } from "@/components/properties/deal-memo-panel";
import { InvestmentReadPanel } from "@/components/properties/investment-read-panel";
import { DealCalculator } from "@/components/properties/deal-calculator";
import { QuickDealCalculator } from "@/components/properties/quick-deal-calculator";
import { BuildHereSection } from "@/components/properties/build-here-section";
import { AmenityActivationSection } from "@/components/properties/amenity-activation-section";
import { DealDecisionPanel } from "@/components/properties/deal-decision-panel";
import { SpeedToValueTimeline } from "@/components/properties/speed-to-value-timeline";
import { ScenarioModePanel } from "@/components/properties/scenario-mode-panel";
import { getDisplayMetricsForRow } from "@/lib/property-display-metrics";
import {
  computeProfitMarginOnCostPercent,
  getDevelopmentAnalysisForProperty,
} from "@/lib/development-analysis";
import { ProFeaturePlaceholder } from "@/components/billing/pro-feature-placeholder";
import { DealConfidenceMeter } from "@/components/properties/deal-confidence-meter";
import { computeDealConfidence } from "@/lib/deal-confidence";
import { getDealMemo } from "@/lib/deal-memo";
import { getOpportunityEngineRead } from "@/lib/opportunity-engine";
import { getPlanAccess } from "@/lib/plan-access";
import { AnimatedMoneyValue } from "@/components/ui/animated-money-value";
import { SiteRoomCoordinationPlaceholder } from "@/components/properties/site-room-coordination-placeholder";
import { ProjectFilesPanel } from "@/components/properties/project-files-panel";
import { PublicDemoPropertyExperience } from "@/components/properties/public-demo-property-experience";
import { DataInputsVerificationSection } from "@/components/properties/data-inputs-verification-section";
import { DevelopmentEnvelopeBanner } from "@/components/properties/development-envelope-banner";
import { SiteRoomSection } from "@/components/properties/site-room-section";
import { VisualConceptsModule } from "@/components/properties/visual-concepts-module";
import { DealConciergeSection } from "@/components/properties/deal-concierge-section";
import { InviteToDealSection } from "@/components/properties/invite-to-deal-section";
import { TakeActionPanel } from "@/components/properties/take-action-panel";
import { PlanSiteVisitPanel } from "@/components/properties/plan-site-visit-panel";
import { DealActivityTimeline } from "@/components/properties/deal-activity-timeline";
import { hasVerifiedParcelGeometry } from "@/lib/property-geometry-verification";
import { getVisualConceptSummary } from "@/lib/visual-concept-heuristics";
import { cn } from "@/lib/utils";
import { parseSiteVisitChecklist } from "@/lib/site-visit-checklist";
import { buildDealActivityTimeline } from "@/lib/deal-activity-timeline";
import {
  fetchExclusivityRow,
  isApprovedForPlatform,
} from "@/lib/exclusivity-access";
import { isDemoMode, requestFullAccessHref } from "@/lib/demo-flow";
import { withDemoQuery } from "@/lib/demo-query";
import { buildDealDecision, buildSpeedToValueTimeline } from "@/lib/deal-decision";
import { computeOpportunityScoreForProperty } from "@/lib/opportunity-score";
import type { DealReportPayload } from "@/types/deal-report-payload";
import type { IntroductionRequestRow } from "@/types/introduction-request";
import type { ProjectFileRow } from "@/types/project-file";
import type { PropertyRow } from "@/types/property";
import type { PropertyDealActivityRow } from "@/types/deal-activity";
import type { MeetingTimelineRow } from "@/lib/deal-activity-timeline";

function num(v: unknown): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ demo?: string; previewPin?: string }>;
};

export default async function PropertyDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const q = await searchParams;
  const previewPin = typeof q.previewPin === "string" ? q.previewPin : null;
  const isDemo = isDemoMode(q.demo);
  const propertyPagePath = withDemoQuery(`/properties/${id}`, isDemo);
  const readOnly = isDemo;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(
      `/login?redirect=${encodeURIComponent(withDemoQuery(`/properties/${id}`, isDemo))}`,
    );
  }
  const exclusivityRow = await fetchExclusivityRow(supabase, user.id);
  if (!isApprovedForPlatform(exclusivityRow, { isDemo, userId: user.id })) {
    const propPath = withDemoQuery(`/properties/${id}`, isDemo);
    redirect(
      requestFullAccessHref({ nextPath: propPath, sourceRoute: propPath }),
    );
  }

  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !data) {
    notFound();
  }

  const { data: interestRows } = await supabase
    .from("property_deal_interests")
    .select("id, user_id, user_role, intent, message, created_at")
    .eq("property_id", id)
    .order("created_at", { ascending: false });

  const dealInterests = (interestRows ?? []) as DealRoomInterestRow[];

  const { data: introRows, error: introFetchError } = await supabase
    .from("property_introduction_requests")
    .select("id, target_role, purpose, message, status, created_at")
    .eq("property_id", id)
    .order("created_at", { ascending: false });

  const introductionRequests = (
    !introFetchError && introRows ? introRows : []
  ) as IntroductionRequestRow[];

  const { data: projectFileRows, error: projectFilesError } = await supabase
    .from("property_project_files")
    .select("id, category, title, link_url, notes, created_at")
    .eq("property_id", id)
    .order("created_at", { ascending: false });

  const projectFiles = (
    !projectFilesError && projectFileRows ? projectFileRows : []
  ) as ProjectFileRow[];

  const { data: meetingRows, error: meetingErr } = await supabase
    .from("property_meeting_requests")
    .select("id, meeting_type, created_at")
    .eq("property_id", id)
    .order("created_at", { ascending: false });

  const meetingTimeline = (
    !meetingErr && meetingRows ? meetingRows : []
  ) as MeetingTimelineRow[];

  const { data: activityRaw, error: activityErr } = await supabase
    .from("property_deal_activity_events")
    .select("id, property_id, user_id, event_type, detail, metadata, created_at")
    .eq("property_id", id)
    .order("created_at", { ascending: false });

  const activityEvents: PropertyDealActivityRow[] = (
    !activityErr && activityRaw ? activityRaw : []
  ).map((row) => ({
    id: row.id,
    property_id: row.property_id,
    user_id: row.user_id,
    event_type: row.event_type as PropertyDealActivityRow["event_type"],
    detail: row.detail,
    metadata:
      row.metadata &&
      typeof row.metadata === "object" &&
      !Array.isArray(row.metadata)
        ? (row.metadata as Record<string, unknown>)
        : {},
    created_at: row.created_at,
  }));

  const viewerRole = await getEffectiveUserRole(supabase, user);

  const plan = await getPlanAccess(supabase, user.id, user.email, {
    isProPreview: isDemo,
  });
  const p = data as PropertyRow;

  if (p.is_premium && !plan.canViewPremiumProperties) {
    notFound();
  }
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
  const visualConcept = getVisualConceptSummary(p, engineRead, m);
  const geometryVerified = hasVerifiedParcelGeometry(p);
  const geometrySourceLabel =
    p.geometry_source != null && String(p.geometry_source).trim()
      ? String(p.geometry_source).trim()
      : null;

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

  const proAnalysis = plan.canUseAdvancedDealAnalysis;
  const dealRoom = plan.canAccessDealRoom;
  const opportunityScore = computeOpportunityScoreForProperty(p);
  const dealDecision = buildDealDecision({
    unusedBuildableSqft: num(m.unused_buildable_sqft),
    opportunityValue: m.opportunity_value,
    maxFar: maxF,
    underbuiltScore: m.underbuilt_score,
    estimatedProfit: dev.estimated_profit,
    totalCost: dev.total_cost,
    complexityScore: engineRead.complexityScore,
    engineRead,
  });
  const speedTimeline = buildSpeedToValueTimeline(engineRead.complexityScore);
  const stepVisual = proAnalysis ? "11" : "10";
  const stepConcierge = proAnalysis ? "12" : "11";
  const stepInvite = proAnalysis ? "13" : "12";
  const stepDealFlow = proAnalysis ? "14" : "13";
  const stepActivity = proAnalysis ? "15" : "14";
  const stepProjectRoom = proAnalysis ? "16" : "15";

  const dealActivityItems = buildDealActivityTimeline({
    interests: dealInterests,
    introductions: introductionRequests,
    meetings: meetingTimeline,
    activityEvents,
  });

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

  if (isDemo) {
    return (
      <PublicDemoPropertyExperience
        property={p}
        metrics={m}
        dealMemo={dealMemo}
        engineRead={engineRead}
        dealConfidence={dealConfidence}
        viewerRole={viewerRole}
        dealRoom={dealRoom}
        lotSqft={lot}
        builtSqft={built}
        maxFar={maxF}
        estValuePerSqft={est}
      />
    );
  }

  return (
    <div className="relative mx-auto max-w-5xl space-y-16 pb-10 pt-2 lg:space-y-20 lg:pb-14 lg:pt-4">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-10 -right-10 -top-6 h-[28rem] rounded-[2.2rem] bg-[radial-gradient(ellipse_at_top,rgba(15,23,42,0.045),rgba(15,23,42,0))]"
      />
      <div className="flex flex-col gap-0">
      <header className="relative z-30 mx-auto mb-16 w-full max-w-5xl overflow-visible rounded-[2rem] border border-stone-200/70 bg-white/90 shadow-[0_24px_70px_rgba(15,23,42,0.12)] backdrop-blur-md lg:mb-20">
        <div className="relative z-[1] grid min-h-0 h-full overflow-hidden rounded-[2rem] lg:grid-cols-[1fr_340px]">
          <div className="h-full min-w-0 rounded-l-[2rem] bg-white/85 p-8 backdrop-blur-sm sm:p-10">
            <Link
              href={withDemoQuery("/dashboard", isDemo)}
              className="-ml-1 inline-flex rounded-xl px-2.5 py-1.5 text-sm font-medium text-neutral-500 transition-all duration-300 ease-out hover:bg-stone-100/90 hover:text-neutral-950"
            >
              ← Back to dashboard
            </Link>
            <div className="mt-6 inline-flex items-center rounded-full border border-amber-200/65 bg-gradient-to-r from-amber-50/90 to-amber-50/40 px-3.5 py-1.5 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-amber-950/85">
                Site Room
              </span>
            </div>
            <h1 className="mt-5 max-w-[46rem] text-pretty text-[1.65rem] font-semibold leading-[1.2] tracking-[-0.03em] text-neutral-950 sm:text-[1.85rem] sm:leading-[1.18] sm:tracking-[-0.032em] lg:text-[2rem]">
              {p.address}
            </h1>
            <p className="mt-3 text-[0.9375rem] font-medium text-neutral-600">
              {p.city}, {p.state}
            </p>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-neutral-500">
              <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-400">
                Zoning
              </span>
              <span className="mt-1 block text-[0.9375rem] font-normal text-neutral-700">
                {p.zoning_district}
              </span>
            </p>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-neutral-500">
              One workspace for this parcel: envelope math, execution read, and
              collaboration signals structured for investor diligence.
            </p>
          </div>
          <aside className="relative flex h-full min-w-0 flex-col overflow-visible rounded-r-[2rem] border border-white/10 bg-[#071827] p-8 text-white shadow-[0_20px_50px_rgba(0,0,0,0.25)] sm:p-10">
            <div
              className="pointer-events-none absolute left-0 top-0 z-[1] h-full w-16 bg-gradient-to-r from-white/50 via-white/15 to-transparent"
              aria-hidden
            />
            <div className="relative z-[2] flex min-h-0 flex-1 flex-col gap-6">
              <div className="rounded-lg bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-neutral-800">
                Investment memo controls
              </div>
              <PropertyDetailStatusForm
                propertyId={p.id}
                status={p.status}
                readOnly={readOnly}
              />
              <div className="h-px w-full bg-white/20" />
              <PropertySiteRoomActions
                propertyId={p.id}
                viewerRole={viewerRole}
                dealReportPayload={dealReportPayload}
                addressForFilename={p.address}
                proLocked={!plan.canExportDealPdf}
                readOnly={readOnly}
              />
            </div>
          </aside>
        </div>
      </header>

      <div className="relative z-10 mt-0">
        <DevelopmentEnvelopeBanner
          zoning={p.zoning_district?.trim() ? p.zoning_district : "—"}
          unusedSqft={formatSqft(m.unused_buildable_sqft)}
          modeledFar={`${formatFar(m.current_built_far)} / ${formatFar(maxF)}`}
          modalFarHeadroom={formatFar(m.unused_vertical_capacity)}
          modalModeledUpside={formatMoney(m.opportunity_value)}
        />
      </div>
      </div>

      <SiteRoomSection
        id="deal-decision"
        step="01"
        label="Deal Decision"
        title="DEAL DECISION"
        description="A concise execution read for developers, brokers, and investors based on envelope, economics, and delivery complexity."
        className="bg-gradient-to-b from-stone-50/70 to-white ring-stone-900/[0.06]"
      >
        <DealDecisionPanel
          decision={dealDecision}
          opportunityScore={opportunityScore}
        />
      </SiteRoomSection>

      <SiteRoomSection
        id="opportunity-snapshot"
        step="02"
        label="Opportunity snapshot"
        title="The thesis in numbers"
        description="Implied upside from unused buildable envelope, with a conviction read from Aervara’s opportunity engine."
      >
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
          Air rights value
        </p>
        <AnimatedMoneyValue
          amount={m.air_rights_value}
          className="mt-5 text-[2.2rem] font-semibold tracking-[-0.035em] text-neutral-950 tabular-nums sm:text-5xl sm:tracking-[-0.04em] md:text-[3.1rem] lg:text-[3.45rem] lg:leading-[1.02]"
        />
        <div className="mt-6 max-w-2xl border-l-2 border-stone-200/80 pl-4 text-sm leading-relaxed text-neutral-600">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
            Why this matters
          </p>
          <p className="mt-2">
            Air rights are the unbuilt vertical envelope. This is the cleanest
            proxy for whether the parcel can support higher-order density value
            without changing the land footprint.
          </p>
        </div>
        <div className="mt-8 max-w-sm">
          <DealConfidenceMeter confidence={dealConfidence} />
        </div>
      </SiteRoomSection>

      <SiteRoomSection
        id="market-context"
        step="03"
        label="Market context"
        title="Local market context"
        description="Quick location and envelope context framed for investment committee reading."
        density="compact"
        className="ring-stone-900/[0.02] shadow-[0_10px_34px_-28px_rgba(15,23,42,0.12)]"
      >
        <dl className="grid gap-0 sm:grid-cols-2 sm:gap-x-12">
          <DetailMetricRow label="Market" value={`${p.city}, ${p.state}`} />
          <DetailMetricRow label="Zoning district" value={p.zoning_district} />
          <DetailMetricRow label="Opportunity score" value={`${Math.round(opportunityScore)}`} score />
          <DetailMetricRow label="Complexity profile" value={engineRead.complexityLabel} />
          <DetailMetricRow label="Speed-to-value profile" value={engineRead.speedToValueLabel} />
          <DetailMetricRow label="Recommended play" value={engineRead.recommendedPlay} />
        </dl>
      </SiteRoomSection>

      <SiteRoomSection
        id="take-action"
        step="04"
        label="Next step"
        title="Take Action"
        description="Move from analysis to real-world motion—structured requests only. Nothing here implies a pre-booked call or a named counterparty until Aervara confirms."
        density="compact"
      >
        {dealRoom ? (
          <TakeActionPanel
            propertyId={p.id}
            viewerRole={viewerRole}
            readOnly={readOnly}
          />
        ) : (
          <ProFeaturePlaceholder gateDebug={plan.gateDebug}
            title="Deal Room actions"
            description="Request calls, meetings, and introductions inside the Site Room unlock with full access."
          />
        )}
      </SiteRoomSection>

      <SiteRoomSection
        id="site-visit"
        step="05"
        label="Field"
        title="Site Visit Mode"
        description="Turn desk work into a deliberate walk of the parcel—maps, a look-for checklist, and field notes in one place."
        density="compact"
      >
        <PlanSiteVisitPanel
          propertyId={p.id}
          address={p.address}
          city={p.city}
          state={p.state}
          zoningDistrict={p.zoning_district}
          siteVisitedAt={p.site_visited_at ?? null}
          siteVisitNotes={p.site_visit_notes ?? null}
          initialChecklist={parseSiteVisitChecklist(p.site_visit_checklist)}
          readOnly={readOnly}
        />
      </SiteRoomSection>

      <SiteRoomSection
        id="parcel-far"
        step="06"
        label="Parcel & FAR"
        title="Site envelope & density"
        description="Lot geometry, FAR headroom, and unused buildable slack—ground truth for underwriting and design direction."
      >
        <dl className="grid max-w-3xl gap-0 sm:grid-cols-2 sm:gap-x-12">
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
              label="Unused vertical capacity"
              value={formatFar(m.unused_vertical_capacity)}
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
        <div className="mt-10 max-w-xl">
          <PropertyParcelEnvelopeDiagram
            diagramInstanceId={p.id}
            lotSizeSqft={lot}
            builtFloorAreaSqft={built}
            maxFar={maxF}
          />
        </div>
        <div className="mt-12 max-w-3xl border-t border-stone-100/80 pt-10">
          <div className="grid gap-8 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
            <FarBuildoutGauge
              currentBuiltFar={m.current_built_far}
              maxFar={maxF}
              remainingFar={m.unused_vertical_capacity}
            />
            <FarVerticalCapacityBar
              builtFar={m.current_built_far}
              maxFar={maxF}
            />
          </div>
          <div className="mt-10">
            <BuildHereSection property={p} />
          </div>
          <div className="mt-14 border-t border-stone-100/80 pt-12">
            <AmenityActivationSection
              unusedBuildableSqft={num(m.unused_buildable_sqft)}
              totalBuildableSqft={lot * maxF}
            />
          </div>
        </div>
      </SiteRoomSection>

      <SiteRoomSection
        id="development-analysis"
        step="07"
        label="Development analysis"
        title="Pro forma & cost stack"
        description="Scenario envelopes, cost stack, and profit bridge on unused buildable area. Exit value uses your input field or falls back to estimated value per buildable sq ft."
        className="bg-white ring-stone-900/[0.05]"
      >
        {proAnalysis ? (
          <ScenarioModePanel
            lotSqft={lot}
            builtSqft={built}
            propertyMaxFar={maxF}
            estimatedValuePerSqft={est}
            propertyExitPerSqft={
              p.exit_value_per_sqft != null && num(p.exit_value_per_sqft) > 0
                ? num(p.exit_value_per_sqft)
                : null
            }
            propertyConstructionPerSqft={
              p.construction_cost_per_sqft != null &&
              num(p.construction_cost_per_sqft) > 0
                ? num(p.construction_cost_per_sqft)
                : null
            }
            propertySoftCostPct={dev.soft_cost_percentage}
          />
        ) : (
          <ProFeaturePlaceholder gateDebug={plan.gateDebug}
            title="Scenario modeling"
            description="Model conservative, base, and aggressive cases side by side. Included with full access."
          />
        )}

        <div className="mt-12 border-t border-stone-200/60 pt-12">
          <dl className="grid max-w-3xl gap-0 sm:grid-cols-2 sm:gap-x-12">
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
              value={
                <AnimatedMoneyValue
                  amount={dev.estimated_profit}
                  className="inline-block"
                />
              }
              emphasize
            />
          </dl>

          {plan.canUseAdvancedDealAnalysis ? (
            <>
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
            </>
          ) : (
            <ProFeaturePlaceholder gateDebug={plan.gateDebug}
              className="mt-10"
              title="Interactive deal calculators"
              description="Stress-test construction, soft costs, and exit assumptions on the full envelope and on unused buildable area. Full access unlocks live calculators here."
            />
          )}
        </div>
      </SiteRoomSection>

      <DataInputsVerificationSection
        property={p}
        previewParcelPin={previewPin}
        propertyPagePath={propertyPagePath}
      />

      <SiteRoomSection
        id="speed-to-value"
        step="08"
        label="Speed to value"
        title="Speed to Value Timeline"
        description="Estimated delivery path from entitlement through stabilization. Directional screening only."
        density="compact"
      >
        <SpeedToValueTimeline timeline={speedTimeline} />
      </SiteRoomSection>

      {proAnalysis ? (
        <>
          <SiteRoomSection
            id="investment-read"
            step="09"
            label="Investment read"
            title="How Aervara reads the opportunity"
            description="Heuristic play, complexity, key flags, and speed-to-value—structured like an institutional screen."
          >
            <InvestmentReadPanel
              embedded
              read={engineRead}
              underbuiltScore={m.underbuilt_score}
            />
          </SiteRoomSection>
          <SiteRoomSection
            id="deal-memo"
            step="10"
            label="Deal memo"
            title="Narrative for your deal stack"
            description="Executive summary, thesis, risks, and a suggested next move—ready for partner or IC prep."
          >
            <DealMemoPanel embedded memo={dealMemo} />
          </SiteRoomSection>
        </>
      ) : (
        <SiteRoomSection
          id="analysis-full-access"
          step="09"
          label="Diligence"
          title="Investment read & deal memo"
          description="Structured reads and executive memos for this parcel unlock with full access."
        >
          <ProFeaturePlaceholder gateDebug={plan.gateDebug}
            title="Advanced deal analysis"
            description="Executive deal memos, investment reads, and structured risk flags for this parcel. Request full access to view them here."
          />
        </SiteRoomSection>
      )}

      <SiteRoomSection
        id="visual-concepts"
        step={stepVisual}
        label="Visual concepts"
        title="Conceptual build-out"
        description="A lightweight “what would I build here?” read from zoning, FAR, and envelope slack—paired with blueprint-style massing. Orientation only; not a survey, setback analysis, or basis for construction documents."
      >
        <VisualConceptsModule
          diagramInstanceId={`${p.id}-vc`}
          lotSizeSqft={lot}
          builtFloorAreaSqft={built}
          maxFar={maxF}
          concept={visualConcept}
          underbuiltScore={m.underbuilt_score}
          complexityScore={engineRead.complexityScore}
          zoningDistrict={p.zoning_district ?? ""}
          unusedBuildableSqft={m.unused_buildable_sqft}
          hasVerifiedParcelGeometry={geometryVerified}
          geometrySourceLabel={geometrySourceLabel}
          lotWidthFt={p.lot_width_ft ?? null}
          lotDepthFt={p.lot_depth_ft ?? null}
        />
      </SiteRoomSection>

      <SiteRoomSection
        id="deal-concierge"
        step={stepConcierge}
        label="Concierge"
        title="Deal Concierge"
        description="When you want more than software—curated introductions around this opportunity, structured and discreet."
      >
        {dealRoom ? (
          <DealConciergeSection propertyId={p.id} readOnly={readOnly} />
        ) : (
          <ProFeaturePlaceholder gateDebug={plan.gateDebug}
            title="Deal Concierge"
            description="Curated introductions around this parcel unlock with full access."
          />
        )}
      </SiteRoomSection>

      <SiteRoomSection
        id="invite-to-deal"
        step={stepInvite}
        label="Invite"
        title="Invite to Deal"
        description="Loop in investors, developers, or brokers with a stored invite—Aervara is the workspace where the opportunity lives; you control how people are brought in."
        density="compact"
      >
        {dealRoom ? (
          <InviteToDealSection propertyId={p.id} readOnly={readOnly} />
        ) : (
          <ProFeaturePlaceholder gateDebug={plan.gateDebug}
            title="Invite to Deal"
            description="Share this opportunity with counterparties from your full-access workspace."
          />
        )}
      </SiteRoomSection>

      <SiteRoomSection
        id="deal-flow"
        step={stepDealFlow}
        label="Deal flow"
        title="Interest & connections"
        description="Structured view of connection requests and deal-interest signals on this parcel—roles, intent, status, and timing in one workflow-style hub."
      >
        {dealRoom ? (
          <SiteRoomOpportunityHub
            currentUserId={user.id}
            introductionRequests={introductionRequests}
            dealInterests={dealInterests}
          />
        ) : (
          <ProFeaturePlaceholder gateDebug={plan.gateDebug}
            title="Interest & connections"
            description="Track deal interest and introduction requests here with full access."
          />
        )}
      </SiteRoomSection>

      <SiteRoomSection
        id="deal-activity"
        step={stepActivity}
        label="Activity"
        title="Deal Activity Timeline"
        description="A single thread of how this opportunity has moved—from interest and requests to site visits and notes—newest first."
        density="compact"
      >
        {dealRoom ? (
          <DealActivityTimeline items={dealActivityItems} />
        ) : (
          <ProFeaturePlaceholder gateDebug={plan.gateDebug}
            title="Deal Activity"
            description="A live timeline of deal motion on this parcel is available with full access."
          />
        )}
      </SiteRoomSection>

      <SiteRoomSection
        id="project-room"
        step={stepProjectRoom}
        label="Project room"
        title="Project files & meetings"
        description="Structured references for this parcel, working notes, and a lightweight coordination lane—so diligence and next meetings stay next to the deal."
      >
        <ProjectFilesPanel
          propertyId={p.id}
          initialFiles={projectFiles}
          readOnly={readOnly}
        />
        <div className="mt-14 border-t border-stone-200/60 pt-10">
          <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
            Property notes
          </h3>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-neutral-800">
            {p.notes?.trim() ? p.notes : "—"}
          </p>
        </div>
        <div className="mt-14 border-t border-stone-200/60 pt-10">
          <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
            Meetings & coordination
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-500">
            Checklists for tours, capital syncs, and IC milestones tied to this
            site.
          </p>
          <div className="mt-6">
            <SiteRoomCoordinationPlaceholder />
          </div>
        </div>
      </SiteRoomSection>
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
  value: ReactNode;
  emphasize?: boolean;
  score?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-8 border-b border-stone-100/70 py-4 sm:border-0 sm:py-3.5">
      <dt className="text-[11px] font-medium uppercase tracking-[0.06em] text-neutral-400">
        {label}
      </dt>
      <dd
        className={cn(
          "text-right font-mono font-medium tabular-nums text-neutral-950",
          score &&
            "text-[1.35rem] font-semibold tracking-[-0.02em] sm:text-2xl sm:tracking-tight",
          emphasize && !score && "text-lg font-semibold tracking-tight sm:text-xl",
          !emphasize && !score && "text-[0.9375rem] font-normal text-neutral-800",
        )}
      >
        {value}
      </dd>
    </div>
  );
}
