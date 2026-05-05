import { cn } from "@/lib/utils";
import { formatFar, formatSqft } from "@/lib/far-calculations";

const cardShell =
  "rounded-[1.75rem] border border-stone-200/70 bg-white/82 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)] backdrop-blur-sm";

type ParcelGeometryInsightCardProps = {
  hasVerifiedParcelGeometry: boolean;
  zoningDistrict: string;
  lotSizeSqft: number;
  builtFloorAreaSqft: number;
  maxFar: number;
  remainingBuildableSqft: number;
  geometrySourceLabel?: string | null;
  lotWidthFt?: number | null;
  lotDepthFt?: number | null;
};

function IllustrativePlaceholderSvg() {
  return (
    <svg
      viewBox="0 0 200 120"
      className="h-[7.5rem] w-full text-stone-400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <pattern id="pg-grid" width="12" height="12" patternUnits="userSpaceOnUse">
          <path d="M 12 0 L 0 0 0 12" stroke="currentColor" strokeOpacity="0.2" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="200" height="120" fill="url(#pg-grid)" />
      <rect
        x="36"
        y="28"
        width="128"
        height="64"
        rx="4"
        stroke="currentColor"
        strokeOpacity="0.45"
        strokeWidth="1"
        strokeDasharray="4 3"
        fill="rgb(255 255 255 / 0.35)"
      />
      <line x1="48" y1="44" x2="152" y2="44" stroke="currentColor" strokeOpacity="0.25" strokeWidth="0.75" />
      <line x1="48" y1="76" x2="120" y2="76" stroke="currentColor" strokeOpacity="0.25" strokeWidth="0.75" />
    </svg>
  );
}

/**
 * Parcel / capacity context card — never implies surveyed boundary unless verified flags exist.
 */
export function ParcelGeometryInsightCard({
  hasVerifiedParcelGeometry,
  zoningDistrict,
  lotSizeSqft,
  builtFloorAreaSqft,
  maxFar,
  remainingBuildableSqft,
  geometrySourceLabel,
  lotWidthFt,
  lotDepthFt,
}: ParcelGeometryInsightCardProps) {
  if (hasVerifiedParcelGeometry) {
    return (
      <div className={cn(cardShell)}>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-700/90">
          Verified parcel geometry
        </p>
        <p className="mt-2 text-xs leading-relaxed text-stone-600">
          Linked parcel record — dimensions below reflect imported or verified sources.
        </p>
        {geometrySourceLabel ? (
          <p className="mt-2 text-[11px] font-medium text-stone-500">Source: {geometrySourceLabel}</p>
        ) : null}
        <dl className="mt-5 grid gap-3 text-sm">
          <div className="flex justify-between gap-4 border-b border-stone-200/60 pb-2">
            <dt className="text-stone-500">Parcel area</dt>
            <dd className="font-semibold tabular-nums text-stone-900">{formatSqft(lotSizeSqft)}</dd>
          </div>
          {lotWidthFt != null && lotWidthFt > 0 ? (
            <div className="flex justify-between gap-4 border-b border-stone-200/60 pb-2">
              <dt className="text-stone-500">Lot width (verified)</dt>
              <dd className="font-semibold tabular-nums text-stone-900">{lotWidthFt.toFixed(1)} ft</dd>
            </div>
          ) : null}
          {lotDepthFt != null && lotDepthFt > 0 ? (
            <div className="flex justify-between gap-4 border-b border-stone-200/60 pb-2">
              <dt className="text-stone-500">Lot depth (verified)</dt>
              <dd className="font-semibold tabular-nums text-stone-900">{lotDepthFt.toFixed(1)} ft</dd>
            </div>
          ) : null}
          <div className="flex justify-between gap-4 border-b border-stone-200/60 pb-2">
            <dt className="text-stone-500">Zoning</dt>
            <dd className="text-right font-semibold text-stone-900">{zoningDistrict.trim() || "—"}</dd>
          </div>
          <div className="flex justify-between gap-4 border-b border-stone-200/60 pb-2">
            <dt className="text-stone-500">Max FAR</dt>
            <dd className="font-semibold tabular-nums text-stone-900">{formatFar(maxFar)}</dd>
          </div>
          <div className="flex justify-between gap-4 border-b border-stone-200/60 pb-2">
            <dt className="text-stone-500">Current built SF</dt>
            <dd className="font-semibold tabular-nums text-stone-900">{formatSqft(builtFloorAreaSqft)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-stone-500">Remaining buildable SF</dt>
            <dd className="font-semibold tabular-nums text-stone-900">{formatSqft(remainingBuildableSqft)}</dd>
          </div>
        </dl>
        <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-400">
          Confidence: Verified (geometry)
        </p>
      </div>
    );
  }

  return (
    <div className={cn(cardShell)}>
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-500">
          Illustrative massing only
        </p>
        <span className="rounded-full border border-stone-200/80 bg-stone-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-stone-600">
          Illustrative only
        </span>
      </div>
      <IllustrativePlaceholderSvg />
      <p className="mt-4 text-xs leading-relaxed text-stone-600">
        Not a surveyed parcel boundary or approved building footprint.
      </p>
      <dl className="mt-4 grid gap-2 border-t border-stone-200/60 pt-4 text-[11px] text-stone-600">
        <div className="flex justify-between gap-3">
          <span>Zoning (submitted)</span>
          <span className="font-medium text-stone-800">{zoningDistrict.trim() || "—"}</span>
        </div>
        <div className="flex justify-between gap-3">
          <span>Modeled lot SF</span>
          <span className="font-mono tabular-nums text-stone-800">{formatSqft(lotSizeSqft)}</span>
        </div>
        <div className="flex justify-between gap-3">
          <span>Max FAR (submitted)</span>
          <span className="font-mono tabular-nums text-stone-800">{formatFar(maxFar)}</span>
        </div>
      </dl>
      <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-400">
        Confidence: Illustrative only
      </p>
    </div>
  );
}
