import { cn } from "@/lib/utils";

/**
 * Placeholder for future uploads (plans, surveys, comps, renders).
 */
export function SiteRoomFilesPlaceholder({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-dashed border-stone-200/80 bg-stone-50/35 px-6 py-10 text-center",
        className,
      )}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">
        Coming soon
      </p>
      <p className="mt-2 text-sm font-medium text-neutral-800">
        Plans, surveys & visuals
      </p>
      <p className="mx-auto mt-2 max-w-sm text-xs leading-relaxed text-neutral-500">
        You&apos;ll be able to attach zoning PDFs, massing sketches, comp sets,
        and marketing renders to this Site Room—everything in one place for
        the deal team.
      </p>
    </div>
  );
}
