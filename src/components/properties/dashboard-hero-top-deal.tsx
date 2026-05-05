"use client";

import Link from "next/link";
import { AnimatedMeterBar } from "@/components/properties/dashboard-animated-meter-bar";
import { AnimatedMoneyValue } from "@/components/ui/animated-money-value";
import { withDemoQuery } from "@/lib/demo-query";
import { formatMoney } from "@/lib/far-calculations";
import { cn } from "@/lib/utils";
import type { PropertyRow } from "@/types/property";

const IMPLIED_UPSIDE_COMPACT_MIN = 1_000_000;

const impliedUpsideValueClassName =
  "max-w-full truncate text-[clamp(2.5rem,5vw,4.5rem)] font-black tracking-[-0.05em] leading-none text-stone-950 whitespace-nowrap";

/** Short display for large implied upside (presentation only; same underlying amount). */
function formatCompactImpliedUpside(amount: number): string {
  if (!Number.isFinite(amount)) return "—";
  const sign = amount < 0 ? "-" : "";
  const v = Math.round(Math.abs(amount));
  if (v >= 1_000_000_000) {
    const b = v / 1_000_000_000;
    const q =
      b >= 10 || Math.abs(b - Math.round(b)) < 1e-6
        ? String(Math.round(b))
        : b.toFixed(1).replace(/\.0$/, "");
    return `${sign}$${q}B`;
  }
  if (v >= IMPLIED_UPSIDE_COMPACT_MIN) {
    const m = v / 1_000_000;
    const q =
      m >= 100 || Math.abs(m - Math.round(m)) < 1e-6
        ? String(Math.round(m))
        : m.toFixed(1).replace(/\.0$/, "");
    return `${sign}$${q}M`;
  }
  return formatMoney(Math.round(amount));
}

function clampPercent(v: number): number {
  if (!Number.isFinite(v)) return 0;
  return Math.min(100, Math.max(0, v));
}

type DashboardHeroTopDealProps = {
  property: PropertyRow;
  opportunityValue: number;
  opportunityScore: number;
  priorityLabel: string;
  thesisLine: string;
  insightBullets: [string, string];
  isDemo?: boolean;
};

export function DashboardHeroTopDeal({
  property: p,
  opportunityValue,
  opportunityScore,
  priorityLabel,
  thesisLine,
  insightBullets,
  isDemo = false,
}: DashboardHeroTopDealProps) {
  const scorePct = clampPercent(opportunityScore);
  const showCompactUpside =
    Number.isFinite(opportunityValue) && Math.abs(opportunityValue) >= IMPLIED_UPSIDE_COMPACT_MIN;

  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#071827] shadow-[0_24px_80px_rgba(15,23,42,0.22)]">
      <img
        src="/images/aervara-parcel-diagram.png"
        alt=""
        className="pointer-events-none absolute inset-0 h-full w-full object-cover object-[62%_50%] opacity-[0.38] [filter:contrast(1.1)_brightness(1.05)_saturate(0.95)]"
      />
      <div className="pointer-events-none absolute inset-0 bg-[#071827]/50" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/20" />

      <div className="pointer-events-none absolute bottom-4 left-6 z-[5] max-w-[14rem] sm:bottom-5 sm:left-8 sm:max-w-xs">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/70 [text-shadow:0_1px_2px_rgba(0,0,0,0.45)]">
          Illustrative only
        </p>
        <p className="mt-1 text-[9px] font-medium leading-snug text-white/55 [text-shadow:0_1px_2px_rgba(0,0,0,0.4)]">
          Not a surveyed parcel boundary or approved building footprint.
        </p>
      </div>

      <div className="relative z-10">
        <div className="relative grid gap-12 px-8 py-12 text-white sm:gap-14 sm:px-12 sm:py-14 lg:grid-cols-[minmax(0,1.12fr)_minmax(260px,0.88fr)] lg:items-stretch lg:gap-16 lg:px-14 lg:py-16">
          <div className="flex min-w-0 flex-col justify-between gap-10">
            <div className="space-y-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-white/70 [text-shadow:0_1px_2px_rgba(0,0,0,0.35)]">
                Deal command center
              </p>
              <h2
                className="
                  text-balance text-4xl font-extrabold leading-tight tracking-tight text-white drop-shadow-sm
                  [letter-spacing:-0.02em]
                  [text-shadow:0_2px_6px_rgba(0,0,0,0.5)]
                  lg:text-5xl
                "
              >
                {p.address}
              </h2>
              <p className="text-lg font-bold tracking-[0.015em] text-white [text-shadow:0_2px_6px_rgba(0,0,0,0.5)]">
                {p.city}, {p.state}
              </p>
              <p className="max-w-xl text-lg font-bold tracking-[0.015em] leading-relaxed text-white [text-shadow:0_2px_6px_rgba(0,0,0,0.5)]">
                {thesisLine}
              </p>
              <ul className="space-y-2.5 border-l-2 border-white/25 pl-4 text-base font-bold tracking-[0.015em] leading-relaxed text-white [text-shadow:0_2px_6px_rgba(0,0,0,0.5)]">
                <li className="relative">
                  <span className="absolute -left-4 top-2 h-1 w-1 rounded-full bg-white/45" />
                  {insightBullets[0]}
                </li>
                <li className="relative">
                  <span className="absolute -left-4 top-2 h-1 w-1 rounded-full bg-white/45" />
                  {insightBullets[1]}
                </li>
              </ul>
            </div>
          </div>

          <div className="flex min-w-0 flex-col justify-between gap-8 overflow-hidden rounded-2xl border border-white/40 bg-white/96 px-6 py-7 shadow-[0_20px_60px_rgba(2,6,23,0.18)] backdrop-blur-sm lg:gap-10 lg:px-8 lg:py-9">
            <div className="min-w-0 w-full overflow-hidden lg:text-right">
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-neutral-400 lg:ml-auto">
                Implied upside
              </p>
              <div className="mt-1 flex flex-col gap-2 lg:items-end">
                {showCompactUpside ? (
                  <>
                    <span className={cn("block w-full truncate text-right", impliedUpsideValueClassName)}>
                      {formatCompactImpliedUpside(opportunityValue)}
                    </span>
                    <p className="text-xs font-medium uppercase tracking-wide text-stone-500 lg:text-right">
                      Modeled upside (est.)
                    </p>
                  </>
                ) : (
                  <AnimatedMoneyValue
                    amount={opportunityValue}
                    durationMs={920}
                    className={cn("block w-full max-w-full truncate text-right", impliedUpsideValueClassName)}
                  />
                )}
              </div>
            </div>

            <div className="mt-5 space-y-4 lg:ml-auto lg:w-full lg:max-w-sm">
              <div className="flex flex-wrap items-center gap-3 lg:justify-end">
                <span className="inline-flex items-center rounded-md border border-stone-200/90 bg-stone-50/90 px-2.5 py-1 text-xs font-bold tabular-nums text-neutral-900">
                  {Math.round(opportunityScore)}
                </span>
                <span className="text-xs font-medium text-neutral-500">{priorityLabel}</span>
              </div>
              <AnimatedMeterBar
                targetPercent={scorePct}
                tone="emerald"
                durationMs={1000}
                heightClassName="h-2"
                trackClassName="bg-stone-200"
              />
              <Link
                href={withDemoQuery(`/properties/${p.id}`, isDemo)}
                className={cn(
                  "mt-4 inline-flex w-full items-center justify-center rounded-lg bg-emerald-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-emerald-500",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 focus-visible:ring-offset-2",
                )}
              >
                Open deal
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
