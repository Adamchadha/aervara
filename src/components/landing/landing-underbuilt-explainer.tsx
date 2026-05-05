import { LandingSectionBackdrop } from "@/components/landing/landing-section-backdrop";
import { RevealSection } from "@/components/landing/reveal-section";

/**
 * Educational explainer for the marketing site — illustrative numbers only.
 */
export function LandingUnderbuiltExplainer() {
  return (
    <section className="relative overflow-hidden border-t border-stone-200/50 bg-[#f3f1ef] px-4 py-24 sm:px-6 sm:py-28 lg:py-32">
      <LandingSectionBackdrop intensity="subtle" />
      <RevealSection className="relative mx-auto max-w-6xl">
        <header className="mx-auto max-w-2xl text-center">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-500">
            Underbuilt upside
          </h2>
          <p className="mt-4 text-[1.7rem] font-semibold leading-[1.12] tracking-[-0.028em] text-neutral-950 sm:text-[2rem] sm:tracking-[-0.03em]">
            What is underbuilt upside?
          </p>
          <p className="mt-4 text-[0.9375rem] leading-relaxed text-neutral-600 sm:text-base">
            A plain-English read on air-rights–style slack—before you open a zoning
            table.
          </p>
        </header>

        <div className="mx-auto mt-14 max-w-3xl space-y-5 text-sm leading-relaxed text-neutral-600 sm:mt-16 sm:text-base">
          <p>
            Zoning tells you how much floor area could exist on a lot. Many
            sites are still built{" "}
            <span className="font-medium text-neutral-800">below</span> that
            ceiling—stores, offices, or older housing that do not use the full
            envelope.
          </p>
          <p>
            The gap is{" "}
            <span className="font-medium text-neutral-800">
              unused development capacity
            </span>
            . Buyers focused on price per acre or current rent can miss it. When
            the market has not fully priced that slack, it can show up as{" "}
            <span className="font-medium text-neutral-800">hidden value</span>.
          </p>
          <p>
            <span className="font-medium text-neutral-900">Aervara</span> turns
            lot size, built floor area, and max FAR into{" "}
            <span className="font-medium text-neutral-800">
              unused buildable area
            </span>
            , an{" "}
            <span className="font-medium text-neutral-800">underbuilt score</span>
            , and—if you add a value assumption—an{" "}
            <span className="font-medium text-neutral-800">
              implied opportunity
            </span>{" "}
            number, alongside short investment reads so the story is easy to
            share.
          </p>
        </div>

        <div className="mx-auto mt-14 grid max-w-4xl items-center gap-12 lg:mt-16 lg:grid-cols-[1fr_min(280px,100%)]">
          <figure className="order-2 lg:order-1">
            <div className="overflow-hidden rounded-2xl border border-stone-200/60 bg-white px-6 py-8 shadow-[0_2px_12px_rgba(15,23,42,0.04)] ring-1 ring-stone-900/[0.03] transition-[box-shadow,transform,border-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none hover:-translate-y-0.5 hover:border-stone-300/70 hover:shadow-[0_20px_48px_-24px_rgba(15,23,42,0.1)] motion-reduce:hover:translate-y-0">
              <ExplainerMassingSvg />
              <figcaption className="mt-5 flex flex-wrap justify-center gap-x-6 gap-y-2 border-t border-stone-100 pt-5 text-[11px] text-neutral-500">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-3.5 rounded-sm bg-neutral-800/90" />
                  Built today
                </span>
                <span className="flex items-center gap-2">
                  <span className="h-2 w-3.5 rounded-sm bg-[repeating-linear-gradient(-45deg,rgb(120_113_108/0.25)_0_1px,transparent_1px_3px)]" />
                  Remaining capacity
                </span>
                <span className="flex items-center gap-2">
                  <span className="h-0.5 w-5 border-t border-dashed border-neutral-500/80" />
                  Max envelope
                </span>
              </figcaption>
              <p className="mt-3 text-center text-[10px] leading-snug text-neutral-400">
                Schematic only—not a survey, setback, or design.
              </p>
            </div>
          </figure>

          <div className="order-1 space-y-5 lg:order-2">
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
              Who this helps
            </h3>
            <ul className="space-y-4 text-sm leading-relaxed text-neutral-600">
              <li>
                <span className="font-semibold text-neutral-900">Developers</span>{" "}
                — see how much envelope is left before schematic work.
              </li>
              <li>
                <span className="font-semibold text-neutral-900">Investors</span>{" "}
                — compare slack and implied upside across many parcels.
              </li>
              <li>
                <span className="font-semibold text-neutral-900">Brokers</span>{" "}
                — anchor a listing story in quantified headroom, not adjectives.
              </li>
            </ul>
          </div>
        </div>

        <div className="mx-auto mt-14 max-w-2xl lg:mt-16">
          <div className="rounded-2xl border border-stone-200/60 bg-white p-6 shadow-sm ring-1 ring-stone-900/[0.025] transition-[box-shadow,transform,border-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none sm:p-8 hover:-translate-y-0.5 hover:border-stone-300/65 hover:shadow-[0_16px_40px_-20px_rgba(15,23,42,0.08)] motion-reduce:hover:translate-y-0">
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
              Quick example
            </h3>
            <p className="mt-2 text-xs text-neutral-400">
              Round numbers for illustration—not investment advice.
            </p>
            <dl className="mt-6 space-y-4 border-t border-stone-100 pt-6 font-mono text-sm tabular-nums text-neutral-800">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <dt className="text-xs font-sans font-normal text-neutral-500">
                  Lot size
                </dt>
                <dd>20,000 sq ft</dd>
              </div>
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <dt className="text-xs font-sans font-normal text-neutral-500">
                  Max FAR
                </dt>
                <dd>3.0</dd>
              </div>
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <dt className="text-xs font-sans font-normal text-neutral-500">
                  Built floor area today
                </dt>
                <dd>30,000 sq ft (1.5 FAR)</dd>
              </div>
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <dt className="text-xs font-sans font-normal text-neutral-500">
                  Max buildable (lot × FAR)
                </dt>
                <dd>60,000 sq ft</dd>
              </div>
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <dt className="text-xs font-sans font-normal text-neutral-500">
                  Remaining buildable
                </dt>
                <dd className="font-semibold text-neutral-950">30,000 sq ft</dd>
              </div>
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-t border-stone-100 pt-4">
                <dt className="text-xs font-sans font-normal text-neutral-500">
                  Implied upside @ ~$180 / unused sq ft
                </dt>
                <dd className="font-semibold text-neutral-950">~$5.4M</dd>
              </div>
            </dl>
          </div>
        </div>
      </RevealSection>
    </section>
  );
}

