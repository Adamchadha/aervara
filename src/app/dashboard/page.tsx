import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/states/empty-state";
import { DashboardProperties } from "@/components/properties/dashboard-properties";
import { TopOpportunities } from "@/components/properties/top-opportunities";
import { selectTopOpportunities } from "@/lib/top-opportunities";
import type { PropertyRow } from "@/types/property";

type DashboardPageProps = {
  searchParams: Promise<{ imported?: string; skipped?: string }>;
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

  const supabase = await createClient();
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

  const rows = (data ?? []) as PropertyRow[];
  const topDeals = selectTopOpportunities(rows, 3);

  return (
    <div className="space-y-10 lg:space-y-12">
      {importedCount !== null && importedCount > 0 ? (
        <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/90 px-4 py-3 text-sm text-emerald-950 shadow-sm">
          <p className="font-medium">
            Successfully imported {importedCount}{" "}
            {importedCount === 1 ? "property" : "properties"}.
            {skippedCount !== null && skippedCount > 0
              ? ` ${skippedCount} row${skippedCount === 1 ? "" : "s"} were skipped (validation or database errors). Review your CSV or try importing again.`
              : " New deals appear in your ranked list below—sort by opportunity value or underbuilt score to prioritize."}
          </p>
        </div>
      ) : null}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-950">
            Properties
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Rank parcels by underbuilt score and implied upside before you dig into
            diligence.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 sm:justify-end">
          <Button variant="secondary" asChild>
            <Link href="/properties/import">Import CSV</Link>
          </Button>
          <Button asChild>
            <Link href="/properties/new">Add property</Link>
          </Button>
        </div>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          title="No properties yet"
          description="Capture street address, zoning, lot and built area, max FAR, and optional $ per buildable square foot. Aervara computes underbuilt score and opportunity value automatically."
          action={
            <div className="flex flex-wrap justify-center gap-3">
              <Button asChild>
                <Link href="/properties/new">Add your first property</Link>
              </Button>
              <Button variant="secondary" asChild>
                <Link href="/properties/import">Import CSV</Link>
              </Button>
            </div>
          }
        />
      ) : (
        <div className="space-y-14 lg:space-y-16">
          <TopOpportunities properties={topDeals} />
          <DashboardProperties properties={rows} />
        </div>
      )}
    </div>
  );
}
