import { ParcelGeometryInsightCard } from "@/components/properties/parcel-geometry-insight-card";
import { computeFarMetrics } from "@/lib/far-calculations";
import { cn } from "@/lib/utils";
import type { VisualConceptSummary } from "@/lib/visual-concept-heuristics";

type VisualConceptsModuleProps = {
  lotSizeSqft: number;
  builtFloorAreaSqft: number;
  maxFar: number;
  diagramInstanceId: string;
  concept: VisualConceptSummary;
  /** Underbuilt / opportunity score (0–100) for the concept strip */
  underbuiltScore: number;
  complexityScore: number;
  zoningDistrict: string;
  unusedBuildableSqft: number;
  /** When true, GIS-verified geometry fields were linked (future). */
  hasVerifiedParcelGeometry?: boolean;
  geometrySourceLabel?: string | null;
  lotWidthFt?: number | null;
  lotDepthFt?: number | null;
  className?: string;
};

function safeId(raw: string, suffix: string) {
  const base = raw.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 48);
  return `aervara-vc-${suffix}-${base || "x"}`;
}

/**
 * Blueprint-style massing schematic + conceptual program card.
 * Conceptual only—not a survey, setback check, or architectural deliverable.
 */
function formatFarLabel(n: number) {
  if (!Number.isFinite(n) || n <= 0) return "—";
  return `${n >= 10 ? n.toFixed(1) : n.toFixed(2)}×`;
}

