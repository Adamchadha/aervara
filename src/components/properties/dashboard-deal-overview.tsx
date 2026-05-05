import { DealSnapshotCard } from "@/components/properties/deal-snapshot-card";
import { DashboardDataCoverageSection } from "@/components/properties/dashboard-data-coverage-section";
import { DashboardHeroTopDeal } from "@/components/properties/dashboard-hero-top-deal";
import { DashboardMetricRow } from "@/components/properties/dashboard-metric-row";
import { MarketIntelligenceStrip } from "@/components/properties/market-intelligence-strip";
import { SignalStrip } from "@/components/properties/signal-strip";
import { buildAmenityScenarios } from "@/lib/amenity-activation";
import type { CityGroup } from "@/lib/city-scan";
import { formatFar, formatMoney, formatSqft } from "@/lib/far-calculations";
import { getDisplayMetricsForRow } from "@/lib/property-display-metrics";
import { getOpportunityEngineRead } from "@/lib/opportunity-engine";
import { selectTopOpportunities } from "@/lib/top-opportunities";
import { normalizePropertyStatus } from "@/lib/property-status";
import {
  computeOpportunityScoreForProperty,
  computeOpportunityScores,
  opportunityPriorityLabel,
} from "@/lib/opportunity-score";
import type { PropertyRow } from "@/types/property";

function num(v: unknown): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

function totalBuildableSqft(p: PropertyRow): number {
  return num(p.lot_size_sqft) * num(p.max_far);
}

function amenityActivationIndex(p: PropertyRow): number {
  const m = getDisplayMetricsForRow(p);
  const scenarios = buildAmenityScenarios({
    unusedBuildableSqft: m.unused_buildable_sqft,
    totalBuildableSqft: totalBuildableSqft(p),
  });
  const weight: Record<string, number> = { High: 1, Moderate: 0.5, Low: 0.15 };
  return scenarios.reduce(
    (sum, s) => sum + (weight[s.feasibility] ?? 0) * s.yield.annualNoiUpliftHigh,
    0,
  );
}

const HERO_THESIS =
  "Underbuilt urban parcel with meaningful vertical capacity and premium repositioning optionality.";

type DashboardDealOverviewProps = {
  properties: PropertyRow[];
  isDemo?: boolean;
  marketCities?: CityGroup[];
};

export function DashboardDealOverview({
  properties,
  isDemo = false,
  marketCities = [],
}: DashboardDealOverviewProps) {
  if (properties.length === 0) return null;

  const [heroProp] = selectTopOpportunities(properties, 1);
  const topThree = selectTopOpportunities(properties, 3);
  const scoreById = computeOpportunityScores(properties);

  const totalOpportunity = properties.reduce(
    (sum, p) => sum + (getDisplayMetricsForRow(p).opportunity_value ?? 0),
    0,
  );
  const totalUnused = properties.reduce(
    (sum, p) => sum + getDisplayMetricsForRow(p).unused_buildable_sqft,
    0,
  );
  const activeDeals = properties.filter(
    (p) => normalizePropertyStatus(p.status) !== "Passed",
  ).length;

  const bySpeed = [...properties].sort(
    (a, b) =>
      getOpportunityEngineRead(b).speedToValueScore -
      getOpportunityEngineRead(a).speedToValueScore,
  )[0];
  const byComplexity = [...properties].sort(
    (a, b) =>
      getOpportunityEngineRead(a).complexityScore -
      getOpportunityEngineRead(b).complexityScore,
  )[0];
  const byAmenity = [...properties].sort(
    (a, b) => amenityActivationIndex(b) - amenityActivationIndex(a),
  )[0];

  const heroM = getDisplayMetricsForRow(heroProp);
  const heroOpp = heroM.opportunity_value ?? 0;
  const heroScore =
    scoreById.get(heroProp.id) ?? computeOpportunityScoreForProperty(heroProp);
  const heroPriority = opportunityPriorityLabel(heroScore);
  const maxFar = num(heroProp.max_far);
  const farHeadroom = Math.max(0, maxFar - heroM.current_built_far);
  const insightBullets: [string, string] = [
    `${formatSqft(heroM.unused_buildable_sqft)} sq ft unused buildable in the modeled envelope.`,
    `${formatFar(heroM.current_built_far)} built FAR vs ${formatFar(maxFar)} max · ${formatFar(farHeadroom)} headroom · ${heroProp.zoning_district}.`,
  ];

  const stripCities = marketCities.length > 0 ? marketCities : [];

  return (
    <div className="space-y-8 sm:space-y-9 lg:space-y-10">
      {heroProp ? (
        <DashboardHeroTopDeal
          property={heroProp}
          opportunityValue={heroOpp}
          opportunityScore={Math.round(heroScore)}
          priorityLabel={heroPriority}
          thesisLine={HERO_THESIS}
          insightBullets={insightBullets}
          isDemo={isDemo}
        />
      ) : null}

      {stripCities.length > 0 ? (
        <MarketIntelligenceStrip cities={stripCities} isDemo={isDemo} />
      ) : null}

      <DashboardMetricRow
        metrics={[
          {
            label: "Total opportunity value",
            value: formatMoney(totalOpportunity),
            hint: "Aggregate modeled implied upside across the portfolio.",
          },
          {
            label: "Total unused buildable sq ft",
            value: `${formatSqft(totalUnused)} sq ft`,
            hint: "Combined slack in modeled as-of-right buildable area.",
          },
          {
            label: "Active deals",
            value: String(activeDeals),
            hint: "Pipeline positions not marked passed.",
          },
        ]}
      />

      <DashboardDataCoverageSection />

      <section aria-labelledby="deal-snapshots-heading" className="space-y-5 sm:space-y-6">
        <div>
          <h2
            id="deal-snapshots-heading"
            className="text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-neutral-400"
          >
            Top opportunities
          </h2>
          <p className="mt-2 max-w-lg text-sm leading-relaxed text-neutral-500">
            Highest-ranked snapshots — open any row for full diligence and deal room.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {topThree.map((p) => {
            const m = getDisplayMetricsForRow(p);
            const score = scoreById.get(p.id) ?? computeOpportunityScoreForProperty(p);
            const pr = opportunityPriorityLabel(score);
            return (
              <DealSnapshotCard
                key={p.id}
                property={p}
                impliedUpside={m.opportunity_value ?? 0}
                unusedBuildableSqft={m.unused_buildable_sqft}
                builtFar={m.current_built_far}
                maxFar={num(p.max_far)}
                score={score}
                priorityLabel={pr}
                isDemo={isDemo}
              />
            );
          })}
        </div>
      </section>

      <SignalStrip
        signals={[
          {
            label: "Fastest to value",
            title: bySpeed?.address ?? "—",
            detail: bySpeed
              ? getOpportunityEngineRead(bySpeed).speedToValueLabel
              : "—",
          },
          {
            label: "Lowest complexity",
            title: byComplexity?.address ?? "—",
            detail: byComplexity
              ? getOpportunityEngineRead(byComplexity).complexityLabel
              : "—",
          },
          {
            label: "Highest amenity activation",
            title: byAmenity?.address ?? "—",
            detail: byAmenity
              ? `Modeled scenario stack (high end) ${formatMoney(amenityActivationIndex(byAmenity))} /yr`
              : "—",
          },
        ]}
      />
    </div>
  );
}
