import type { ReactNode } from "react";
import type { BuildHereConcept } from "@/lib/build-here-concept";
import { cn } from "@/lib/utils";

type MassingVariant = "tower" | "podium" | "bar";

function massingVariantFromConcept(c: BuildHereConcept): MassingVariant {
  const t = c.buildingType.toLowerCase();
  const u = c.useMix.toLowerCase();
  if (
    t.includes("industrial") ||
    t.includes("warehouse") ||
    t.includes("flex")
  ) {
    return "bar";
  }
  if (
    t.includes("mixed-use") ||
    t.includes("mixed use") ||
    (u.includes("retail") && u.includes("residential")) ||
    (u.includes("ground-floor") && u.includes("residential"))
  ) {
    return "podium";
  }
  if (
    (t.includes("office") || t.includes("retail")) &&
    c.unitCount == null &&
    c.estimatedFloors <= 4
  ) {
    return "bar";
  }
  return "tower";
}

function floorSlabLines(
  yTop: number,
  yBottom: number,
  x: number,
  w: number,
  floorCount: number,
): ReactNode[] {
  const h = yBottom - yTop;
  const inner = Math.min(Math.max(floorCount - 1, 1), 11);
  const lines: ReactNode[] = [];
  for (let i = 1; i <= inner; i += 1) {
    const y = yTop + (h * i) / (inner + 1);
    lines.push(
      <line
        key={i}
        x1={x + 0.5}
        y1={y}
        x2={x + w - 0.5}
        y2={y}
        stroke="currentColor"
        strokeWidth="0.65"
        vectorEffect="non-scaling-stroke"
        opacity={0.22 + (i % 2) * 0.06}
      />,
    );
  }
  return lines;
}

type BuildHereMassingGraphicProps = {
  concept: BuildHereConcept;
  className?: string;
};

/**
 * Conceptual elevation / massing wireframe — not a design or code diagram.
 */
export function BuildHereMassingGraphic({
  concept,
  className,
}: BuildHereMassingGraphicProps) {
  const variant = massingVariantFromConcept(concept);
  const floors = Math.max(1, Math.min(concept.estimatedFloors, 48));

  const massingLabel =
    variant === "podium"
      ? "Conceptual podium-and-tower wireframe massing."
      : variant === "bar"
        ? "Conceptual low-rise bar massing."
        : "Conceptual stacked tower wireframe massing.";

  return (
    <div
      className={cn(
        "relative flex min-h-[200px] flex-1 items-end justify-center bg-neutral-50/90 px-4 pb-3 pt-6",
        className,
      )}
      role="img"
      aria-label={`${massingLabel} Approximately ${floors} above-grade floors implied by screening math.`}
    >
      <div className="pointer-events-none absolute left-3 right-3 top-3 z-[2] space-y-1.5">
        <span className="inline-flex rounded-full border border-neutral-200/90 bg-white/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-neutral-600 shadow-sm">
          Illustrative only
        </span>
        <p className="max-w-[14rem] text-[10px] font-medium leading-snug text-neutral-500">
          Not a surveyed parcel boundary or approved building footprint.
        </p>
      </div>
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.45]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgb(163 163 163 / 0.12) 1px, transparent 1px),
            linear-gradient(to bottom, rgb(163 163 163 / 0.12) 1px, transparent 1px)
          `,
          backgroundSize: "14px 14px",
        }}
        aria-hidden
      />
      <svg
        viewBox="0 0 220 260"
        className="relative z-[1] h-[220px] w-full max-w-[200px] text-neutral-700/90"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Grade */}
        <line
          x1="18"
          y1="238"
          x2="202"
          y2="238"
          stroke="currentColor"
          strokeWidth="0.9"
          vectorEffect="non-scaling-stroke"
          opacity={0.35}
        />

        {variant === "bar" ? (
          <g>
            <rect
              x="38"
              y="168"
              width="144"
              height="70"
              stroke="currentColor"
              strokeWidth="1.05"
              vectorEffect="non-scaling-stroke"
              fill="rgb(250 250 249 / 0.35)"
            />
            {floorSlabLines(168, 238, 38, 144, Math.min(floors, 4))}
            <line
              x1="110"
              y1="168"
              x2="110"
              y2="238"
              stroke="currentColor"
              strokeWidth="0.55"
              vectorEffect="non-scaling-stroke"
              opacity={0.2}
            />
          </g>
        ) : variant === "podium" ? (
          <g>
            {/* Podium */}
            <rect
              x="36"
              y="188"
              width="148"
              height="50"
              stroke="currentColor"
              strokeWidth="1.05"
              vectorEffect="non-scaling-stroke"
              fill="none"
            />
            {floorSlabLines(188, 238, 36, 148, 3)}
            <line
              x1="110"
              y1="188"
              x2="110"
              y2="238"
              stroke="currentColor"
              strokeWidth="0.55"
              vectorEffect="non-scaling-stroke"
              opacity={0.18}
            />
            {/* Tower */}
            <rect
              x="72"
              y="36"
              width="76"
              height="152"
              stroke="currentColor"
              strokeWidth="1.05"
              vectorEffect="non-scaling-stroke"
              fill="rgb(250 250 249 / 0.4)"
            />
            {floorSlabLines(36, 188, 72, 76, floors)}
            <line
              x1="110"
              y1="36"
              x2="110"
              y2="188"
              stroke="currentColor"
              strokeWidth="0.55"
              vectorEffect="non-scaling-stroke"
              opacity={0.2}
            />
            {/* Roof plane hint */}
            <path
              d="M 72 36 L 110 22 L 148 36"
              stroke="currentColor"
              strokeWidth="0.75"
              vectorEffect="non-scaling-stroke"
              opacity={0.35}
            />
          </g>
        ) : (
          <g>
            <rect
              x="68"
              y="32"
              width="84"
              height="206"
              stroke="currentColor"
              strokeWidth="1.05"
              vectorEffect="non-scaling-stroke"
              fill="rgb(250 250 249 / 0.4)"
            />
            {floorSlabLines(32, 238, 68, 84, floors)}
            <line
              x1="110"
              y1="32"
              x2="110"
              y2="238"
              stroke="currentColor"
              strokeWidth="0.55"
              vectorEffect="non-scaling-stroke"
              opacity={0.2}
            />
            <path
              d="M 68 32 L 110 18 L 152 32"
              stroke="currentColor"
              strokeWidth="0.75"
              vectorEffect="non-scaling-stroke"
              opacity={0.35}
            />
          </g>
        )}
      </svg>
    </div>
  );
}
