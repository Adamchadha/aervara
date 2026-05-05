import type { ReactNode } from "react";
import { UserRoleBadge } from "@/components/ui/user-role-badge";
import { cn } from "@/lib/utils";
import type { DealRoomInterestRow } from "@/components/properties/property-deal-room";
import type {
  IntroductionPurpose,
  IntroductionRequestRow,
  IntroductionRequestStatus,
  IntroductionTargetRole,
} from "@/types/introduction-request";
import type { DealInterestIntent } from "@/types/deal-interest";

const TARGET_LABEL: Record<IntroductionTargetRole, string> = {
  developer: "Developer",
  investor: "Investor",
  broker: "Broker",
  partner: "Partner",
  acquisition_team: "Acquisition team",
};

const PURPOSE_LABEL: Record<IntroductionPurpose, string> = {
  explore_acquisition: "Explore acquisition",
  explore_investment: "Explore investment",
  explore_brokerage_marketing: "Explore brokerage / marketing",
  discuss_partnership: "Discuss partnership",
  general_inquiry: "General inquiry",
};

const INTENT_LABEL: Record<DealInterestIntent, string> = {
  acquire: "Acquire",
  invest: "Invest",
  broker: "Broker",
  partner: "Partner",
};

const STATUS_INTRO: Record<
  IntroductionRequestStatus,
  { label: string; className: string }
> = {
  new: {
    label: "New",
    className:
      "border-sky-200/90 bg-sky-50/90 text-sky-900 ring-sky-900/[0.06]",
  },
  reviewed: {
    label: "Reviewed",
    className:
      "border-amber-200/90 bg-amber-50/80 text-amber-950 ring-amber-950/[0.05]",
  },
  connected: {
    label: "Connected",
    className:
      "border-emerald-200/90 bg-emerald-50/90 text-emerald-950 ring-emerald-950/[0.05]",
  },
  closed: {
    label: "Closed",
    className:
      "border-stone-200/90 bg-stone-100/80 text-stone-700 ring-stone-900/[0.04]",
  },
};

function previewMessage(text: string | null, max = 120): string {
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

function StatusPill({
  label,
  className,
}: {
  label: string;
  className: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] ring-1",
        className,
      )}
    >
      {label}
    </span>
  );
}

function ActivityCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "aervara-elevate-card rounded-2xl border border-stone-200/70 bg-white/90 p-5 shadow-[0_1px_0_rgba(255,255,255,0.8)_inset,0_8px_28px_-18px_rgba(15,23,42,0.12)]",
        "ring-1 ring-stone-900/[0.025]",
        className,
      )}
    >
      {children}
    </article>
  );
}

type SiteRoomOpportunityHubProps = {
  currentUserId: string;
  introductionRequests: IntroductionRequestRow[];
  dealInterests: DealRoomInterestRow[];
  className?: string;
};

export function SiteRoomOpportunityHub({
  currentUserId,
  introductionRequests,
  dealInterests,
  className,
}: SiteRoomOpportunityHubProps) {
  return (
    <div className={cn("space-y-14", className)}>
      <section
        id="connection-requests"
        aria-labelledby="connection-requests-heading"
        className="scroll-mt-24 space-y-6"
      >
        <div className="flex flex-col gap-1 border-b border-stone-200/60 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
              Aervara routing
            </p>
            <h3
              id="connection-requests-heading"
              className="mt-2 text-lg font-semibold tracking-tight text-neutral-950"
            >
              Connection requests
            </h3>
            <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-neutral-500">
              Introductions you&apos;ve asked us to facilitate on this
              opportunity—status reflects internal review, not a transaction
              outcome.
            </p>
          </div>
        </div>

        {introductionRequests.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-stone-200/80 bg-stone-50/40 px-5 py-8 text-center text-sm leading-relaxed text-neutral-500">
            No connection requests yet. Use{" "}
            <span className="font-medium text-neutral-700">
              Request introduction
            </span>{" "}
            in the header to start a structured intro around this site.
          </p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
            {introductionRequests.map((row) => {
              const st = STATUS_INTRO[row.status] ?? STATUS_INTRO.new;
              return (
                <li key={row.id}>
                  <ActivityCard>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-400">
                          Intro target
                        </p>
                        <p className="mt-1 text-base font-semibold tracking-tight text-neutral-950">
                          {TARGET_LABEL[row.target_role]}
                        </p>
                      </div>
                      <StatusPill label={st.label} className={st.className} />
                    </div>
                    <p className="mt-3 text-sm text-neutral-600">
                      <span className="font-medium text-neutral-800">
                        Purpose:{" "}
                      </span>
                      {PURPOSE_LABEL[row.purpose]}
                    </p>
                    <p className="mt-3 border-t border-stone-100/90 pt-3 text-sm leading-relaxed text-neutral-600">
                      {previewMessage(row.message)}
                    </p>
                    <p className="mt-4 text-right text-[11px] tabular-nums text-neutral-400">
                      {formatWhen(row.created_at)}
                    </p>
                  </ActivityCard>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section
        id="interested-parties"
        aria-labelledby="interested-parties-heading"
        className="scroll-mt-24 space-y-6 border-t border-stone-200/50 pt-12"
      >
        <div className="flex flex-col gap-1 border-b border-stone-200/60 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
              Deal room
            </p>
            <h3
              id="interested-parties-heading"
              className="mt-2 text-lg font-semibold tracking-tight text-neutral-950"
            >
              Interested parties
            </h3>
            <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-neutral-500">
              Who has signaled intent on this parcel—role, direction, and a
              short note when provided.
            </p>
          </div>
        </div>

        {dealInterests.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-stone-200/80 bg-stone-50/40 px-5 py-8 text-center text-sm leading-relaxed text-neutral-500">
            No deal-interest signals yet. Use{" "}
            <span className="font-medium text-neutral-700">
              Interested in this deal
            </span>{" "}
            in the header to log how you&apos;re approaching this site.
          </p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
            {dealInterests.map((row) => {
              const isSelf = row.user_id === currentUserId;
              return (
                <li key={row.id}>
                  <ActivityCard>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-400">
                          Participant
                        </p>
                        <p className="mt-1 text-base font-semibold tracking-tight text-neutral-950">
                          {isSelf ? "You" : "Collaborator"}
                        </p>
                      </div>
                      <StatusPill
                        label="Recorded"
                        className="border-stone-200/90 bg-stone-50 text-stone-700 ring-stone-900/[0.04]"
                      />
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      {row.user_role ? (
                        <UserRoleBadge role={row.user_role} size="xs" />
                      ) : (
                        <span className="text-xs text-neutral-400">Role —</span>
                      )}
                      <span className="text-neutral-300" aria-hidden>
                        ·
                      </span>
                      <span className="text-sm font-medium text-neutral-800">
                        {INTENT_LABEL[row.intent]}
                      </span>
                    </div>
                    <p className="mt-3 border-t border-stone-100/90 pt-3 text-sm leading-relaxed text-neutral-600">
                      {previewMessage(row.message)}
                    </p>
                    <p className="mt-4 text-right text-[11px] tabular-nums text-neutral-400">
                      {formatWhen(row.created_at)}
                    </p>
                  </ActivityCard>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
