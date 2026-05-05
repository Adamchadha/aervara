import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ProPreviewChrome } from "@/components/billing/pro-preview-chrome";
import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";
import {
  assetTypeLabel,
  classifyAssetTypeFromZoning,
  filterCityProperties,
  rankCityOpportunities,
  type AssetTypeClass,
} from "@/lib/city-scan";
import {
  fetchExclusivityRow,
  isApprovedForPlatform,
} from "@/lib/exclusivity-access";
import { isDemoMode, requestFullAccessHref } from "@/lib/demo-flow";
import { withDemoQuery } from "@/lib/demo-query";
import { PlanGateDebugRibbon } from "@/components/dev/plan-gate-debug-ribbon";
import { getPlanAccess } from "@/lib/plan-access";
import { getDisplayMetricsForRow } from "@/lib/property-display-metrics";
import { createClient } from "@/lib/supabase/server";
import { formatFar, formatMoney, formatSqft } from "@/lib/far-calculations";
import type { PropertyRow } from "@/types/property";

type CityPageProps = {
  params: Promise<{ name: string }>;
  searchParams: Promise<{
    zoning?: string;
    minFar?: string;
    assetType?: string;
    demo?: string;
  }>;
};

const ASSET_TYPE_OPTIONS: Array<AssetTypeClass | "all"> = [
  "all",
  "multifamily",
  "mixed_use",
  "industrial",
  "office",
  "retail",
  "hospitality",
  "other",
];

function parseMinFar(raw: string | undefined): number | null {
  if (!raw) return null;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0) return null;
  return n;
}

