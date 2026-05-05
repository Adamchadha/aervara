import {
  BlueprintLoadingLine,
  BlueprintLoadingSurface,
  DashboardPipelineSkeleton,
} from "@/components/states/blueprint-loading-surface";
import { cn } from "@/lib/utils";

/** @deprecated Use {@link DashboardPipelineSkeleton}; kept for import stability. */
export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  const cards = Math.max(2, Math.min(Math.ceil(rows / 2), 6));
  return <DashboardPipelineSkeleton cards={cards} />;
}

export function DashboardPageSkeleton() {
  return (
    <div className="space-y-10 lg:space-y-14">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <BlueprintLoadingSurface
          frame={false}
          className="max-w-lg rounded-xl border border-stone-200/50 p-6 ring-1 ring-stone-900/[0.03]"
        >
          <div className="space-y-3">
            <BlueprintLoadingLine className="h-[3px] w-44" />
            <BlueprintLoadingLine className="w-full max-w-xs" />
            <BlueprintLoadingLine className="w-56" />
          </div>
        </BlueprintLoadingSurface>
        <BlueprintLoadingSurface
          frame={false}
          className="h-11 w-full max-w-[200px] rounded-lg border border-stone-200/45 sm:shrink-0"
        />
      </div>
      <DashboardPipelineSkeleton cards={4} />
    </div>
  );
}

export function DetailSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-12 lg:space-y-16", className)}>
      <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1 space-y-5">
          <BlueprintLoadingSurface
            frame
            className="inline-block max-w-full rounded-lg border border-stone-200/45 px-5 py-4 ring-1 ring-stone-900/[0.025]"
          >
            <BlueprintLoadingLine className="w-32" />
            <div className="mt-5 space-y-2">
              <BlueprintLoadingLine className="h-[3px] w-full max-w-md" />
              <BlueprintLoadingLine className="w-36" />
            </div>
            <BlueprintLoadingLine className="mt-5 w-28" />
          </BlueprintLoadingSurface>
        </div>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:items-end">
          <BlueprintLoadingSurface
            frame={false}
            className="h-11 w-full max-w-[min(100%,280px)] rounded-xl border border-stone-200/45 sm:ml-auto"
          />
          <div className="flex flex-wrap justify-end gap-3">
            <BlueprintLoadingSurface
              frame={false}
              className="h-10 min-w-[140px] flex-1 rounded-lg border border-stone-200/40 sm:flex-initial"
            />
            <BlueprintLoadingSurface
              frame={false}
              className="h-10 w-24 rounded-lg border border-stone-200/40"
            />
          </div>
        </div>
      </div>

      <BlueprintLoadingSurface
        frame
        className="overflow-hidden rounded-[1.35rem] border border-stone-200/45 shadow-[0_2px_8px_rgba(15,23,42,0.025),0_32px_80px_-32px_rgba(15,23,42,0.11)] ring-1 ring-stone-900/[0.028]"
      >
        <div className="px-9 pb-12 pt-12 md:px-12 md:pb-14 md:pt-14">
          <BlueprintLoadingLine className="w-36" />
          <div className="mt-8 space-y-3">
            <BlueprintLoadingLine className="h-[4px] w-full max-w-xs" />
            <BlueprintLoadingLine className="w-full max-w-sm" />
          </div>
          <div className="mt-10 max-w-sm space-y-2">
            <div className="h-2 w-full rounded-full bg-neutral-200/40 ring-1 ring-neutral-950/[0.04]" />
            <div className="h-2 w-[72%] rounded-full bg-neutral-200/25" />
          </div>
        </div>
        <div
          className="mx-9 h-px bg-gradient-to-r from-transparent via-stone-200/40 to-transparent md:mx-12"
          aria-hidden
        />
        <div className="px-9 py-12 md:px-12 md:py-14">
          <BlueprintLoadingLine className="w-40" />
          <dl className="mt-8 grid max-w-3xl gap-6 sm:grid-cols-2 sm:gap-x-12">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-2.5">
                <BlueprintLoadingLine className="w-24" />
                <BlueprintLoadingLine className="h-[3px] w-28" />
              </div>
            ))}
          </dl>
          <div className="mt-12 max-w-xl space-y-4">
            <div className="h-px bg-gradient-to-r from-transparent via-stone-200/38 to-transparent" />
            <div className="h-2.5 w-full max-w-md rounded-full bg-neutral-200/35" />
            <div className="flex gap-6">
              <BlueprintLoadingLine className="w-20" />
              <BlueprintLoadingLine className="w-20" />
            </div>
          </div>
        </div>
      </BlueprintLoadingSurface>

      <BlueprintLoadingSurface
        frame
        className="rounded-[1.35rem] border border-stone-200/40 p-8 md:p-10"
      >
        <BlueprintLoadingLine className="w-48" />
        <div className="mt-4 space-y-2">
          <BlueprintLoadingLine className="w-full max-w-xl" />
          <BlueprintLoadingLine className="w-full max-w-lg" />
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <BlueprintLoadingLine className="w-32" />
              <BlueprintLoadingLine className="w-full" />
            </div>
          ))}
        </div>
      </BlueprintLoadingSurface>
    </div>
  );
}
