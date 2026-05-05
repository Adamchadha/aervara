import { cn } from "@/lib/utils";
import { type DealDecision } from "@/lib/deal-decision";
import {
  opportunityPriorityLabel,
  type OpportunityPriorityLabel,
} from "@/lib/opportunity-score";

function priorityBadgeClass(label: OpportunityPriorityLabel): string {
  if (label === "High Priority") return "border-emerald-200 bg-emerald-50 text-emerald-900";
  if (label === "Strong") return "border-stone-200 bg-stone-50 text-neutral-800";
  if (label === "Moderate") return "border-stone-200 bg-stone-50 text-neutral-700";
  return "border-stone-200 bg-stone-50 text-neutral-700";
}

type DealDecisionPanelProps = {
  decision: DealDecision;
  opportunityScore: number;
};

export function DealDecisionPanel({
  decision,
  opportunityScore,
}: DealDecisionPanelProps) {
  const priority = opportunityPriorityLabel(opportunityScore);
  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,32%)]">
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-neutral-400">
          Recommendation
        </p>
        <h3 className="mt-2 text-[1.55rem] font-semibold leading-[1.18] tracking-[-0.03em] text-neutral-950">
          {decision.recommendedPlay}
        </h3>
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
              Why This Works
            </p>
            <ul className="mt-3 space-y-2.5 text-sm leading-relaxed text-neutral-650">
              {decision.whyThisWorks.map((line) => (
                <li key={line} className="flex gap-2">
                  <span className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-neutral-400" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
              Key Risks
            </p>
            <ul className="mt-3 space-y-2.5 text-sm leading-relaxed text-neutral-650">
              {decision.keyRisks.map((line) => (
                <li key={line} className="flex gap-2">
                  <span className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-neutral-400" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <aside className="rounded-2xl bg-gradient-to-b from-stone-50/75 to-white px-5 py-5 shadow-[0_1px_0_rgba(255,255,255,0.8)_inset,0_16px_40px_-30px_rgba(15,23,42,0.16)] ring-1 ring-stone-900/[0.05]">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
          Opportunity Score
        </p>
        <p className="mt-2 text-5xl font-semibold tracking-[-0.03em] text-neutral-950">
          {Math.round(opportunityScore)}
        </p>
        <span
          className={cn(
            "mt-3 inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]",
            priorityBadgeClass(priority),
          )}
        >
          {priority}
        </span>

        <div className="mt-5 border-t border-stone-200/70 pt-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
            Next Move
          </p>
          <p className="mt-2 text-sm leading-relaxed text-neutral-700">
            {decision.nextMove}
          </p>
        </div>
      </aside>
    </div>
  );
}
