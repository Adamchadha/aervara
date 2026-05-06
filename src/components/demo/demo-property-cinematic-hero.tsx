"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { HeroBlueprintBackground } from "@/components/landing/hero-blueprint-background";
import { cn } from "@/lib/utils";

const ctaBase =
  "inline-flex h-12 min-w-[10.5rem] items-center justify-center rounded-lg border px-6 text-sm font-medium tracking-tight transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2 focus-visible:ring-offset-[#090b0e]";

type DemoPropertyCinematicHeroProps = {
  address: string;
  subtitle: string;
  potentialValueLine: string;
  unusedBuildableLine: string;
  farLine: string;
  opportunityScore: number;
  backHref: string;
  backLabel: string;
  siteRoomHash: string;
  accessHref: string;
};

export function DemoPropertyCinematicHero({
  address,
  subtitle,
  potentialValueLine,
  unusedBuildableLine,
  farLine,
  opportunityScore,
  backHref,
  backLabel,
  siteRoomHash,
  accessHref,
}: DemoPropertyCinematicHeroProps) {
  const [reveal, setReveal] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setReveal(true);
      return;
    }
    const t = requestAnimationFrame(() => setReveal(true));
    return () => cancelAnimationFrame(t);
  }, []);

  return (
    <div className="relative left-1/2 w-[100vw] max-w-[100vw] -translate-x-1/2">
      <div className="relative overflow-hidden bg-[#090b0e] pb-12 pt-8 sm:pb-16 sm:pt-12">
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.04] via-transparent to-black/50"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_75%_50%_at_50%_0%,rgba(255,255,255,0.05),transparent_60%)]"
          aria-hidden
        />
        <div className="pointer-events-none absolute inset-0 opacity-[0.5] [&_.aervara-hero-bp-svg]:!text-white/[0.08]">
          <HeroBlueprintBackground />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-5xl px-5 sm:px-8">
          <Link
            href={backHref}
            className="inline-flex text-[13px] font-medium text-white/45 transition-colors hover:text-white/80"
          >
            {backLabel}
          </Link>

          <div
            className={cn(
              "mt-8 space-y-6 sm:mt-10 sm:space-y-7",
              "transition-[opacity,transform] duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)]",
              reveal ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
            )}
          >
            <div>
              <h1 className="max-w-[22ch] text-balance text-[1.85rem] font-semibold leading-[1.1] tracking-[-0.04em] text-white sm:text-[2.35rem] lg:text-[2.75rem]">
                {address}
              </h1>
              <p className="mt-3 text-[0.95rem] font-medium tracking-[-0.01em] text-white/55 sm:text-base">
                {subtitle}
              </p>
            </div>

            <p className="max-w-3xl font-mono text-lg font-medium leading-snug tracking-[-0.02em] text-white/90 sm:text-xl md:text-2xl">
              {potentialValueLine}
            </p>

            <div className="grid gap-4 border border-white/[0.08] bg-white/[0.03] px-5 py-5 sm:grid-cols-3 sm:gap-6 sm:px-6 sm:py-6">
              <HeroMetric label="Unused buildable" value={unusedBuildableLine} />
              <HeroMetric label="Built FAR / Max FAR" value={farLine} />
              <HeroMetric
                label="Opportunity score"
                value={String(opportunityScore)}
              />
            </div>

            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
              <Link
                href={siteRoomHash}
                className={cn(
                  ctaBase,
                  "border-white/18 bg-white/[0.06] text-white shadow-none",
                  "hover:border-white/28 hover:bg-white/[0.1]",
                  "hover:shadow-[0_0_32px_rgba(255,255,255,0.07),0_0_0_1px_rgba(255,255,255,0.1)]",
                )}
              >
                Open Site Room
              </Link>
              <Link
                href={accessHref}
                className={cn(
                  ctaBase,
                  "border-white/12 bg-transparent text-white/90",
                  "hover:border-white/22 hover:bg-white/[0.04] hover:text-white",
                  "hover:shadow-[0_0_28px_rgba(255,255,255,0.05)]",
                )}
              >
                Request Full Access
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function HeroMetric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">
        {label}
      </p>
      <p className="mt-2 font-mono text-sm font-medium tabular-nums text-white/88 sm:text-[0.95rem]">
        {value}
      </p>
    </div>
  );
}

/** Soft lift from dark hero into the light workspace below. */
export function DemoPropertyHeroFadeBridge({ children }: { children: ReactNode }) {
  const [reveal, setReveal] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setReveal(true);
      return;
    }
    const id = window.setTimeout(() => setReveal(true), 90);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <div className="relative -mt-5 sm:-mt-6">
      <div
        className="pointer-events-none absolute -top-10 left-0 right-0 h-16 bg-gradient-to-b from-[#090b0e] to-transparent sm:-top-12 sm:h-20"
        aria-hidden
      />
      <div
        className={cn(
          "relative rounded-t-[1.35rem] border border-stone-200/40 border-b-0 bg-[#fbfaf6]/95 shadow-[0_-12px_48px_rgba(0,0,0,0.12)] backdrop-blur-[2px]",
          "transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
          reveal ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
        )}
      >
        {children}
      </div>
    </div>
  );
}
