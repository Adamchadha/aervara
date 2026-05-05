"use client";

import { RequestFullAccessLink } from "@/components/navigation/request-full-access-link";
import { useCallback, useEffect, useId, useRef } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type UpgradeToProModalProps = {
  open: boolean;
  onClose: () => void;
  className?: string;
};

export function UpgradeToProModal({
  open,
  onClose,
  className,
}: UpgradeToProModalProps) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener("keydown", onKeyDown);
    closeRef.current?.focus();
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onKeyDown]);

  if (!open) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6",
        className,
      )}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <button
        type="button"
        className="absolute inset-0 bg-stone-950/40 backdrop-blur-[2px] transition-opacity"
        aria-label="Close"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md rounded-2xl border border-stone-200/70 bg-white p-8 shadow-[0_24px_64px_-24px_rgba(15,23,42,0.18),0_8px_24px_-8px_rgba(15,23,42,0.08)] ring-1 ring-stone-900/[0.04]">
        <button
          ref={closeRef}
          type="button"
          className="absolute right-4 top-4 rounded-lg px-2 py-1 text-sm text-neutral-400 transition-colors hover:bg-stone-100 hover:text-neutral-800"
          onClick={onClose}
        >
          Close
        </button>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
          Full access
        </p>
        <h2
          id={titleId}
          className="mt-2 pr-10 text-xl font-semibold tracking-tight text-neutral-950"
        >
          Unlock unlimited deal analysis
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-neutral-500">
          Remove the five-property cap, import CSVs in bulk, export deal PDFs, and use
          scenario modeling plus advanced deal intelligence on every parcel.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild>
            <RequestFullAccessLink onClick={onClose}>
              Request Full Access
            </RequestFullAccessLink>
          </Button>
          <Button type="button" variant="secondary" onClick={onClose}>
            Not now
          </Button>
        </div>
      </div>
    </div>
  );
}
