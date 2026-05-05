import { cn } from "@/lib/utils";

/** Subtle pill for headers when `?demo=true` (server: pass `show` from cookie or page). */
export function DemoPreviewBadge({
  className,
  compact = false,
}: {
  className?: string;
  /** Tighter padding for nav bars. */
  compact?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full border border-sky-200/80 bg-sky-50/90 text-sky-950/90 shadow-sm",
        compact ? "px-2 py-0.5 text-[9px]" : "px-2.5 py-1 text-[10px]",
        "font-semibold uppercase tracking-[0.16em]",
        className,
      )}
      title="Public demo — browse only; billing flows and destructive changes are off."
    >
      Demo Preview
    </span>
  );
}
