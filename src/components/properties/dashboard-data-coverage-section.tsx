const SOURCES = [
  {
    name: "Parcel/GIS records",
    badge: "Manual · Not connected",
    purpose: "Official parcel boundaries, dimensions, and identifiers.",
    confidence: "Low until linked",
  },
  {
    name: "Zoning maps",
    badge: "Manual · Not connected",
    purpose: "District overlays and as-of-right capacity references.",
    confidence: "Low until linked",
  },
  {
    name: "Assessor values",
    badge: "Not connected",
    purpose: "Tax roll land and improvement values for benchmarking.",
    confidence: "Not connected",
  },
  {
    name: "Sales/deed records",
    badge: "Not connected",
    purpose: "Arms-length comps and ownership transfers.",
    confidence: "Not connected",
  },
  {
    name: "Building permits",
    badge: "Not connected",
    purpose: "Issued work, renovations, and certificate history.",
    confidence: "Not connected",
  },
] as const;

export function DashboardDataCoverageSection() {
  return (
    <section aria-labelledby="data-coverage-heading" className="space-y-4">
      <div>
        <h2
          id="data-coverage-heading"
          className="text-lg font-semibold tracking-tight text-stone-950 sm:text-xl"
        >
          Data coverage & source readiness
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-stone-600">
          Connect parcel, zoning, assessment, permit, and ownership records to increase confidence.
        </p>
      </div>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {SOURCES.map((row) => (
          <li
            key={row.name}
            className="flex flex-col rounded-2xl border border-stone-200/70 bg-white/78 p-4 shadow-[0_10px_30px_rgba(15,23,42,0.045)] backdrop-blur-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <p className="text-sm font-semibold leading-snug text-stone-900">{row.name}</p>
              <span className="shrink-0 rounded-full border border-stone-200/90 bg-stone-50/95 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-stone-600">
                {row.badge}
              </span>
            </div>
            <p className="mt-3 flex-1 text-[11px] leading-relaxed text-stone-600">{row.purpose}</p>
            <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-stone-500">
              Confidence: <span className="text-stone-700">{row.confidence}</span>
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
