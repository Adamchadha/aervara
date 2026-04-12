import { cn } from "@/lib/utils";

export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
      <div className="h-10 animate-pulse bg-neutral-100" />
      <div className="divide-y divide-neutral-100">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="flex h-12 items-center gap-4 px-4"
          >
            <div className="h-3 flex-1 animate-pulse rounded bg-neutral-100" />
            <div className="h-3 w-20 animate-pulse rounded bg-neutral-100" />
            <div className="h-3 w-24 animate-pulse rounded bg-neutral-100" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function DetailSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-8", className)}>
      <div className="h-8 w-48 animate-pulse rounded-md bg-neutral-200" />
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-3 w-24 animate-pulse rounded bg-neutral-200" />
            <div className="h-10 w-full animate-pulse rounded-md bg-neutral-100" />
          </div>
        ))}
      </div>
    </div>
  );
}
