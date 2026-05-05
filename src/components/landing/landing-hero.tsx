import Link from "next/link";
import { HeroBlueprintBackground } from "@/components/landing/hero-blueprint-background";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type LandingHeroProps = {
  analyzeHref: string;
  secondaryHref: string;
  secondaryLabel: string;
};

export function LandingHero({
  analyzeHref,
  secondaryHref,
  secondaryLabel,
}: LandingHeroProps) {
  return (
    <section className="relative overflow-hidden px-4 pb-24 pt-20 sm:px-6 sm:pb-32 sm:pt-24 lg:pb-40 lg:pt-28">
      <HeroBlueprintBackground />
      <div
        className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-[#f7f6f4]/95 via-[#f7f6f4]/55 to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_75%_55%_at_50%_-8%,rgba(28,25,23,0.07),transparent_58%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-40 bg-gradient-to-t from-[#f5f4f2] to-transparent"
        aria-hidden
      />

      <div
        className={cn(
          "aervara-hero-stack relative z-10 mx-auto flex max-w-6xl flex-col items-center px-1 sm:px-2",
        )}
      >
        <div className="flex flex-col items-center text-center">
          <span className="inline-flex items-center rounded-full border border-neutral-200/70 bg-white/55 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.26em] text-neutral-600 shadow-[0_1px_0_rgba(255,255,255,0.8)_inset] backdrop-blur-sm">
            Aervara
          </span>
          <span
            className="mt-7 block h-px w-12 bg-gradient-to-r from-transparent via-neutral-400/45 to-transparent"
            aria-hidden
          />
          <h1 className="mt-8 max-w-4xl text-[2.125rem] font-semibold leading-[1.08] tracking-[-0.038em] text-neutral-950 sm:text-5xl sm:leading-[1.05] sm:tracking-[-0.04em] lg:text-[3.5rem] lg:leading-[1.02]">
            Find underbuilt land before the market prices it in
          </h1>
        </div>

        <div className="mx-auto mt-10 max-w-xl space-y-5 text-center text-[0.9375rem] leading-relaxed text-neutral-600 sm:mt-12 sm:max-w-2xl sm:text-lg sm:leading-relaxed">
          <p>
            Many urban parcels still carry{" "}
            <span className="font-medium text-neutral-800">
              unused development capacity
            </span>{" "}
            under the zoning envelope—FAR slack and air-rights–style headroom
            that rarely jumps out of a simple comp or acreage screen.
          </p>
          <p>
            Aervara helps{" "}
            <span className="font-medium text-neutral-800">
              developers, investors, and brokers
            </span>{" "}
            quantify that slack, compare redevelopment upside across sites, and
            prioritize deals before the trade fully prices every square foot of
            remaining envelope.
          </p>
        </div>

        <div className="mt-12 flex w-full max-w-lg flex-col items-stretch gap-4 sm:mt-14 sm:max-w-none sm:flex-row sm:items-center sm:justify-center sm:gap-5">
          <div className="rounded-2xl border border-neutral-200/55 bg-white/60 p-1.5 shadow-[0_12px_48px_-20px_rgba(15,23,42,0.18),0_1px_0_rgba(255,255,255,0.85)_inset] backdrop-blur-md ring-1 ring-neutral-950/[0.04] sm:inline-flex sm:items-center sm:gap-2 sm:rounded-full sm:px-2 sm:py-1.5">
            <Button
              asChild
              className="h-12 w-full rounded-xl px-8 text-sm font-semibold tracking-tight shadow-[0_1px_0_rgba(255,255,255,0.08)_inset,0_10px_36px_-12px_rgba(0,0,0,0.35)] sm:w-auto sm:rounded-full sm:px-9"
            >
              <Link href={analyzeHref}>Start analyzing deals</Link>
            </Button>
            <Link
              href={secondaryHref}
              className="flex h-11 items-center justify-center rounded-xl text-sm font-medium text-neutral-600 transition-colors duration-300 ease-out hover:text-neutral-950 sm:h-10 sm:px-4 sm:rounded-full sm:hover:bg-neutral-100/80"
            >
              {secondaryLabel}
            </Link>
          </div>
          <Link
            href="/demo"
            className="mt-6 text-sm font-medium text-neutral-500 underline-offset-[5px] transition-colors hover:text-neutral-950 hover:underline"
          >
            Explore sample deals — no sign-in
          </Link>
        </div>
      </div>
    </section>
  );
}
