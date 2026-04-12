import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { LandingDashboardPreview } from "@/components/landing/dashboard-preview";
import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const analyzeHref = user ? "/dashboard" : "/login";

  return (
    <div className="flex min-h-full flex-col bg-[#fafafa]">
      <SiteHeader />

      <main className="flex flex-1 flex-col">
        {/* Hero */}
        <section className="relative overflow-hidden px-4 pb-20 pt-16 sm:px-6 sm:pb-24 sm:pt-20 lg:pb-28 lg:pt-24">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(15,23,42,0.06),transparent)]"
            aria-hidden
          />
          <div className="relative mx-auto max-w-6xl">
            <p className="text-center text-[11px] font-semibold uppercase tracking-[0.28em] text-neutral-500">
              Aervara
            </p>
            <h1 className="mx-auto mt-6 max-w-4xl text-center text-[2rem] font-semibold leading-[1.12] tracking-tight text-neutral-950 sm:text-5xl sm:leading-[1.08] lg:text-[3.25rem]">
              Find underbuilt land before the market prices it in
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-center text-base leading-relaxed text-neutral-600 sm:text-lg">
              Model FAR headroom, unused buildable area, and implied upside in
              one workspace—then layer a structured investment read on every
              parcel you track.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-5">
              <Button
                asChild
                className="h-12 min-w-[200px] rounded-lg px-8 text-sm font-semibold shadow-md shadow-neutral-950/10"
              >
                <Link href={analyzeHref}>Start analyzing deals</Link>
              </Button>
              <Link
                href={user ? "/properties/new" : "/login"}
                className="text-sm font-medium text-neutral-600 underline-offset-4 transition-colors hover:text-neutral-950 hover:underline"
              >
                {user ? "Add a property" : "Sign in to your workspace"}
              </Link>
            </div>
          </div>
        </section>

        {/* Product preview */}
        <section className="border-t border-neutral-200/60 bg-white px-4 py-20 sm:px-6 sm:py-24 lg:py-28">
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
                Product preview
              </h2>
              <p className="mt-3 text-2xl font-semibold tracking-tight text-neutral-950 sm:text-3xl">
                Your deal pipeline, at a glance
              </p>
              <p className="mt-4 text-sm leading-relaxed text-neutral-600 sm:text-base">
                Cards rank opportunity value and surface an Aervara Read—so you
                screen sites like an investor, not a spreadsheet.
              </p>
            </div>
            <div className="mt-14 lg:mt-16">
              <LandingDashboardPreview />
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="border-t border-neutral-200/60 bg-neutral-50/80 px-4 py-20 sm:px-6 sm:py-24 lg:py-28">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
              How it works
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-center text-2xl font-semibold tracking-tight text-neutral-950 sm:text-3xl">
              From parcel to thesis in three moves
            </p>
            <ol className="mx-auto mt-14 grid max-w-4xl gap-10 sm:mt-16 sm:grid-cols-3 sm:gap-8 lg:gap-12">
              {[
                {
                  step: "01",
                  title: "Input property",
                  body: "Address, zoning, lot size, built area, max FAR, and optional value per buildable square foot.",
                },
                {
                  step: "02",
                  title: "Analyze FAR + upside",
                  body: "Built vs remaining FAR, unused buildable envelope, and implied opportunity value—computed automatically.",
                },
                {
                  step: "03",
                  title: "Get investment read",
                  body: "Recommended play, complexity and speed-to-value scores, summary narrative, and key flags for each site.",
                },
              ].map((item) => (
                <li key={item.step} className="relative text-center sm:text-left">
                  <span className="font-mono text-xs font-semibold tabular-nums text-neutral-400">
                    {item.step}
                  </span>
                  <h3 className="mt-3 text-base font-semibold text-neutral-950">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                    {item.body}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Why different */}
        <section className="border-t border-neutral-200/60 bg-white px-4 py-20 sm:px-6 sm:py-24 lg:py-28">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
              Why it&apos;s different
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-center text-2xl font-semibold tracking-tight text-neutral-950 sm:text-3xl">
              Built for underwriting, not zoning lookups
            </p>
            <ul className="mx-auto mt-14 grid max-w-5xl gap-6 sm:mt-16 md:grid-cols-3">
              {[
                {
                  title: "Opportunity engine",
                  body: "Heuristic reads translate FAR slack, unused area, and value signals into a recommended play and narrative you can challenge in diligence.",
                },
                {
                  title: "Speed-to-value scoring",
                  body: "A structured timeline signal alongside complexity—so you know where to spend partner time versus where to move fast.",
                },
                {
                  title: "Proprietary insights",
                  body: "Aervara Read on the dashboard and Investment Read on the detail page give you a consistent, product-native lens on every parcel.",
                },
              ].map((item) => (
                <li
                  key={item.title}
                  className={cn(
                    "rounded-2xl border border-neutral-200/50 bg-gradient-to-b from-neutral-50/60 to-white p-6",
                    "shadow-[0_2px_8px_rgba(15,23,42,0.03)] ring-1 ring-neutral-950/[0.03]",
                  )}
                >
                  <h3 className="text-sm font-semibold text-neutral-950">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-neutral-600">
                    {item.body}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Final CTA */}
        <section className="border-t border-neutral-200/60 bg-neutral-950 px-4 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-8 text-center sm:flex-row sm:text-left">
            <div className="max-w-xl">
              <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                Start screening smarter
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-neutral-400 sm:text-base">
                Bring your next infill or repositioning candidate into Aervara
                and see FAR, upside, and an investment read in minutes.
              </p>
            </div>
            <Button
              asChild
              variant="secondary"
              className="h-12 shrink-0 rounded-lg border-0 bg-white px-8 text-sm font-semibold text-neutral-950 hover:bg-neutral-100"
            >
              <Link href={analyzeHref}>Start analyzing deals</Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-neutral-200/60 bg-[#fafafa] py-10 text-center">
        <p className="text-xs text-neutral-400">
          © {new Date().getFullYear()} Aervara. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
