import type { DealTimelineItem } from "@/lib/deal-activity-timeline";

type DealActivityTimelineProps = {
  items: DealTimelineItem[];
};

function formatWhen(iso: string): string {
  try {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function DealActivityTimeline({ items }: DealActivityTimelineProps) {
  if (items.length === 0) {
    return (
      <p className="text-sm leading-relaxed text-neutral-500">
        No activity yet. Express interest, request introductions or meetings, plan a site visit,
        or add notes—events will appear here in order.
      </p>
    );
  }

  return (
    <ol className="space-y-0">
      {items.map((item, index) => (
        <li key={item.id} className="flex gap-4 pb-8 last:pb-0">
          <div className="flex w-5 shrink-0 flex-col items-center">
            <span
              className="mt-1.5 size-2.5 shrink-0 rounded-full border-2 border-white bg-neutral-900 shadow-sm ring-1 ring-stone-300/70"
              aria-hidden
            />
            {index < items.length - 1 ? (
              <span className="mt-2 min-h-[2.5rem] w-px flex-1 bg-stone-200/90" aria-hidden />
            ) : null}
          </div>
          <div className="min-w-0 pb-1">
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-neutral-400">
              {formatWhen(item.at)}
            </p>
            <p className="mt-1 text-sm font-semibold text-neutral-950">{item.title}</p>
            {item.subtitle ? (
              <p className="mt-1 text-sm leading-relaxed text-neutral-600">{item.subtitle}</p>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
