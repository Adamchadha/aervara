import Link from "next/link";
import { redirect } from "next/navigation";
import { DemoDashboardBanner } from "@/components/demo/demo-dashboard-banner";
import { UpgradeToProBanner } from "@/components/billing/upgrade-to-pro-banner";
import { DashboardProperties } from "@/components/properties/dashboard-properties";
import { DashboardDealOverview } from "@/components/properties/dashboard-deal-overview";
import { EmptyState } from "@/components/states/empty-state";
import { Button } from "@/components/ui/button";
import { getPlanAccess } from "@/lib/plan-access";
import { createClient } from "@/lib/supabase/server";
import {
  fetchExclusivityRow,
  isApprovedForPlatform,
} from "@/lib/exclusivity-access";
import { isDemoMode, requestFullAccessHref } from "@/lib/demo-flow";
import { withDemoQuery } from "@/lib/demo-query";
import { groupPropertiesByCity } from "@/lib/city-scan";
import { formatMoney } from "@/lib/far-calculations";
import { dashboardEmptyDescription } from "@/lib/user-role-display";
import { getEffectiveUserRole } from "@/lib/user-profile-db";
import type { PropertyRow } from "@/types/property";

type DashboardPageProps = {
  searchParams: Promise<{
    imported?: string;
    skipped?: string;
    demo?: string;
  }>;
};

function parseCount(raw: string | undefined): number | null {
  if (raw === undefined || raw === "") return null;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const q = await searchParams;
  const importedCount = parseCount(q.imported);
  const skippedCount = parseCount(q.skipped);
  const isDemo = isDemoMode(q.demo);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
        Could not load properties: {error.message}
      </div>
    );
  }

  const allRows = (data ?? []) as PropertyRow[];

  const plan =
    user != null
      ? await getPlanAccess(supabase, user.id, user.email, {
          isProPreview: isDemo,
        })
      : null;
  if (user) {
    const exclusivityRow = await fetchExclusivityRow(supabase, user.id);
    if (!isApprovedForPlatform(exclusivityRow, { isDemo, userId: user.id })) {
      const dashPath = withDemoQuery("/dashboard", isDemo);
      redirect(
        requestFullAccessHref({
          nextPath: dashPath,
          sourceRoute: dashPath,
        }),
      );
    }
  }

  const viewerRole =
    user != null ? await getEffectiveUserRole(supabase, user) : null;

  const rows = allRows.filter(
    (r) => plan?.canViewPremiumProperties || r.is_premium !== true,
  );
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

  const atFreePropertyLimit =
    !isDemo &&
    plan != null &&
    !plan.hasProAccess &&
    plan.propertyCount >= plan.freePropertyLimit;

  return (
    <div className="space-y-10 lg:space-y-12">
      <DemoDashboardBanner
        isDemo={isDemo}
        unlockedValueLabel={unlockedValueLabel}
        marketLabel={marketLabel}
      />

      {!isDemo && importedCount !== null && importedCount > 0 ? (
        <div className="rounded-2xl border border-stone-200/60 bg-gradient-to-b from-stone-50/95 to-white px-6 py-4 text-sm text-neutral-800 shadow-[0_2px_8px_rgba(15,23,42,0.04),0_16px_40px_-24px_rgba(15,23,42,0.08)] ring-1 ring-stone-900/[0.03] transition-shadow duration-500 ease-out">
          <p className="font-medium leading-relaxed">
            Successfully imported {importedCount}{" "}
            {importedCount === 1 ? "property" : "properties"}.
            {skippedCount !== null && skippedCount > 0
              ? ` ${skippedCount} row${skippedCount === 1 ? "" : "s"} failed validation or insert. Open Import from the header to fix your CSV and preview again.`
              : " They appear immediately below—sort by air-rights value, underbuilt score, or switch to map view to screen geographically."}
          </p>
        </div>
      ) : null}

      {atFreePropertyLimit ? (
        <UpgradeToProBanner
          variant="limit"
          hidden={!!plan?.hasProAccess}
          devGateDebug={plan?.gateDebug}
        />
      ) : null}

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
        {isDemo ? (
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
        ) : (
          <div className="flex flex-wrap gap-3 sm:justify-end">
            {plan?.canUseCsvImport ? (
              <Button variant="secondary" asChild>
                <Link href={withDemoQuery("/properties/import", isDemo)}>
                  Import CSV
                </Link>
              </Button>
            ) : (
              <Button variant="secondary" disabled className="cursor-not-allowed opacity-55">
                Import CSV (Pro)
              </Button>
            )}
            {plan?.canAddMoreProperties ? (
              <Button asChild>
                <Link href={withDemoQuery("/properties/new", isDemo)}>Add property</Link>
              </Button>
            ) : (
              <Button asChild>
                <Link
                  href={requestFullAccessHref({
                    nextPath: withDemoQuery("/dashboard", isDemo),
                    sourceRoute: withDemoQuery("/dashboard", isDemo),
                  })}
                >
                  Request Full Access
                </Link>
              </Button>
            )}
          </div>
        )}
      </div>

      {rows.length === 0 ? (
        <EmptyState
          title="No properties yet"
          description={dashboardEmptyDescription(viewerRole)}
          action={
            <div className="flex flex-wrap justify-center gap-3">
              {isDemo ? (
                <>
                  <Button disabled className="cursor-not-allowed opacity-55">
                    Add your first property
                  </Button>
                  <Button variant="secondary" disabled className="cursor-not-allowed opacity-55">
                    Import CSV
                  </Button>
                  <p className="w-full text-center text-xs text-neutral-500">
                    Available with full access
                  </p>
                </>
              ) : (
                <>
                  <Button asChild>
                    <Link href={withDemoQuery("/properties/new", isDemo)}>
                      Add your first property
                    </Link>
                  </Button>
                  {plan?.canUseCsvImport ? (
                    <Button variant="secondary" asChild>
                      <Link href={withDemoQuery("/properties/import", isDemo)}>
                        Import CSV
                      </Link>
                    </Button>
                  ) : (
                    <Button variant="secondary" disabled className="cursor-not-allowed opacity-55">
                      Import CSV (Pro)
                    </Button>
                  )}
                </>
              )}
            </div>
          }
        />
      ) : (
        <div className="space-y-24 lg:space-y-32">
          <DashboardDealOverview
            properties={rows}
            isDemo={isDemo}
            marketCities={allCityGroups}
          />
          <DashboardProperties properties={rows} isDemo={isDemo} />
        </div>
      )}
    </div>
  );
}
