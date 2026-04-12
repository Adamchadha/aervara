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
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-200/90 bg-white px-8 py-20 text-center shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-neutral-950/[0.03]",
        className,
      )}
    >
      <p className="text-sm font-medium text-neutral-950">{title}</p>
      <p className="mt-2 max-w-sm text-sm text-neutral-500">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