export default async function CityScanPage({ params, searchParams }: CityPageProps) {
  const { name } = await params;
  const query = await searchParams;
  const isDemo = isDemoMode(query.demo);
  const decodedCity = decodeURIComponent(name).trim();
  if (!decodedCity) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(
      `/login?redirect=${encodeURIComponent(withDemoQuery(`/city/${name}`, isDemo))}`,
    );
  }

  const exclusivityRow = await fetchExclusivityRow(supabase, user.id);
  if (!isApprovedForPlatform(exclusivityRow, { isDemo, userId: user.id })) {
    const cityPath = withDemoQuery(`/city/${name}`, isDemo);
    redirect(requestFullAccessHref({ nextPath: cityPath, sourceRoute: cityPath }));
  }

  const plan = await getPlanAccess(supabase, user.id, user.email, {
    isProPreview: isDemo,
  });

  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("user_id", user.id)
    .ilike("city", decodedCity)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 text-sm text-red-700">
        Could not load city scan: {error.message}
      </div>
    );
  }

  const baseRows = ((data ?? []) as PropertyRow[]).filter(
    (r) => plan.canViewPremiumProperties || r.is_premium !== true,
  );
  if (baseRows.length === 0) notFound();

  const assetTypeRaw = query.assetType ?? "all";
  const assetType: AssetTypeClass | "all" = ASSET_TYPE_OPTIONS.includes(
    assetTypeRaw as AssetTypeClass | "all",
  )
    ? (assetTypeRaw as AssetTypeClass | "all")
    : "all";

  const filtered = filterCityProperties(baseRows, {
    zoning: query.zoning ?? "",
    minFar: parseMinFar(query.minFar),
    assetType,
  });
  const ranked = rankCityOpportunities(filtered);

  const totalUnusedFar = filtered.reduce(
    (sum, p) => sum + getDisplayMetricsForRow(p).unused_vertical_capacity,
    0,
  );
  const totalPotentialValueUnlocked = filtered.reduce(
    (sum, p) => sum + (getDisplayMetricsForRow(p).air_rights_value ?? 0),
    0,
  );

  const cityHeaderApplyHref = requestFullAccessHref({
    nextPath: withDemoQuery(`/city/${name}`, isDemo),
    sourceRoute: withDemoQuery(`/city/${name}`, isDemo),
  });

  return (
    <div className="min-h-full bg-[radial-gradient(circle_at_top_right,#0f172a,#020617_55%,#020617)] text-stone-100">
      <SiteHeader
        demoAccess={isDemo}
        accessRequestHref={isDemo ? cityHeaderApplyHref : undefined}
      />
      <PlanGateDebugRibbon isProPreview={isDemo} />
      <ProPreviewChrome />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-300/90">
              City Scan
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              {decodedCity}
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-stone-300">
              Institutional-grade readout of vertical slack, monetizable air rights,
              and ranked parcel priority.
            </p>
          </div>
          <Button variant="secondary" asChild className="border-white/20 bg-white/5 text-white hover:bg-white/10">
            <Link href={withDemoQuery("/dashboard", isDemo)}>Back to dashboard</Link>
          </Button>
        </div>

        <section className="mt-6 grid gap-4 sm:grid-cols-2">
          <StatCard
            label="Total unused FAR in city"
            value={formatFar(totalUnusedFar)}
            sub="Aggregate unbuilt vertical envelope"
          />
          <StatCard
            label="Total potential value unlocked"
            value={formatMoney(totalPotentialValueUnlocked)}
            sub="Air-rights valuation across filtered inventory"
          />
        </section>

        <form className="mt-6 grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 sm:grid-cols-4">
          {isDemo ? <input type="hidden" name="demo" value="true" /> : null}
          <input type="hidden" name="assetType" value={assetType} />
          <label className="text-xs text-stone-300">
            Zoning
            <input
              name="zoning"
              defaultValue={query.zoning ?? ""}
              className="mt-1 h-10 w-full rounded-lg border border-white/15 bg-black/30 px-3 text-sm text-white outline-none focus:border-cyan-300/70"
              placeholder="e.g. C, MX, RM"
            />
          </label>
          <label className="text-xs text-stone-300">
            Min FAR
            <input
              name="minFar"
              type="number"
              inputMode="decimal"
              min={0}
              step="0.1"
              defaultValue={query.minFar ?? ""}
              className="mt-1 h-10 w-full rounded-lg border border-white/15 bg-black/30 px-3 text-sm text-white outline-none focus:border-cyan-300/70"
              placeholder="0.0"
            />
          </label>
          <label className="text-xs text-stone-300">
            Asset type
            <select
              name="assetType"
              defaultValue={assetType}
              className="mt-1 h-10 w-full rounded-lg border border-white/15 bg-black/30 px-3 text-sm text-white outline-none focus:border-cyan-300/70"
            >
              {ASSET_TYPE_OPTIONS.map((option) => (
                <option key={option} value={option} className="bg-slate-900 text-white">
                  {option === "all" ? "All asset types" : assetTypeLabel(option)}
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-end">
            <Button className="h-10 w-full rounded-lg bg-cyan-400 text-slate-950 hover:bg-cyan-300">
              Apply filters
            </Button>
          </div>
        </form>

        <section className="mt-6 rounded-2xl border border-white/10 bg-black/25">
          <div className="border-b border-white/10 px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-stone-300">
            Top opportunities ({ranked.length})
          </div>
          <ul className="divide-y divide-white/10">
            {ranked.map((p, i) => {
              const m = getDisplayMetricsForRow(p);
              return (
                <li key={p.id} className="grid gap-4 px-4 py-4 sm:grid-cols-[48px_minmax(0,1fr)_170px_150px_130px] sm:items-center">
                  <div className="font-mono text-sm text-cyan-300">#{i + 1}</div>
                  <div>
                    <Link
                      href={withDemoQuery(`/properties/${p.id}`, isDemo)}
                      className="text-sm font-semibold text-white hover:text-cyan-300"
                    >
                      {p.address}
                    </Link>
                    <p className="mt-1 text-xs text-stone-400">
                      {p.city}, {p.state} · {p.zoning_district} ·{" "}
                      {assetTypeLabel(classifyAssetTypeFromZoning(p.zoning_district))}
                    </p>
                  </div>
                  <MetricChip
                    label="Unused buildable"
                    value={`${formatSqft(m.unused_buildable_sqft)} sf`}
                  />
                  <MetricChip label="Air rights value" value={formatMoney(m.air_rights_value)} />
                  <MetricChip label="Underbuilt" value={`${m.underbuilt_score}%`} />
                </li>
              );
            })}
          </ul>
        </section>
      </main>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/25 px-5 py-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-400">
        {label}
      </p>
      <p className="mt-2 font-mono text-2xl font-semibold tracking-tight text-white">
        {value}
      </p>
      <p className="mt-2 text-xs text-stone-400">{sub}</p>
    </div>
  );
}

function MetricChip({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-400">
        {label}
      </p>
      <p className="mt-1 font-mono text-sm font-semibold tabular-nums text-white">{value}</p>
    </div>
  );
}