function ExplainerMassingSvg() {
  const pad = { x: 44, y: 40, w: 192, h: 112 };
  const u = 0.5;
  const bw = pad.w * Math.sqrt(u);
  const bh = pad.h * Math.sqrt(u);
  const envelopeD = `M ${pad.x} ${pad.y} L ${pad.x + pad.w} ${pad.y} L ${pad.x + pad.w} ${pad.y + pad.h} L ${pad.x} ${pad.y + pad.h} Z`;
  const hatchId = "aervara-landing-explainer-hatch";
  const clipId = "aervara-landing-explainer-clip";

  return (
    <svg
      viewBox="0 0 280 160"
      className="mx-auto h-auto w-full max-w-[280px] text-neutral-700/85"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <pattern
          id={hatchId}
          width="5"
          height="5"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(-42)"
        >
          <line
            x1="0"
            y1="0"
            x2="0"
            y2="5"
            stroke="rgb(120 113 108 / 0.22)"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
        </pattern>
        <clipPath id={clipId}>
          <path d={envelopeD} />
        </clipPath>
      </defs>
      <path d={envelopeD} fill="rgb(250 250 249)" stroke="none" />
      <g clipPath={`url(#${clipId})`}>
        <rect
          x={pad.x}
          y={pad.y}
          width={pad.w}
          height={Math.max(0, pad.h - bh)}
          fill={`url(#${hatchId})`}
        />
        <rect
          x={pad.x}
          y={pad.y + pad.h - bh}
          width={Math.max(0, pad.w - bw)}
          height={bh}
          fill={`url(#${hatchId})`}
        />
      </g>
      <rect
        x={pad.x + pad.w - bw}
        y={pad.y + pad.h - bh}
        width={bw}
        height={bh}
        fill="rgb(41 37 36 / 0.88)"
        stroke="rgb(28 25 23 / 0.3)"
        strokeWidth="0.75"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d={envelopeD}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.05"
        strokeDasharray="5 4"
        vectorEffect="non-scaling-stroke"
        opacity={0.65}
      />
    </svg>
  );
}
