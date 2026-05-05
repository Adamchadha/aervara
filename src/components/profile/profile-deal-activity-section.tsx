import Link from "next/link";
import { DealActivityTimeline } from "@/components/properties/deal-activity-timeline";
import {
  normalizePropertyStatus,
  propertyStatusBadgeClass,
} from "@/lib/property-status";
import type { DealTimelineItem } from "@/lib/deal-activity-timeline";
import { cn } from "@/lib/utils";

type PropertyMini = {
  id: string;
  address: string;
  city: string;
  state: string;
  status: string | null;
};

type ProfileDealActivitySectionProps = {
  savedProperties: PropertyMini[];
  priorityProperties: PropertyMini[];
  introductionsRequested: number;
  meetingsRequested: number;
  siteVisitsPlanned: number;
  timeline: DealTimelineItem[];
};

function StatPill({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-stone-200/80 bg-white px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
        {label}
      </p>
      <p className="mt-1 text-lg font-semibold tracking-tight text-neutral-900">
        {value}
      </p>
    </div>
  );
}

function PropertyList({
  title,
  empty,
  items,
}: {
  title: string;
  empty: string;
  items: PropertyMini[];
}) {
  return (
    <section className="rounded-xl border border-stone-200/80 bg-white p-4 sm:p-5">
      <h3 className="text-sm font-semibold text-neutral-900">{title}</h3>
      {items.length === 0 ? (
        <p className="mt-2 text-sm text-neutral-500">{empty}</p>
      ) : (
        <ul className="mt-3 space-y-2.5">
          {items.map((p) => {
            const status = normalizePropertyStatus(p.status);
            return (
              <li key={p.id} className="rounded-lg border border-stone-100 bg-stone-50/50 px-3 py-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <Link
                      href={`/properties/${p.id}`}
                      className="block truncate text-sm font-medium text-neutral-900 hover:underline"
                    >
                      {p.address}
                    </Link>
                    <p className="text-xs text-neutral-500">
                      {p.city}, {p.state}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em]",
                      propertyStatusBadgeClass(status),
                    )}
                  >
                    {status}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

export function ProfileDealActivitySection({
  savedProperties,
  priorityProperties,
  introductionsRequested,
  meetingsRequested,
  siteVisitsPlanned,
  timeline,
}: ProfileDealActivitySectionProps) {
  return (
    <section className="mt-14 rounded-2xl border border-stone-200/70 bg-gradient-to-br from-white via-stone-50/35 to-white p-6 shadow-[0_2px_12px_rgba(15,23,42,0.04)] ring-1 ring-stone-900/[0.02] sm:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
            Deal Activity
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-neutral-950">
            Your account hub
          </h2>
          <p className="mt-1 text-sm text-neutral-500">
            Live signal of what you are actively working on across properties.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <StatPill label="Introductions requested" value={introductionsRequested} />
        <StatPill label="Meetings requested" value={meetingsRequested} />
        <StatPill label="Site visits planned" value={siteVisitsPlanned} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <PropertyList
          title="Saved / watched properties"
          empty="No properties yet."
          items={savedProperties}
        />
        <PropertyList
          title="Marked priority"
          empty="No priority properties yet."
          items={priorityProperties}
        />
      </div>

      <div className="mt-6 rounded-xl border border-stone-200/80 bg-white p-4 sm:p-5">
        <h3 className="text-sm font-semibold text-neutral-900">Recent activity timeline</h3>
        <div className="mt-4">
          <DealActivityTimeline items={timeline} />
        </div>
      </div>
    </section>
  );
}
