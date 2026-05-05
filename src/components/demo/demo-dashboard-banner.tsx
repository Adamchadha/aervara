import Link from "next/link";
import { Button } from "@/components/ui/button";
import { demoAwarePath, requestFullAccessHref } from "@/lib/demo-flow";

/**
 * Explains the product for first-time visitors in public demo (`?demo=true`).
 */
export function DemoDashboardBanner({
  isDemo,
  unlockedValueLabel,
  marketLabel,
}: {
  isDemo: boolean;
  unlockedValueLabel: string;
  marketLabel: string;
}) {
  if (!isDemo) return null;

  return (
    <div className="rounded-[1.35rem] border border-sky-200/65 bg-gradient-to-br from-sky-50/95 via-white to-white px-6 py-7 shadow-[0_2px_12px_rgba(14,116,144,0.06),0_20px_54px_-30px_rgba(14,116,144,0.2)] ring-1 ring-sky-900/[0.04] sm:px-8 sm:py-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between sm:gap-10">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-sky-700/80">
            Demo
          </p>
          <h1 className="mt-3 max-w-3xl text-[1.55rem] font-semibold tracking-[-0.03em] text-neutral-950 sm:text-[1.9rem] sm:leading-[1.14]">
            Find buildings sitting on millions in unused air rights.
          </h1>
          <p className="mt-3 max-w-2xl text-[0.95rem] leading-relaxed text-neutral-600 sm:text-base">
            Aervara surfaces hidden development value across cities before the
            market prices it in.
          </p>
          <p className="mt-4 inline-flex rounded-full border border-emerald-200/70 bg-emerald-50/75 px-3.5 py-1.5 text-[11px] font-semibold tracking-wide text-emerald-900">
            {unlockedValueLabel} in unlocked development value across {marketLabel}
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-2.5 sm:items-end">
          <Button asChild className="h-11 rounded-xl px-6 text-sm font-semibold">
            <Link
              href={requestFullAccessHref({
                nextPath: demoAwarePath("/dashboard", true),
                sourceRoute: demoAwarePath("/dashboard", true),
              })}
            >
              Request Full Access
            </Link>
          </Button>
          <Button variant="ghost" asChild className="h-auto rounded-lg px-2 py-1 text-xs text-neutral-600">
            <Link href="#live-opportunities">See how this works</Link>
          </Button>
          <p className="max-w-xs text-center text-[11px] leading-relaxed text-neutral-500 sm:text-right">
            Access is limited to qualified operators and capital partners.
          </p>
        </div>
      </div>
    </div>
  );
}
