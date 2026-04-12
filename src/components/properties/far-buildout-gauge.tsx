import {
  computeFarBuildoutBar,
  formatFar,
} from "@/lib/far-calculations";
import { cn } from "@/lib/utils";

export type FarBuildoutGaugeProps = {
  currentBuiltFar: number;
  maxFar: number;
  remainingFar: number;
  /** Tighter typography for dashboard cards. */
  compact?: boolean;
  className?: string;
};

/**
 * Horizontal utilization of max FAR: built (filled) vs remaining (adjacent track).
 */
export function FarBuildoutGauge({
  currentBuiltFar,
  maxFar,
  remainingFar,
  compact = false,
  className,
}: FarBuildoutGaugeProps) {
  const model = computeFarBuildoutBar(
    currentBuiltFar,
    maxFar,
    remainingFar,
  );
  const { maxFar: max, builtFar: built, remainingFar: remaining } = model;
  const fillPct = model.builtWidthPct;
  const utilPctRounded =
    max > 0 ? Math.min(100, Math.round(Math.min(built / max, 1) * 1000) / 10) : 0;
  const remainingPctRounded =
    max > 0
      ? Math.min(100, Math.round(Math.min(remaining / max, 1) * 1000) / 10)
      : 0;

  const labelCls = compact
    ? "text-[10px] uppercase tracking-wide text-neutral-500"
    : "text-[11px] font-medium uppercase tracking-wide text-neutral-500";
  const valueCls = compact
    ? "text-[11px] font-mono tabular-nums text-neutral-800"
    : "text-xs font-mono tabular-nums text-neutral-900";

  const titleCls = compact
    ? "text-[9px] font-semibold uppercase tracking-[0.12em] text-neutral-400"
    : "text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-400";

  return (
    <div className={cn("space-y-2.5", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <p className={titleCls}>Built vs remaining FAR</p>
        {max > 0 ? (
          <p
            className={cn(
              "shrink-0 font-mono tabular-nums text-neutral-400",
              compact ? "text-[10px]" : "text-[11px]",
            )}
          >
            Max {formatFar(max)}
          </p>
        ) : null}
      </div>

      <div
        className="flex h-2.5 w-full overflow-hidden rounded-full bg-neutral-100 ring-1 ring-neutral-950/[0.06]"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(fillPct)}
        aria-label={`Built FAR ${formatFar(built)} of max ${formatFar(max)}, ${utilPctRounded}% utilized; remaining ${formatFar(remaining)}`}
      >
        {max > 0 ? (
          <>
            <div
              className="h-full shrink-0 bg-gradient-to-b from-neutral-800 to-neutral-900 transition-[width] duration-300 ease-out"
              style={{ width: `${model.builtWidthPct}%` }}
            />
            <div
              className="h-full min-w-0 bg-neutral-200/80 transition-[width] duration-300 ease-out"
              style={{ width: `${model.remainingWidthPct}%` }}
            />
          </>
        ) : (
          <div className="h-full w-full bg-neutral-100" />
        )}
      </div>

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className={cn(labelCls, "flex items-center gap-1.5")}>
            <span
              className="h-1.5 w-1.5 shrink-0 rounded-full bg-neutral-800"
              aria-hidden
            />
            Built
          </p>
          <p className={cn("mt-0.5 font-semibold", valueCls)}>{formatFar(built)}</p>
          {max > 0 ? (
            <p className="mt-0.5 text-[10px] tabular-nums text-neutral-400">
              {compact ? `${utilPctRounded}% used` : `${utilPctRounded}% utilized`}
            </p>
          ) : null}
        </div>
        <div className="min-w-0 text-right">
          <p className={cn(labelCls, "flex items-center justify-end gap-1.5")}>
            <span
              className="h-1.5 w-1.5 shrink-0 rounded-full bg-neutral-300"
              aria-hidden
            />
            Remaining
          </p>
          <p className={cn("mt-0.5 font-semibold", valueCls)}>{formatFar(remaining)}</p>
          {max > 0 && !compact ? (
            <p className="mt-0.5 text-[10px] tabular-nums text-neutral-400">
              {remainingPctRounded}% of cap
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
