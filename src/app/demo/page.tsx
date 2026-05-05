import { DemoDashboardBanner } from "@/components/demo/demo-dashboard-banner";
import { DashboardDealOverview } from "@/components/properties/dashboard-deal-overview";
import { DashboardProperties } from "@/components/properties/dashboard-properties";
import { Button } from "@/components/ui/button";
import { groupPropertiesByCity } from "@/lib/city-scan";
import { formatMoney } from "@/lib/far-calculations";
import {
  getPublicDemoProperties,
  PUBLIC_DEMO_HERO_ADDRESS,
} from "@/lib/public-demo-properties";

export default function PublicDemoDashboardPage() {
  const rows = getPublicDemoProperties();
  const heroId = rows.find((p) => p.address === PUBLIC_DEMO_HERO_ADDRESS)?.id;
  const allCityGroups = groupPropertiesByCity(rows);
  const topMarket = allCityGroups.reduce<
    { city: string; totalPotentialValueUnlocked: number } | null
  >((acc, group) => {
    if (!acc) return group;
    return group.totalPotentialValueUnlocked > acc.totalPotentialValueUnlocked
      ? group
      : acc;
  }, null);
  const unlockedValueLabel = formatMoney(
    allCityGroups.reduce((sum, g) => sum + g.totalPotentialValueUnlocked, 0),
  );
  const marketLabel = topMarket?.city ?? "selected markets";

  return (
    <div className="space-y-10 lg:space-y-12">
      <DemoDashboardBanner
        isDemo
        publicDemo
        unlockedValueLabel={unlockedValueLabel}
        marketLabel={marketLabel}
      />

      <div
        id="live-opportunities"
        className="scroll-mt-28 flex flex-col gap-4 pb-0 sm:flex-row sm:items-end sm:justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-[-0.035em] text-neutral-950 sm:text-[1.75rem] sm:leading-snug">
            Live opportunities
          </h1>
          <p className="mt-2.5 max-w-md text-sm leading-relaxed text-neutral-500">
            Command center for ranked upside, then your full pipeline.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-neutral-400">
            <p>Auto-ranked across {rows.length} properties</p>
            <span className="hidden h-1 w-1 rounded-full bg-neutral-300 sm:inline-block" />
            <p>Updated just now</p>
          </div>
        </div>
        <div className="space-y-2.5 sm:text-right">
          <div className="flex flex-wrap gap-3 sm:justify-end">
            <Button variant="secondary" disabled className="cursor-not-allowed opacity-55">
              Import CSV
            </Button>
            <Button disabled className="cursor-not-allowed opacity-55">
              Add property
            </Button>
          </div>
          <p className="text-xs text-neutral-500">Available with full access</p>
        </div>
      </div>

      <div className="space-y-24 lg:space-y-32">
        <DashboardDealOverview
          properties={rows}
          isDemo
          publicDemo
          pinHeroPropertyId={heroId}
          pinHeroOpportunityScore={heroId != null ? 80 : undefined}
          marketCities={allCityGroups}
        />
        <DashboardProperties properties={rows} isDemo publicDemo />
      </div>

    </div>
  );
}
