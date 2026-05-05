import { LandingSectionBackdrop } from "@/components/landing/landing-section-backdrop";
import { LandingSectionHeader } from "@/components/landing/landing-section-header";
import { RevealSection } from "@/components/landing/reveal-section";
import { cn } from "@/lib/utils";

const STEPS: { step: string; title: string; body: string }[] = [
  {
    step: "01",
    title: "Identify underbuilt opportunity",
    body: "Surface FAR slack, unused buildable envelope, and implied upside across parcels—so promising sites stand out before you deep-dive every zoning packet.",
  },
  {
    step: "02",
    title: "Evaluate redevelopment potential",
    body: "Pair quantitative headroom with structured reads—recommended play, complexity, and speed-to-value—so the story behind each lot is legible to your team.",
  },
  {
    step: "03",
    title: "Signal interest across roles",
    body: "Developers, investors, brokers, and acquisition teams can record how they’re thinking about a site—intent and context that travel with the opportunity, not buried in inboxes.",
  },
  {
    step: "04",
    title: "Move toward real conversations",
    body: "Request introductions, meetings, and a shared project shelf around a parcel—first steps toward collaboration, with humans still at the center of every deal.",
  },
];

/**
 * Positions Aervara as intelligence plus coordination—not only analysis,
 * without overstating marketplace maturity.
 */
export function LandingOpportunityToConnection() {
  return (
    <section
      className="relative overflow-hidden border-t border-neutral-200/50 bg-white px-4 py-24 sm:px-6 sm:py-28 lg:py-32"
      aria-label="From opportunity signal to real-world connection: how Aervara connects parcel intelligence to collaboration"
    >
      <LandingSectionBackdrop intensity="whisper" />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-neutral-200/80 to-transparent"
        aria-hidden
      />
      <RevealSection className="relative mx-auto max-w-6xl">
        <LandingSectionHeader
          eyebrow="From screening to action"
          title="From opportunity signal to real-world connection"
          description="Aervara is built to carry a parcel from first signal toward the people and conversations that turn sites into deals—without pretending the full marketplace already exists."
        />
        <ol className="mx-auto mt-16 grid max-w-5xl list-none gap-6 sm:mt-20 sm:grid-cols-2 lg:mt-24 lg:grid-cols-4 lg:gap-5">
          {STEPS.map((item) => (
            <li key={item.step}>
              <div
                className={cn(
                  "aervara-landing-card flex h-full flex-col border-neutral-200/50 bg-gradient-to-b from-white to-neutral-50/35 p-7",
                )}
              >
                <span className="font-mono text-[11px] font-semibold tabular-nums tracking-wide text-neutral-400">
                  {item.step}
                </span>
                <h4 className="mt-4 text-sm font-semibold leading-snug tracking-tight text-neutral-950">
                  {item.title}
                </h4>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-neutral-600">
                  {item.body}
                </p>
              </div>
            </li>
          ))}
        </ol>

        <p className="mx-auto mt-14 max-w-2xl text-center text-sm leading-relaxed text-neutral-500 sm:mt-16">
          Today’s product is intentionally early: strong parcel intelligence and
          structured signals inside your workspace—not an open trading floor.
          We&apos;re investing in the rails that help the right people and the
          right opportunities find each other with less friction over time.
        </p>
      </RevealSection>
    </section>
  );
}
