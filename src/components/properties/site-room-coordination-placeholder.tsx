import { cn } from "@/lib/utils";

const SUGGESTIONS = [
  "Align on entitlement assumptions before soft costs move.",
  "Share this Site Room with capital partners for a consistent read.",
  "Book a walk-through when the envelope story needs a site visit.",
];

export function SiteRoomCoordinationPlaceholder({
  className,
}: {
  className?: string;
}) {
  return (
    <div className={cn("space-y-6", className)}>
      <ul className="space-y-3 text-sm leading-relaxed text-neutral-600">
        {SUGGESTIONS.map((line) => (
          <li key={line} className="flex gap-3">
            <span
              className="mt-2 h-1 w-1 shrink-0 rounded-full bg-neutral-400"
              aria-hidden
            />
            <span>{line}</span>
          </li>
        ))}
      </ul>
      <p className="rounded-lg border border-stone-100/90 bg-stone-50/50 px-4 py-3 text-xs leading-relaxed text-neutral-500">
        Calendar invites and threaded comments are on the roadmap—this block
        is your coordination anchor for now.
      </p>
    </div>
  );
}
