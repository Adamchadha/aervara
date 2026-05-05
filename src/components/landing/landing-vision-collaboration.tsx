import { LandingSectionBackdrop } from "@/components/landing/landing-section-backdrop";
import { RevealSection } from "@/components/landing/reveal-section";
import { cn } from "@/lib/utils";

const PILLARS: { title: string; body: string }[] = [
  {
    title: "Developers",
    body: "Screen redevelopment sites with the same FAR and envelope logic your desk already trusts—so promising lots rise faster from the noise.",
  },
  {
    title: "Investors",
    body: "Find opportunities that read consistently across your pipeline, before partner time stacks up on every marginal lead.",
  },
  {
    title: "Brokers",
    body: "Ground conversations in better-positioned deals: quantified slack and a clear story, not only comps and adjectives.",
  },
  {
    title: "Acquisition teams",
    body: "Align around targets from a shared view of upside and risk—fewer versions of the truth in email threads and decks.",
  },
];

/**
 * Marketing vision block: parcel intelligence as the foundation for collaboration.
 */
export function LandingVisionCollaboration() {
  return (
    <section
      className={cn(
        "relative overflow-hidden border-t border-neutral-200/50",
        "bg-[linear-gradient(165deg,rgb(252_252_251)_0%,rgb(246_245_243)_38%,rgb(255_255_255)_100%)]",
      )}
      aria-labelledby="landing-vision-heading"
    >
      <LandingSectionBackdrop intensity="whisper" />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-[min(42%,520px)] bg-[radial-gradient(ellipse_at_70%_30%,rgba(15,23,42,0.04),transparent_65%)]"
        aria-hidden
      />
      <RevealSection className="relative mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-28 lg:py-32">
        <div className="mx-auto max-w-3xl border-l-2 border-neutral-950/[0.14] pl-7 sm:pl-9">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-500">
            More than parcel analysis
          </p>
          <h2
            id="landing-vision-heading"
            className="mt-4 text-[1.7rem] font-semibold leading-[1.12] tracking-[-0.028em] text-neutral-950 sm:text-[2rem] sm:tracking-[-0.03em]"
          >
            Built for deal collaboration
          </h2>
          <p className="mt-2 text-base font-medium leading-snug text-neutral-600 sm:text-lg">
            Where opportunity meets the right counterparties.
          </p>
          <p className="mt-5 text-sm leading-relaxed text-neutral-600 sm:text-base">
            Aervara starts with rigorous parcel intelligence—FAR slack, unused
            envelope, and reads you can defend in diligence. We&apos;re shaping
            it into a place where{" "}
            <span className="font-medium text-neutral-800">
              the right people find the right sites
            </span>{" "}
            sooner: clearer signals, less friction between roles, and a steadier
            path from screening to a real conversation.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-neutral-600 sm:text-base">
            That is the direction—not a finished marketplace. Today you get
            structured analysis and pipeline views; over time, expect more ways
            for developers, investors, brokers, and acquisition teams to{" "}
            <span className="font-medium text-neutral-800">
              converge on the same opportunity
            </span>{" "}
            without rebuilding the spreadsheet every time.
          </p>
        </div>

        <ul className="mx-auto mt-16 grid max-w-5xl gap-6 sm:mt-20 sm:grid-cols-2 lg:gap-6">
          {PILLARS.map((item) => (
            <li
              key={item.title}
              className={cn(
                "aervara-landing-card border-neutral-200/50 p-7",
              )}
            >
              <h3 className="text-sm font-semibold text-neutral-950">
                {item.title}
              </h3>
              <p className="mt-2.5 text-sm leading-relaxed text-neutral-600">
                {item.body}
              </p>
            </li>
          ))}
        </ul>

        <p className="mx-auto mt-14 max-w-2xl text-center text-[11px] leading-relaxed text-neutral-500 sm:mt-16">
          We are not claiming a full open marketplace yet—only a product stance
          that respects how deals actually get done, and where we intend to go.
        </p>
      </RevealSection>
    </section>
  );
}
