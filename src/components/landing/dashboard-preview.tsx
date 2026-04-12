import { cn } from "@/lib/utils";

/**
 * Decorative product frame for the marketing page (no live data).
 */
export function LandingDashboardPreview({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative mx-auto max-w-5xl",
        "rounded-2xl border border-neutral-200/60 bg-white",
        "shadow-[0_2px_8px_rgba(15,23,42,0.04),0_32px_64px_-24px_rgba(15,23,42,0.12)] ring-1 ring-neutral-950/[0.04]",
        className,
      )}
    >
      <div className="flex h-11 items-center gap-2 border-b border-neutral-100/90 bg-neutral-50/80 px-4">
        <span className="h-2.5 w-2.5 rounded-full bg-neutral-300/90" aria-hidden />
        <span className="h-2.5 w-2.5 rounded-full bg-neutral-200" aria-hidden />
        <span className="h-2.5 w-2.5 rounded-full bg-neutral-200" aria-hidden />
        <span className="ml-3 font-mono text-[11px] text-neutral-400">
          app.aervara.com/dashboard
        </span>
      </div>

      <div className="bg-neutral-50/40 p-5 sm:p-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold tracking-tight text-neutral-950">
              Properties
            </h3>
            <p className="mt-1 text-sm text-neutral-500">
              Rank parcels by opportunity before diligence.
            </p>
          </div>
          <div className="inline-flex self-start rounded-lg border border-neutral-200/80 bg-white p-0.5 shadow-sm">
            <span className="rounded-md bg-white px-3 py-1.5 text-xs font-medium text-neutral-950 shadow-sm">
              List view
            </span>
            <span className="rounded-md px-3 py-1.5 text-xs font-medium text-neutral-500">
              Map view
            </span>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <PreviewPropertyCard
            opportunity="$2,847,000"
            address="1842 N Milwaukee Ave"
            city="Chicago, IL"
            read="Strong residential or multifamily infill candidate"
            flags={["Large FAR gap", "Fast path to value"]}
            score="78%"
          />
          <PreviewPropertyCard
            opportunity="$1,120,000"
            address="2200 W Division St"
            city="Chicago, IL"
            read="Moderate add-on development play"
            flags={["Moderate complexity", "Mixed-use zoning"]}
            score="52%"
            muted
          />
        </div>
      </div>
    </div>
  );
}

function PreviewPropertyCard({
  opportunity,
  address,
  city,
  read,
  flags,
  score,
  muted,
}: {
  opportunity: string;
  address: string;
  city: string;
  read: string;
  flags: string[];
  score: string;
  muted?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-2xl border bg-white text-left",
        muted
          ? "border-neutral-200/70 shadow-sm ring-1 ring-neutral-950/[0.03]"
          : "border-amber-200/50 shadow-[0_2px_12px_rgba(180,83,9,0.06),0_16px_40px_-20px_rgba(15,23,42,0.08)] ring-1 ring-amber-400/20",
      )}
    >
      <div className="border-b border-neutral-100/80 px-5 pb-5 pt-5 sm:px-6 sm:pt-6">
        {muted ? null : (
          <p className="mb-3 inline-flex rounded-full border border-amber-200/80 bg-amber-50/90 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-950">
            Top deal
          </p>
        )}
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
          Opportunity value
        </p>
        <p className="mt-2 font-mono text-2xl font-semibold tracking-tight text-neutral-950 sm:text-3xl">
          {opportunity}
        </p>
        <p className="mt-2 text-xs text-neutral-500">
          Implied upside from unused buildable area
        </p>
      </div>
      <div className="flex items-start justify-between gap-3 border-b border-neutral-100/80 px-5 py-4 sm:px-6">
        <div>
          <p className="text-sm font-semibold text-neutral-950">{address}</p>
          <p className="mt-0.5 text-xs text-neutral-500">{city}</p>
        </div>
        <span className="shrink-0 rounded-lg border border-emerald-200/90 bg-emerald-50/90 px-2.5 py-1 text-xs font-semibold tabular-nums text-emerald-900">
          {score}
        </span>
      </div>
      <div className="bg-gradient-to-b from-neutral-50/90 to-white/50 px-4 py-4 sm:px-5">
        <div className="flex gap-3 rounded-xl p-3 ring-1 ring-neutral-950/[0.05]">
          <div
            className="w-1 shrink-0 self-stretch rounded-full bg-neutral-900/85"
            aria-hidden
          />
          <div className="min-w-0">
            <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-neutral-500">
              Aervara Read
            </p>
            <p className="mt-1.5 text-xs font-semibold leading-snug text-neutral-950">
              {read}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {flags.map((f) => (
                <span
                  key={f}
                  className="rounded-full border border-neutral-200/70 bg-white/90 px-2 py-0.5 text-[10px] font-medium text-neutral-700"
                >
                  {f}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
