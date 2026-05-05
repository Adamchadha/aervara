import { cn } from "@/lib/utils";

/**
 * Subtle blueprint / site-plan motif for the landing hero.
 * Motion is CSS-only (see globals.css); reduced-motion users see a static frame.
 */
export function HeroBlueprintBackground({ className }: { className?: string }) {
  const vXs = [80, 154, 228, 302, 376, 450, 524, 598, 672, 746, 820];
  const hYs = [72, 140, 208, 276, 344, 412, 480];

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 z-0 overflow-hidden",
        className,
      )}
      aria-hidden
    >
      <div className="aervara-hero-bp-grid absolute inset-[-12%] opacity-0 aervara-hero-bp-grid-in" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="aervara-hero-bp-drift-wrap h-[min(115%,48rem)] w-[min(130%,72rem)] max-w-[100vw]">
          <svg
            className="aervara-hero-bp-svg h-full w-full text-neutral-500/[0.22]"
            viewBox="0 0 900 520"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMidYMid meet"
          >
            <title>Decorative blueprint pattern</title>
            <g
              className="aervara-hero-bp-draw"
              stroke="currentColor"
              strokeWidth="0.55"
              strokeLinecap="square"
            >
              {vXs.map((x) => (
                <line
                  key={`v${x}`}
                  x1={x}
                  y1={40}
                  x2={x}
                  y2={480}
                  pathLength={1}
                  vectorEffect="non-scaling-stroke"
                />
              ))}
              {hYs.map((y) => (
                <line
                  key={`h${y}`}
                  x1={60}
                  y1={y}
                  x2={820}
                  y2={y}
                  pathLength={1}
                  vectorEffect="non-scaling-stroke"
                />
              ))}
            </g>
            <path
              className="aervara-hero-bp-lot aervara-hero-bp-delay-1"
              d="M 268 168 L 548 152 L 592 268 L 564 388 L 312 402 L 228 292 Z"
              pathLength={1}
              stroke="currentColor"
              strokeWidth="0.85"
              fill="rgb(28 25 23 / 0.025)"
              vectorEffect="non-scaling-stroke"
            />
            <path
              className="aervara-hero-bp-dash aervara-hero-bp-delay-2"
              d="M 308 200 L 520 188 L 552 276 L 528 356 L 336 368 L 268 284 Z"
              pathLength={1}
              stroke="currentColor"
              strokeWidth="0.5"
              strokeDasharray="0.012 0.018"
              fill="none"
              vectorEffect="non-scaling-stroke"
            />
            <g
              stroke="currentColor"
              strokeWidth="0.45"
              className="aervara-hero-bp-draw aervara-hero-bp-delay-3"
            >
              <line
                x1="268"
                y1="148"
                x2="548"
                y2="132"
                pathLength={1}
                vectorEffect="non-scaling-stroke"
              />
              <line
                x1="268"
                y1="148"
                x2="248"
                y2="148"
                pathLength={1}
                vectorEffect="non-scaling-stroke"
              />
              <line
                x1="548"
                y1="132"
                x2="568"
                y2="132"
                pathLength={1}
                vectorEffect="non-scaling-stroke"
              />
              <line
                x1="228"
                y1="292"
                x2="208"
                y2="292"
                pathLength={1}
                vectorEffect="non-scaling-stroke"
              />
              <line
                x1="312"
                y1="422"
                x2="312"
                y2="448"
                pathLength={1}
                vectorEffect="non-scaling-stroke"
              />
            </g>
            <g
              stroke="currentColor"
              strokeWidth="0.45"
              className="aervara-hero-bp-fade aervara-hero-bp-delay-4"
            >
              {[248, 308, 368, 428, 488, 548].map((x) => (
                <line key={x} x1={x} y1="138" x2={x} y2="148" />
              ))}
            </g>
            <g
              stroke="currentColor"
              strokeWidth="0.35"
              className="aervara-hero-bp-fade-soft aervara-hero-bp-delay-2"
            >
              <line x1="120" y1="460" x2="780" y2="100" />
              <line x1="60" y1="420" x2="640" y2="80" />
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
}
