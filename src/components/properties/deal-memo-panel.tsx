import type { DealMemo } from "@/lib/deal-memo";
import { cn } from "@/lib/utils";

type DealMemoPanelProps = {
  memo: DealMemo;
  className?: string;
};

function Rule() {
  return (
    <div
      className="my-8 h-px bg-gradient-to-r from-transparent via-neutral-200/50 to-transparent"
      aria-hidden
    />
  );
}

export function DealMemoPanel({ memo, className }: DealMemoPanelProps) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-2xl border border-neutral-200/50 bg-gradient-to-b from-white via-white to-neutral-50/30 p-8 shadow-[0_20px_50px_-22px_rgba(15,23,42,0.08),0_2px_8px_rgba(15,23,42,0.03)] ring-1 ring-neutral-950/[0.035] md:p-10",
        className,
      )}
      aria-labelledby="deal-memo-heading"
    >
      <div className="flex items-start gap-4">
        <div
          className="mt-1 h-12 w-1 shrink-0 rounded-full bg-gradient-to-b from-neutral-800 to-neutral-600"
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <p
            id="deal-memo-heading"
            className="text-[11px] font-bold uppercase tracking-[0.26em] text-neutral-500"
          >
            Deal Memo
          </p>
          <h2 className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-400">
            Executive summary
          </h2>
          <p className="mt-3 max-w-3xl text-base leading-[1.65] text-neutral-700">
            {memo.executiveSummary}
          </p>
        </div>
      </div>

      <Rule />

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-12">
        <div>
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">
            Why it matters
          </h3>
          <ul className="mt-4 space-y-3">
            {memo.whyItMatters.map((item, i) => (
              <li
                key={`why-${i}`}
                className="border-l border-neutral-200/90 pl-4 text-sm leading-relaxed text-neutral-700"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">
            Key risks
          </h3>
          <ul className="mt-4 space-y-3">
            {memo.keyRisks.map((item, i) => (
              <li
                key={`risk-${i}`}
                className="border-l border-neutral-200/90 pl-4 text-sm leading-relaxed text-neutral-600"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-10 rounded-xl border border-neutral-200/60 bg-neutral-50/50 px-5 py-4 ring-1 ring-neutral-950/[0.03]">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-400">
          Suggested next step
        </p>
        <p className="mt-2 text-sm font-semibold tracking-tight text-neutral-950">
          {memo.suggestedNextStep}
        </p>
      </div>
    </section>
  );
}
