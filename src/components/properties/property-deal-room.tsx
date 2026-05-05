import { UserRoleBadge } from "@/components/ui/user-role-badge";
import { cn } from "@/lib/utils";
import type { DealInterestIntent } from "@/types/deal-interest";

export type DealRoomInterestRow = {
  id: string;
  user_id: string;
  user_role: string | null;
  intent: DealInterestIntent;
  message: string | null;
  created_at: string;
};

const INTENT_LABEL: Record<DealInterestIntent, string> = {
  acquire: "Acquire",
  invest: "Invest",
  broker: "Broker",
  partner: "Partner",
};

function previewMessage(text: string | null, max = 100): string {
  if (!text?.trim()) return "—";
  const t = text.trim();
  return t.length <= max ? t : `${t.slice(0, max)}…`;
}

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

type PropertyDealRoomProps = {
  interests: DealRoomInterestRow[];
  className?: string;
  /** Omit outer card when nested inside Site Room section chrome. */
  embedded?: boolean;
};

function DealRoomBody({ interests }: { interests: DealRoomInterestRow[] }) {
  return (
    <>
      {interests.length === 0 ? (
        <p className="text-sm leading-relaxed text-neutral-500">
          No interest logged yet. Use{" "}
          <span className="font-medium text-neutral-700">
            Interested in this deal
          </span>{" "}
          in the header to record how you&apos;re thinking about this site.
        </p>
      ) : (
        <div className="overflow-x-auto border-t border-stone-200/50 pt-6">
          <table className="w-full min-w-[32rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-stone-200/60 text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-400">
                <th className="pb-3 pr-4 font-medium">Role</th>
                <th className="pb-3 pr-4 font-medium">Intent</th>
                <th className="pb-3 pr-4 font-medium">Note</th>
                <th className="pb-3 pl-2 text-right font-medium tabular-nums">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="text-neutral-800">
              {interests.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-stone-100/90 last:border-0"
                >
                  <td className="py-3.5 pr-4 align-top">
                    {row.user_role ? (
                      <UserRoleBadge role={row.user_role} size="xs" />
                    ) : (
                      <span className="text-xs font-medium text-neutral-400">
                        —
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 pr-4 align-top text-neutral-700">
                    {INTENT_LABEL[row.intent]}
                  </td>
                  <td className="max-w-[14rem] py-3.5 pr-4 align-top text-neutral-600">
                    <span className="line-clamp-2 leading-relaxed">
                      {previewMessage(row.message)}
                    </span>
                  </td>
                  <td className="whitespace-nowrap py-3.5 pl-2 text-right align-top text-xs tabular-nums text-neutral-500">
                    {formatWhen(row.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

export function PropertyDealRoom({
  interests,
  className,
  embedded = false,
}: PropertyDealRoomProps) {
  if (embedded) {
    return (
      <div className={cn("space-y-6", className)}>
        <DealRoomBody interests={interests} />
      </div>
    );
  }

  return (
    <section
      className={cn(
        "rounded-2xl border border-stone-200/55 bg-gradient-to-b from-stone-50/40 to-white/90 px-6 py-8 ring-1 ring-stone-900/[0.02] sm:px-8 sm:py-9",
        className,
      )}
      aria-labelledby="deal-room-heading"
    >
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
            Deal room
          </p>
          <h2
            id="deal-room-heading"
            className="mt-2 text-lg font-semibold tracking-tight text-neutral-950"
          >
            Interested parties
          </h2>
          <p className="mt-1.5 max-w-md text-sm leading-relaxed text-neutral-500">
            Inquiries show each party&apos;s professional role and intent—so you
            can see who is circling the opportunity.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <DealRoomBody interests={interests} />
      </div>
    </section>
  );
}
