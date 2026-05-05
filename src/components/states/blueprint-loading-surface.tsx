import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type BlueprintLoadingSurfaceProps = {
  children?: ReactNode;
  className?: string;
  /** Corner registration marks (very subtle). */
  frame?: boolean;
};

/**
 * Grid + shimmer overlay for blueprint-inspired loading states.
 */
export function BlueprintLoadingSurface({
  children,
  className,
  frame = true,
}: BlueprintLoadingSurfaceProps) {
  return (
    <div
      className={cn(
        "aervara-bp-loading-surface relative overflow-hidden",
        className,
      )}
    >
      <div className="aervara-bp-loading-shimmer" aria-hidden />
      {frame ? (
        <svg
          className="pointer-events-none absolute inset-2 z-[2] h-[calc(100%-1rem)] w-[calc(100%-1rem)] text-neutral-500/22"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          fill="none"
          aria-hidden
        >
          <path
            stroke="currentColor"
            strokeWidth="1.1"
            vectorEffect="non-scaling-stroke"
            d="M 2 14 L 2 2 L 14 2"
          />
          <path
            stroke="currentColor"
            strokeWidth="1.1"
            vectorEffect="non-scaling-stroke"
            d="M 86 2 L 98 2 L 98 14"
          />
          <path
            stroke="currentColor"
            strokeWidth="1.1"
            vectorEffect="non-scaling-stroke"
            d="M 98 86 L 98 98 L 86 98"
          />
          <path
            stroke="currentColor"
            strokeWidth="1.1"
            vectorEffect="non-scaling-stroke"
            d="M 14 98 L 2 98 L 2 86"
          />
        </svg>
      ) : null}
      <div className="relative z-[3]">{children}</div>
    </div>
  );
}

type LineProps = { className?: string };

/** Thin horizontal “linework” placeholder. */
export function BlueprintLoadingLine({ className }: LineProps) {
  return <div className={cn("aervara-bp-loading-line", className)} />;
}

function CardSkeletonBlock({ emphasize }: { emphasize?: boolean }) {
  return (
    <BlueprintLoadingSurface
      frame
      className={cn(
        "flex h-full flex-col rounded-[1.35rem] border border-stone-200/45 shadow-[0_2px_8px_rgba(15,23,42,0.025),0_22px_56px_-28px_rgba(15,23,42,0.09)] ring-1 ring-stone-900/[0.028]",
        emphasize &&
          "border-stone-200/50 shadow-[0_2px_8px_rgba(15,23,42,0.03),0_28px_64px_-24px_rgba(15,23,42,0.1)] ring-stone-900/[0.035]",
      )}
    >
      <div className="space-y-5 px-10 pb-12 pt-12 sm:px-12 sm:pt-14">
        <BlueprintLoadingLine className="w-28" />
        <div className="space-y-2.5 pt-2">
          <BlueprintLoadingLine className="h-[3px] w-[min(100%,14rem)] max-w-full" />
          <BlueprintLoadingLine className="w-36" />
        </div>
        <div className="space-y-2 pt-6">
          <BlueprintLoadingLine className="w-full max-w-[11rem]" />
          <BlueprintLoadingLine className="w-full max-w-[9rem]" />
        </div>
        <div className="pt-8">
          <div className="h-1.5 w-full max-w-[22rem] rounded-full bg-neutral-300/15 ring-1 ring-neutral-950/[0.04]" />
        </div>
      </div>
      <div
        className="mx-10 h-px bg-gradient-to-r from-transparent via-stone-200/45 to-transparent sm:mx-12"
        aria-hidden
      />
      <div className="flex items-start justify-between gap-6 px-10 pb-10 pt-9 sm:px-12">
        <div className="min-w-0 flex-1 space-y-3">
          <BlueprintLoadingLine className="w-[92%]" />
          <BlueprintLoadingLine className="w-[55%]" />
          <div className="pt-2">
            <div className="h-6 w-[5.5rem] rounded-full border border-neutral-200/70 bg-white/40" />
          </div>
          <BlueprintLoadingLine className="w-20 pt-2" />
          <BlueprintLoadingLine className="w-[88%]" />
        </div>
        <div className="h-9 w-[4.5rem] shrink-0 rounded-full border border-neutral-200/60 bg-white/30" />
      </div>
      <div className="border-t border-stone-100/90 px-10 py-8 sm:px-12">
        <div className="h-2 w-full max-w-md rounded-full bg-neutral-200/35" />
        <div className="mt-4 flex justify-between gap-4">
          <BlueprintLoadingLine className="w-16" />
          <BlueprintLoadingLine className="w-16" />
        </div>
      </div>
    </BlueprintLoadingSurface>
  );
}

export function DashboardPipelineSkeleton({ cards = 4 }: { cards?: number }) {
  const n = Math.max(1, Math.min(cards, 12));
  return (
    <ul className="grid gap-x-10 gap-y-12 lg:grid-cols-2 xl:gap-x-12 xl:gap-y-14">
      {Array.from({ length: n }).map((_, i) => (
        <li key={i}>
          <CardSkeletonBlock emphasize={i === 0} />
        </li>
      ))}
    </ul>
  );
}

/** Map geocode overlay — replaces spinner with linework panel. */
export function BlueprintMapGeocodeOverlay({
  title = "Locating properties…",
  subtitle = "Geocoding uses OpenStreetMap (rate-limited). Large pipelines load in batches.",
}: {
  title?: string;
  subtitle?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-10">
      <BlueprintLoadingSurface
        frame
        className="w-full max-w-sm rounded-2xl border border-stone-200/60 bg-stone-50/90 p-8 shadow-sm ring-1 ring-stone-900/[0.04]"
      >
        <div className="space-y-4 text-center">
          <div className="mx-auto space-y-2">
            <BlueprintLoadingLine className="mx-auto w-24" />
            <BlueprintLoadingLine className="mx-auto w-40" />
          </div>
          <p className="relative pt-2 text-sm font-medium tracking-tight text-neutral-800">
            {title}
          </p>
          <p className="relative text-xs leading-relaxed text-neutral-500">
            {subtitle}
          </p>
          <div className="relative mx-auto mt-5 grid w-full max-w-[200px] grid-cols-5 gap-2 pt-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <BlueprintLoadingLine key={i} className="w-full" />
            ))}
          </div>
        </div>
      </BlueprintLoadingSurface>
    </div>
  );
}