export function VisualConceptsModule({
  lotSizeSqft,
  builtFloorAreaSqft,
  maxFar,
  diagramInstanceId,
  concept,
  underbuiltScore,
  complexityScore,
  zoningDistrict,
  unusedBuildableSqft,
  hasVerifiedParcelGeometry = false,
  geometrySourceLabel = null,
  lotWidthFt = null,
  lotDepthFt = null,
  className,
}: VisualConceptsModuleProps) {
  const hatchId = safeId(diagramInstanceId, "hatch");
  const hatchBuiltId = safeId(diagramInstanceId, "hatchBuilt");

  const { max_buildable_sqft } = computeFarMetrics(
    lotSizeSqft,
    builtFloorAreaSqft,
    maxFar,
  );
  const built = Math.max(0, builtFloorAreaSqft);
  const maxCap = Math.max(0, max_buildable_sqft);
  const u = maxCap > 0 ? Math.min(1, built / maxCap) : 0;
  const s = u > 0 ? Math.sqrt(u) : 0;

  const vb = { w: 420, h: 280 };
  const pad = { x: 118, y: 62, w: 220, h: 168 };
  const env = `M ${pad.x} ${pad.y} L ${pad.x + pad.w} ${pad.y} L ${pad.x + pad.w} ${pad.y + pad.h} L ${pad.x} ${pad.y + pad.h} Z`;
  const lotPath =
    "M 36 228 L 36 52 L 188 38 L 372 58 L 382 210 L 228 248 L 72 236 Z";

  const bw = pad.w * s;
  const bh = pad.h * s;
  const bx = pad.x + (pad.w - bw) / 2;
  const by = pad.y + (pad.h - bh) / 2;
  const hasBuilt = u > 0.004;

  return (
    <div className={cn("space-y-8", className)}>
      <div className="rounded-xl border border-amber-200/55 bg-amber-50/35 px-4 py-3 sm:px-5">
        <p className="text-[11px] font-semibold leading-snug text-amber-950/90">
          Preliminary visual concepts only. Diagrams illustrate modeled capacity from submitted
          inputs—not a surveyed parcel boundary, dimensions for construction, lease, or filings.
        </p>
      </div>

      <section
        aria-labelledby="aervara-build-concept-heading"
        className={cn(
          "relative overflow-hidden rounded-2xl border border-stone-200/70 bg-gradient-to-br from-stone-50 via-white to-stone-100/40",
          "p-7 shadow-[0_2px_24px_-8px_rgba(15,23,42,0.08)] ring-1 ring-stone-900/[0.035] sm:p-8",
        )}
      >
        <div
          className="pointer-events-none absolute inset-y-0 right-0 w-[42%] max-w-sm bg-[radial-gradient(ellipse_at_top,rgb(231_229_228/0.55)_0%,transparent_68%)]"
          aria-hidden
        />
        <div className="relative">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-stone-500">
            What would I build here?
          </p>
          <h2
            id="aervara-build-concept-heading"
            className="sr-only"
          >
            Concept engine — suggested development concept
          </h2>
          <p className="mt-2 text-[11px] leading-relaxed text-stone-500">
            Conceptual guidance from parcel signals—not final design or
            investment advice.
          </p>
          <h3 className="mt-5 text-xl font-semibold tracking-[-0.02em] text-stone-900 sm:text-[1.35rem] sm:tracking-tight">
            {concept.suggestedBuildingType}
          </h3>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-stone-700">
            {concept.rationale}
          </p>
          <ul className="mt-6 flex flex-wrap gap-2">
            <li className="rounded-md border border-stone-200/80 bg-white/80 px-2.5 py-1 font-mono text-[10px] tabular-nums text-stone-600">
              <span className="text-stone-400">Zoning </span>
              {zoningDistrict.trim() || "—"}
            </li>
            <li className="rounded-md border border-stone-200/80 bg-white/80 px-2.5 py-1 font-mono text-[10px] tabular-nums text-stone-600">
              <span className="text-stone-400">Max FAR </span>
              {formatFarLabel(maxFar)}
            </li>
            <li className="rounded-md border border-stone-200/80 bg-white/80 px-2.5 py-1 font-mono text-[10px] tabular-nums text-stone-600">
              <span className="text-stone-400">Lot </span>
              {lotSizeSqft > 0
                ? `${Math.round(lotSizeSqft).toLocaleString("en-US")} sf`
                : "—"}
            </li>
            <li className="rounded-md border border-stone-200/80 bg-white/80 px-2.5 py-1 font-mono text-[10px] tabular-nums text-stone-600">
              <span className="text-stone-400">Unused buildable </span>
              {unusedBuildableSqft > 0
                ? `${Math.round(unusedBuildableSqft).toLocaleString("en-US")} sf`
                : "—"}
            </li>
            <li className="rounded-md border border-stone-200/80 bg-white/80 px-2.5 py-1 font-mono text-[10px] tabular-nums text-stone-600">
              <span className="text-stone-400">Opportunity </span>
              {Math.round(Math.min(100, Math.max(0, underbuiltScore)))}/100
            </li>
            <li className="rounded-md border border-stone-200/80 bg-white/80 px-2.5 py-1 font-mono text-[10px] tabular-nums text-stone-600">
              <span className="text-stone-400">Complexity </span>
              {Math.round(Math.min(100, Math.max(0, complexityScore)))}/100
            </li>
          </ul>
        </div>
      </section>

      <div className="grid gap-10 lg:grid-cols-[1.15fr_min(320px,100%)] lg:items-start lg:gap-12">
        <figure className="min-w-0">
          <figcaption className="mb-3">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-500">
                Illustrative schematic
              </p>
              <span className="rounded-full border border-stone-200/80 bg-stone-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-stone-600">
                Illustrative only
              </span>
            </div>
            <p className="mt-2 max-w-xl text-xs leading-relaxed text-stone-600">
              Not a surveyed parcel boundary or approved building footprint. Geometry is decorative;
              capacity math uses submitted FAR and floor-area fields only.
            </p>
          </figcaption>
          <div className="aervara-vc-frame relative overflow-hidden rounded-xl border border-stone-200/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] ring-1 ring-stone-900/[0.04]">
            <svg
              className="aervara-vc-svg block h-auto w-full text-stone-600/90"
              viewBox={`0 0 ${vb.w} ${vb.h}`}
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden
            >
              <defs>
                <pattern
                  id={hatchId}
                  width="6"
                  height="6"
                  patternUnits="userSpaceOnUse"
                  patternTransform="rotate(-42)"
                >
                  <line
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="6"
                    stroke="rgb(120 113 108 / 0.22)"
                    strokeWidth="1"
                  />
                </pattern>
                <pattern
                  id={hatchBuiltId}
                  width="5"
                  height="5"
                  patternUnits="userSpaceOnUse"
                  patternTransform="rotate(38)"
                >
                  <line
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="5"
                    stroke="rgb(41 37 36 / 0.35)"
                    strokeWidth="1"
                  />
                </pattern>
              </defs>

              <path
                d={env}
                fill={`url(#${hatchId})`}
                className="aervara-vc-env-fill"
              />
              <g className="aervara-vc-draw">
                <path
                  d={lotPath}
                  pathLength={1}
                  className="aervara-vc-lot"
                  fill="none"
                  strokeWidth="1.1"
                  strokeLinejoin="miter"
                />
                <path
                  d={env}
                  className="aervara-vc-envelope"
                  fill="none"
                  strokeWidth="1.05"
                  strokeDasharray="5 4"
                />
                {hasBuilt ? (
                  <rect
                    x={bx}
                    y={by}
                    width={bw}
                    height={bh}
                    fill={`url(#${hatchBuiltId})`}
                    fillOpacity={0.92}
                    stroke="rgb(28 25 23 / 0.45)"
                    strokeWidth="0.9"
                    className="aervara-vc-built"
                  />
                ) : null}
              </g>

              <g
                className="aervara-vc-fade"
                stroke="currentColor"
                strokeWidth="0.45"
                opacity={0.35}
              >
                <line x1="48" y1="78" x2="96" y2="78" />
                <line x1="48" y1="92" x2="72" y2="92" />
                <line x1="300" y1="200" x2="360" y2="200" />
                <line x1="300" y1="214" x2="340" y2="214" />
              </g>

              <text
                x={vb.w - 12}
                y={22}
                textAnchor="end"
                className="fill-stone-400 text-[9px] font-mono uppercase tracking-widest"
              >
                N
              </text>
            </svg>
          </div>

          <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2 border-t border-stone-200/50 pt-4 text-[10px] text-stone-500">
            <li className="flex items-center gap-2">
              <span className="h-2 w-2.5 rounded-[1px] border border-dashed border-stone-600/70 bg-white/80" />
              Lot (schematic guide)
            </li>
            <li className="flex items-center gap-2">
              <span className="h-2 w-3.5 bg-[repeating-linear-gradient(-45deg,rgb(120_113_108/0.28)_0_1px,transparent_1px_3px)]" />
              Remaining capacity
            </li>
            <li className="flex items-center gap-2">
              <span className="h-2 w-3.5 bg-[repeating-linear-gradient(38deg,rgb(41_37_36/0.35)_0_1px,transparent_1px_2px)]" />
              Built floor area (schematic)
            </li>
            <li className="flex items-center gap-2">
              <span className="h-0.5 w-4 border-t border-dashed border-stone-500/80" />
              Max FAR cap (schematic)
            </li>
          </ul>
        </figure>

        <div className="min-w-0 space-y-6">
          <ParcelGeometryInsightCard
            hasVerifiedParcelGeometry={hasVerifiedParcelGeometry}
            zoningDistrict={zoningDistrict}
            lotSizeSqft={lotSizeSqft}
            builtFloorAreaSqft={builtFloorAreaSqft}
            maxFar={maxFar}
            remainingBuildableSqft={unusedBuildableSqft}
            geometrySourceLabel={geometrySourceLabel}
            lotWidthFt={lotWidthFt}
            lotDepthFt={lotDepthFt}
          />
          <aside
            className={cn(
              "rounded-2xl border border-stone-200/60 bg-gradient-to-b from-white to-stone-50/50 p-7",
              "shadow-[0_2px_10px_rgba(15,23,42,0.04)] ring-1 ring-stone-900/[0.03]",
            )}
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-500">
              Concept program (illustrative)
            </p>
            <p className="mt-2 text-xs leading-relaxed text-stone-500">
              Heuristic floors / units paired with the schematic—not a pro forma or lease program.
            </p>
            <dl className="mt-6 space-y-4 border-t border-stone-200/60 pt-6 text-sm">
              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-400">
                  Rough floors
                </dt>
                <dd className="mt-1 font-mono text-stone-800 tabular-nums">
                  {concept.floorsApprox != null
                    ? `≈ ${concept.floorsApprox} stories (illustrative)`
                    : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-400">
                  Rough units
                </dt>
                <dd className="mt-1 font-mono text-stone-800 tabular-nums">
                  {concept.unitsApprox != null
                    ? `≈ ${concept.unitsApprox} units (if residential)`
                    : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-400">
                  Use mix (conceptual)
                </dt>
                <dd className="mt-1 leading-relaxed text-stone-700">
                  {concept.useMix ?? "—"}
                </dd>
              </div>
            </dl>
          </aside>
        </div>
      </div>
    </div>
  );
}
