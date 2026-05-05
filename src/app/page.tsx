import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { LandingDashboardPreview } from "@/components/landing/dashboard-preview";
import { LandingHero } from "@/components/landing/landing-hero";
import { LandingSectionBackdrop } from "@/components/landing/landing-section-backdrop";
import { LandingSectionHeader } from "@/components/landing/landing-section-header";
import { LandingUnderbuiltExplainer } from "@/components/landing/landing-underbuilt-explainer";
import { LandingOpportunityToConnection } from "@/components/landing/landing-opportunity-to-connection";
import { LandingVisionCollaboration } from "@/components/landing/landing-vision-collaboration";
import { RevealSection } from "@/components/landing/reveal-section";
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
    <div className="flex min-h-full flex-col bg-[#f5f4f2]">
      <SiteHeader />

      <main className="flex flex-1 flex-col">
        <LandingHero
          analyzeHref={analyzeHref}
          secondaryHref={user ? "/properties/new" : "/login"}
          secondaryLabel={
            user ? "Add a property" : "Sign in to your workspace"
          }
        />

        {/* What Aervara does */}
        <section className="relative overflow-hidden border-t border-neutral-200/50 bg-white px-4 py-24 sm:px-6 sm:py-28 lg:py-32">
          <LandingSectionBackdrop intensity="whisper" />
          <RevealSection className="relative mx-auto max-w-6xl">
            <LandingSectionHeader
              eyebrow="What Aervara does"
              title="Early-stage intelligence on underbuilt land"
            />
            <ul className="mx-auto mt-16 grid max-w-5xl gap-12 sm:mt-20 md:grid-cols-3 md:gap-10 lg:gap-14">
              {[
                {
                  title: "Surfaces slack in the envelope",
                  body: "Aervara highlights parcels where built floor area still sits below the as-of-right cap—unused buildable potential you can screen across a pipeline, not just one zoning PDF at a time.",
                },
                {
                  title: "Makes opportunity legible",
                  body: "FAR, underbuilt score, unused buildable area, and implied value sit next to structured investment reads—so you see redevelopment upside as a story, not only a calculator output.",
                },
                {
                  title: "Prioritizes like a deal desk",
                  body: "Rank sites, compare reads, and move faster on triage. Aervara is built for discovery and prioritization before you burn time on full underwriting.",
                },
              ].map((item) => (
                <li
                  key={item.title}
                  className={cn(
                    "aervara-landing-feature text-center md:text-left",
                    "rounded-2xl border border-neutral-100/90 bg-gradient-to-b from-white to-neutral-50/30 px-1 py-6 md:border-0 md:bg-none md:px-0 md:py-0",
                  )}
                >
                  <h3 className="text-base font-semibold leading-snug tracking-tight text-neutral-950">
                    {item.title}
                  </h3>
                  <p className="mt-4 text-sm leading-relaxed text-neutral-600 sm:text-[0.9375rem]">
                    {item.body}
                  </p>
                </li>
              ))}
            </ul>
          </RevealSection>
        </section>

        <LandingUnderbuiltExplainer />

        <LandingOpportunityToConnection />

        <LandingVisionCollaboration />

        {/* Why this matters */}
        <section className="relative overflow-hidden border-t border-neutral-200/50 bg-neutral-50/90 px-4 py-24 sm:px-6 sm:py-28 lg:py-32">
          <LandingSectionBackdrop intensity="whisper" />
          <RevealSection className="relative mx-auto max-w-6xl">
            <LandingSectionHeader
              eyebrow="Why this matters"
              title="Upside often hides in the zoning math"
            />
            <div className="mx-auto mt-14 max-w-3xl space-y-7 text-center sm:mt-16 sm:text-left">
              {[
                "Across cities, a large share of lots are still underbuilt relative to their zoning envelope—there is often headroom before you need a rezoning story.",
                "That upside lives in FAR, coverage, and transferable-style density logic: capacity that reads like air-rights slack, even when the headline is just “old retail on a deep lot.”",
                "Most teams still stitch spreadsheets, zoning tables, and gut feel—slow for screening and easy to miss when the market hasn’t caught up.",
                "Aervara compresses the first pass so overlooked infill, repositioning, and assembly angles surface faster—then you decide where partner time and capital actually go.",
              ].map((sentence, i) => (
                <p
                  key={i}
                  className="text-[0.9375rem] leading-relaxed text-neutral-600 sm:text-base"
                >
                  {sentence}
                </p>
              ))}
            </div>
          </RevealSection>
        </section>

        {/* Product preview */}
        <section className="relative overflow-hidden border-t border-neutral-200/50 bg-white px-4 py-24 sm:px-6 sm:py-28 lg:py-32">
          <LandingSectionBackdrop intensity="subtle" />
          <RevealSection className="relative mx-auto max-w-6xl">
            <LandingSectionHeader
              eyebrow="Product preview"
              title="Your deal pipeline, at a glance"
              description="Cards rank opportunity value and surface an Aervara Read—so you screen sites like an investor, not a spreadsheet."
            />
            <div className="mt-16 lg:mt-20">
              <LandingDashboardPreview />
            </div>
          </RevealSection>
        </section>

        {/* Who it is for */}
        <section className="relative overflow-hidden border-t border-neutral-200/50 bg-neutral-50/90 px-4 py-24 sm:px-6 sm:py-28 lg:py-32">
          <LandingSectionBackdrop intensity="whisper" />
          <RevealSection className="relative mx-auto max-w-6xl">
            <LandingSectionHeader
              eyebrow="Who it’s for"
              title="Built for people who live in the deal stack"
            />
            <ul className="mx-auto mt-16 grid max-w-5xl gap-6 sm:mt-20 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
              {[
                {
                  title: "Developers",
                  body: "Compare FAR slack and unused envelope across candidate sites before you commit schematic and entitlement spend.",
                },
                {
                  title: "Investors",
                  body: "Screen many parcels at once, align on underbuilt score and implied upside, and tighten IC narratives with a consistent read.",
                },
                {
                  title: "Brokers",
                  body: "Ground listings in quantified headroom and a credible redevelopment story—without rebuilding the same spreadsheet for every tour book.",
                },
                {
                  title: "Acquisition teams",
                  body: "Keep a single pipeline view, triage faster, and reduce the chance an off-market angle dies in a shared drive.",
                },
              ].map((item) => (
                <li
                  key={item.title}
                  className={cn(
                    "aervara-landing-card flex flex-col p-7",
                  )}
                >
                  <h3 className="text-sm font-semibold tracking-tight text-neutral-950">
                    {item.title}
                  </h3>
                  <p className="mt-3.5 flex-1 text-sm leading-relaxed text-neutral-600">
                    {item.body}
                  </p>
                </li>
              ))}
            </ul>
          </RevealSection>
        </section>

        {/* How it works */}
        <section className="relative overflow-hidden border-t border-neutral-200/50 bg-white px-4 py-24 sm:px-6 sm:py-28 lg:py-32">
          <LandingSectionBackdrop intensity="whisper" />
          <RevealSection className="relative mx-auto max-w-6xl">
            <LandingSectionHeader
              className="max-w-2xl"
              eyebrow="How it works"
              title="From parcel to thesis in three moves"
            />
            <ol className="mx-auto mt-16 grid max-w-4xl gap-12 sm:mt-20 sm:grid-cols-3 sm:gap-10 lg:gap-14">
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
                <li
                  key={item.step}
                  className="aervara-landing-feature relative text-center sm:text-left"
                >
                  <span className="font-mono text-[11px] font-semibold tabular-nums tracking-wide text-neutral-400">
                    {item.step}
                  </span>
                  <h3 className="mt-4 text-base font-semibold tracking-tight text-neutral-950">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-neutral-600">
                    {item.body}
                  </p>
                </li>
              ))}
            </ol>
          </RevealSection>
        </section>

        {/* Why different */}
        <section className="relative overflow-hidden border-t border-neutral-200/50 bg-neutral-50/90 px-4 py-24 sm:px-6 sm:py-28 lg:py-32">
          <LandingSectionBackdrop intensity="whisper" />
          <RevealSection className="relative mx-auto max-w-6xl">
            <LandingSectionHeader
              className="max-w-2xl"
              eyebrow="Why it’s different"
              title="Built for underwriting, not zoning lookups"
            />
            <ul className="mx-auto mt-16 grid max-w-5xl gap-6 sm:mt-20 md:grid-cols-3">
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
                    "aervara-landing-card border-neutral-200/45 bg-gradient-to-b from-white to-neutral-50/40 p-7",
                  )}
                >
                  <h3 className="text-sm font-semibold tracking-tight text-neutral-950">
                    {item.title}
                  </h3>
                  <p className="mt-3.5 text-sm leading-relaxed text-neutral-600">
                    {item.body}
                  </p>
                </li>
              ))}
            </ul>
          </RevealSection>
        </section>

        {/* About / mission */}
        <section className="relative overflow-hidden border-t border-stone-200/50 bg-[#f0eeec] px-4 py-24 sm:px-6 sm:py-28 lg:py-32">
          <LandingSectionBackdrop intensity="subtle" />
          <RevealSection className="relative mx-auto max-w-3xl">
            <header className="text-center">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-500">
                About Aervara
              </p>
              <h2 className="mt-4 text-[1.75rem] font-semibold leading-[1.12] tracking-[-0.028em] text-neutral-950 sm:text-3xl sm:tracking-[-0.03em]">
                Why we built Aervara
              </h2>
            </header>

            <figure className="mt-16 sm:mt-20">
              <blockquote className="mx-auto max-w-2xl border-l-2 border-neutral-950/[0.14] pl-7 text-left sm:pl-9">
                <p className="text-lg font-semibold leading-snug tracking-[-0.02em] text-neutral-950 sm:text-xl">
                  The strongest urban opportunities are often obvious in
                  retrospect. In the moment, they hide in FAR, old improvements,
                  and inertia.
                </p>
              </blockquote>
            </figure>

            <div className="mx-auto mt-14 max-w-2xl space-y-6 text-center text-[0.9375rem] leading-relaxed text-neutral-600 sm:mt-16 sm:text-left sm:text-base">
              <p>
                Aervara was built to uncover that overlooked layer—redevelopment
                upside that already sits in the zoning envelope but rarely
                announces itself from the curb.
              </p>
              <p>
                We make underbuilt analysis and FAR slack faster to grasp and
                easier to share, so developers, investors, and brokers spend less
                time reconciling spreadsheets and more time converging on the
                sites that actually deserve attention.
              </p>
            </div>

            <ul className="mx-auto mt-14 max-w-2xl space-y-5 border-t border-stone-300/45 pt-12 sm:mt-16">
              {[
                "Surface overlooked redevelopment potential before it is fully priced.",
                "Turn zoning capacity and built reality into a clear, comparable read.",
                "Help the right people recognize the right urban opportunities earlier.",
              ].map((line, i) => (
                <li key={i} className="flex gap-4 text-left">
                  <span className="mt-0.5 font-mono text-[11px] font-semibold tabular-nums text-neutral-400">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="text-sm font-medium leading-relaxed text-neutral-800 sm:text-[0.9375rem]">
                    {line}
                  </p>
                </li>
              ))}
            </ul>
          </RevealSection>
        </section>

        {/* Final CTA */}
        <section className="relative overflow-hidden border-t border-neutral-800/30 bg-neutral-950 px-4 py-20 sm:px-6 sm:py-24">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_85%_70%_at_50%_-20%,rgba(255,255,255,0.07),transparent_52%)]"
            aria-hidden
          />
          <RevealSection className="relative mx-auto flex max-w-6xl flex-col items-center justify-between gap-10 text-center sm:flex-row sm:gap-12 sm:text-left">
            <div className="max-w-xl">
              <h2 className="text-2xl font-semibold tracking-[-0.02em] text-white sm:text-3xl">
                Start screening smarter
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-neutral-400 sm:text-base">
                Bring your next underbuilt parcel into Aervara—FAR headroom,
                implied upside, and an investment read in one pass.
              </p>
            </div>
            <Button
              asChild
              variant="secondary"
              className="h-12 shrink-0 rounded-full border-0 bg-white px-9 text-sm font-semibold tracking-tight text-neutral-950 shadow-[0_8px_32px_-12px_rgba(0,0,0,0.45)] transition-[transform,box-shadow,background-color] duration-300 ease-out hover:-translate-y-0.5 hover:bg-neutral-100 motion-reduce:transform-none"
            >
              <Link href={analyzeHref}>Start analyzing deals</Link>
            </Button>
          </RevealSection>
        </section>
      </main>

      <footer className="border-t border-neutral-200/50 bg-[#f5f4f2] py-12 text-center sm:py-14">
        <p className="text-[11px] font-medium tracking-wide text-neutral-500">
          © {new Date().getFullYear()} Aervara. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
