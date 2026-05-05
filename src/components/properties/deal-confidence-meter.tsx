import type { DealConfidence } from "@/lib/deal-confidence";
import { cn } from "@/lib/utils";

type DealConfidenceMeterProps = {
  confidence: DealConfidence;
  /** Tighter spacing for dashboard cards. */
  compact?: boolean;
};

export function DealConfidenceMeter({
  confidence,
  compact = false,
}: DealConfidenceMeterProps) {
  const { score, band, label } = confidence;

  const barClass =
    band === "high"
      ? "bg-emerald-600"
      : band === "medium"
        ? "bg-amber-500"
        : "bg-neutral-400";

  return (
    <div
      className={cn(compact ? "space-y-2" : "space-y-2.5")}
      aria-label={`Deal confidence ${score} out of 100, ${label}`}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
          Deal confidence
        </p>
        <p
          className={cn(
            "text-xs font-semibold tabular-nums",
            band === "high" && "text-emerald-800",
            band === "medium" && "text-amber-800",
            band === "low" && "text-neutral-600",
          )}
        >
          {label}
        </p>
      </div>
      <div
        className={cn(
          "h-2 w-full overflow-hidden rounded-full bg-neutral-200/90",
          compact ? "h-1.5" : "h-2",
        )}
        role="presentation"
      >
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-500 ease-out",
            barClass,
          )}
          style={{ width: `${score}%` }}
        />
      </div>
      <p className="text-[11px] tabular-nums text-neutral-500">
        <span className="font-mono font-medium text-neutral-700">{score}</span>
        <span className="text-neutral-400"> / 100</span>
      </p>
    </div>
  );
}
