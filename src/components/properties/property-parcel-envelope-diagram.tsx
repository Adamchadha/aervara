import { computeFarMetrics } from "@/lib/far-calculations";
import { cn } from "@/lib/utils";

export type PropertyParcelEnvelopeDiagramProps = {
  lotSizeSqft: number;
  builtFloorAreaSqft: number;
  maxFar: number;
  /** Unique fragment ids when multiple diagrams exist (e.g. UUID). */
  diagramInstanceId: string;
  className?: string;
};

/**
 * Schematic plan-view diagram: lot, max envelope, built mass, remaining pad.
 * Proportions follow floor-area utilization (FAR cap), not survey geometry.
 */
function safeSvgFragmentId(raw: string, suffix: string) {
  const base = raw.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 64);
  return `aervara-pe-${suffix}-${base || "x"}`;
}

export function PropertyParcelEnvelopeDiagram({
  lotSizeSqft,
  builtFloorAreaSqft,
  maxFar,
  diagramInstanceId,
  className,
}: PropertyParcelEnvelopeDiagramProps) {
  const clipEnvId = safeSvgFragmentId(diagramInstanceId, "clip");
  const hatchId = safeSvgFragmentId(diagramInstanceId, "hatch");

  const { max_buildable_sqft } = computeFarMetrics(
    lotSizeSqft,
    builtFloorAreaSqft,
    maxFar,
  );
  const built = Math.max(0, builtFloorAreaSqft);
  const maxCap = Math.max(0, max_buildable_sqft);
  const utilization = maxCap > 0 ? Math.min(1, built / maxCap) : 0;
  const s = utilization > 0 ? Math.sqrt(utilization) : 0;

  const vb = { w: 320, h: 220 };
  /** Orthogonal “pad” aligned to schematic envelope (max GFA cap). */
  const pad = { x: 56, y: 72, w: 204, h: 96 };
  const envelopeD = `M ${pad.x} ${pad.y} L ${pad.x + pad.w} ${pad.y} L ${pad.x + pad.w} ${pad.y + pad.h} L ${pad.x} ${pad.y + pad.h} Z`;
  /** Outer lot — one jog, site-plan tone. */
  const lotD =
    "M 32 172 L 32 56 L 198 48 L 286 62 L 286 174 L 154 190 Z";

  const bw = pad.w * s;
  const bh = pad.h * s;
  const hasBuilt = utilization > 0.002;
  const fullBuildout = utilization >= 0.998;

  const ariaUtil =
    maxCap > 0
      ? `${Math.round(utilization * 1000) / 10}% of max buildable floor area`
      : "max buildable floor area is zero";

  return (
    <figure
      className={cn(
        "rounded-[1.75rem] border border-stone-200/70 bg-white/82 px-5 py-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)] backdrop-blur-sm sm:px-7 sm:py-7",
        className,
      )}
    >
      <figcaption>
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-500">
          Illustrative FAR capacity diagram
        </p>
        <p className="mt-2 inline-flex rounded-full border border-stone-200/80 bg-stone-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-stone-500">
          Illustrative only
        </p>
        <p className="mt-2 max-w-lg text-xs leading-relaxed text-stone-600">
          Schematic utilization of submitted lot size and FAR inputs. Not a surveyed parcel boundary or
          approved building footprint.
        </p>
      </figcaption>

      <div className="aervara-pe-frame relative mt-5 overflow-hidden rounded-lg bg-white ring-1 ring-neutral-950/[0.04]">
        <svg
          className="h-auto w-full max-h-[min(52vw,14rem)] sm:max-h-[15.5rem]"
          viewBox={`0 0 ${vb.w} ${vb.h}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label={`Illustrative capacity schematic. ${ariaUtil}. Not survey geometry. Layers: schematic lot guide, max FAR cap, built floor area, remaining capacity.`}
          role="img"
        >
          <title>Illustrative FAR capacity schematic (not survey geometry)</title>
          <defs>
            <pattern
              id={hatchId}
              width="5"
              height="5"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(-40)"
            >
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="5"
                stroke="rgb(120 113 108 / 0.2)"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
            </pattern>
            <clipPath id={clipEnvId}>
              <path d={envelopeD} />
            </clipPath>
          </defs>

          <path d={lotD} fill="rgb(250 250 249 / 0.9)" stroke="none" />
          <path
            d={envelopeD}
            fill="rgb(231 229 228 / 0.65)"
            stroke="none"
          />

          {/* Remaining capacity: hatched only outside built footprint (SW anchor). */}
          <g clipPath={`url(#${clipEnvId})`}>
            {!fullBuildout && hasBuilt ? (
              <>
                <rect
                  x={pad.x}
                  y={pad.y}
                  width={pad.w}
                  height={Math.max(0, pad.h - bh)}
                  fill={`url(#${hatchId})`}
                />
                <rect
                  x={pad.x + bw}
                  y={pad.y + pad.h - bh}
                  width={Math.max(0, pad.w - bw)}
                  height={bh}
                  fill={`url(#${hatchId})`}
                />
              </>
            ) : !fullBuildout ? (
              <rect
                x={pad.x}
                y={pad.y}
                width={pad.w}
                height={pad.h}
                fill={`url(#${hatchId})`}
              />
            ) : null}
          </g>

          {hasBuilt ? (
            <rect
              x={pad.x}
              y={pad.y + pad.h - bh}
              width={Math.max(bw, 0.75)}
              height={Math.max(bh, 0.75)}
              fill="rgb(41 37 36 / 0.9)"
              stroke="rgb(28 25 23 / 0.35)"
              strokeWidth="0.75"
              vectorEffect="non-scaling-stroke"
            />
          ) : null}

          <path
            d={envelopeD}
            fill="none"
            stroke="rgb(120 113 108 / 0.55)"
            strokeWidth="1"
            strokeDasharray="5 4"
            vectorEffect="non-scaling-stroke"
          />
          <path
            d={lotD}
            fill="none"
            stroke="rgb(41 37 36 / 0.92)"
            strokeWidth="1.15"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>

      <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2.5 text-[11px] text-stone-600">
        <li className="flex items-center gap-2">
          <span
            className="h-2.5 w-4 shrink-0 rounded-[1px] border border-dashed border-stone-600/65 bg-white/70"
            aria-hidden
          />
          <span className="font-medium text-stone-800">Lot (schematic guide)</span>
        </li>
        <li className="flex items-center gap-2">
          <span
            className="h-2.5 w-4 shrink-0 rounded-[2px] bg-stone-800/90 ring-1 ring-stone-950/10"
            aria-hidden
          />
          <span className="font-medium text-stone-800">Built (schematic)</span>
        </li>
        <li className="flex items-center gap-2">
          <span
            className="h-2.5 w-4 shrink-0 rounded-[2px] bg-[repeating-linear-gradient(-52deg,rgb(120_113_108/0.22)_0_1px,transparent_1px_4px)] ring-1 ring-stone-300/50"
            aria-hidden
          />
          <span className="font-medium text-stone-800">Remaining capacity</span>
        </li>
        <li className="flex items-center gap-2">
          <span
            className="h-0.5 w-6 shrink-0 border-t border-dashed border-stone-500/85"
            aria-hidden
          />
          <span className="font-medium text-stone-800">Max FAR cap</span>
        </li>
      </ul>
    </figure>
  );
}
