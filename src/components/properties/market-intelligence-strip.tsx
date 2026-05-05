import Link from "next/link";
import { formatMoney } from "@/lib/far-calculations";
import { withDemoQuery } from "@/lib/demo-query";
import type { CityGroup } from "@/lib/city-scan";

type MarketIntelligenceStripProps = {
  cities: CityGroup[];
  isDemo?: boolean;
  /** Standalone `/demo`: city drill-down lives behind auth — render labels only. */
  publicDemo?: boolean;
};

/** Bloomberg-style metadata row: city · unlocked · parcels. */
export function MarketIntelligenceStrip({
  cities,
  isDemo = false,
  publicDemo = false,
}: MarketIntelligenceStripProps) {
  if (cities.length === 0) return null;
  return (
    <section
      className="rounded-xl border border-stone-200/70 bg-white/82 px-5 py-4 shadow-[0_8px_24px_rgba(15,23,42,0.045)] backdrop-blur-sm sm:px-6"
      aria-label="Markets by unlocked value"
    >
      <p className="text-[0.62rem] font-medium uppercase tracking-[0.22em] text-stone-500">
        Market intelligence
      </p>
      <div className="mt-2.5 flex flex-wrap items-baseline gap-x-0 gap-y-1.5 text-[0.8rem] leading-snug text-stone-700">
        {cities.map((g, i) => (
          <span key={`${g.city}-${g.state}`} className="inline-flex flex-wrap items-baseline">
            {i > 0 ? (
              <span
                className="mx-3 select-none text-stone-300 sm:mx-4"
                aria-hidden
              >
                |
              </span>
            ) : null}
            {publicDemo ? (
              <span className="inline-flex flex-wrap items-baseline gap-x-1.5">
                <span className="font-semibold text-stone-950">{g.city}</span>
                <span className="text-stone-300" aria-hidden>
                  ·
                </span>
                <span className="tabular-nums text-stone-700">
                  {formatMoney(g.totalPotentialValueUnlocked)} unlocked
                </span>
                <span className="text-stone-300" aria-hidden>
                  ·
                </span>
                <span className="tabular-nums text-stone-700">
                  {g.count} parcel{g.count === 1 ? "" : "s"}
                </span>
              </span>
            ) : (
              <Link
                href={withDemoQuery(`/city/${encodeURIComponent(g.city)}`, isDemo)}
                className="group inline-flex flex-wrap items-baseline gap-x-1.5 transition-colors hover:text-stone-950"
              >
                <span className="font-semibold text-stone-950 group-hover:text-stone-950">
                  {g.city}
                </span>
                <span className="text-stone-300" aria-hidden>
                  ·
                </span>
                <span className="tabular-nums text-stone-700">
                  {formatMoney(g.totalPotentialValueUnlocked)} unlocked
                </span>
                <span className="text-stone-300" aria-hidden>
                  ·
                </span>
                <span className="tabular-nums text-stone-700">
                  {g.count} parcel{g.count === 1 ? "" : "s"}
                </span>
              </Link>
            )}
          </span>
        ))}
      </div>
    </section>
  );
}
