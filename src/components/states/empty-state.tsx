import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-stone-200/75 bg-gradient-to-b from-white to-stone-50/40 px-10 py-24 text-center shadow-[0_2px_8px_rgba(15,23,42,0.03),0_28px_72px_-32px_rgba(15,23,42,0.09)] ring-1 ring-stone-900/[0.028]",
        className,
      )}
    >
      <p className="text-base font-semibold tracking-tight text-neutral-950">
        {title}
      </p>
      <p className="mt-3 max-w-md text-[0.9375rem] font-normal leading-relaxed text-neutral-500">
        {description}
      </p>
      {action ? <div className="mt-8">{action}</div> : null}
    </div>
  );
}
