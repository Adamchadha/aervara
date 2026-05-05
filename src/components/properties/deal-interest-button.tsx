"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { submitDealInterest } from "@/app/properties/deal-interest-actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UserRoleBadge } from "@/components/ui/user-role-badge";
import { cn } from "@/lib/utils";
import { formatUserRoleLabel } from "@/lib/user-role-display";
import type { DealInterestIntent } from "@/types/deal-interest";

const INTENTS: { value: DealInterestIntent; label: string }[] = [
  { value: "acquire", label: "I want to acquire this" },
  { value: "invest", label: "I want to invest in this" },
  { value: "broker", label: "I want to broker this" },
  { value: "partner", label: "I want to partner on this" },
];

type DealInterestButtonProps = {
  propertyId: string;
  /** Signed-in viewer role (from profile / metadata) — shown in dialog. */
  viewerRole?: string | null;
  className?: string;
  disabled?: boolean;
};

export function DealInterestButton({
  propertyId,
  viewerRole = null,
  className,
  disabled = false,
}: DealInterestButtonProps) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [open, setOpen] = useState(false);
  const [intent, setIntent] = useState<DealInterestIntent | "">("");
  const [message, setMessage] = useState("");
  const [phase, setPhase] = useState<"form" | "success">("form");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const close = useCallback(() => {
    dialogRef.current?.close();
    setOpen(false);
    setPhase("form");
    setIntent("");
    setMessage("");
    setError(null);
  }, []);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open) {
      el.showModal();
    } else {
      el.close();
    }
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!intent) {
      setError("Choose how you’re thinking about this deal.");
      return;
    }
    setPending(true);
    const res = await submitDealInterest({
      propertyId,
      intent,
      message: message.trim() === "" ? null : message.trim(),
    });
    setPending(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setPhase("success");
    router.refresh();
  }

  return (
    <>
      <Button
        type="button"
        variant="secondary"
        disabled={disabled}
        title={disabled ? "Disabled in Pro Preview" : undefined}
        className={cn(
          "h-10 border-stone-200/80 bg-white px-4 text-sm font-semibold shadow-sm ring-1 ring-stone-900/[0.04] hover:bg-stone-50",
          disabled && "opacity-50",
          className,
        )}
        onClick={() => {
          if (disabled) return;
          setPhase("form");
          setIntent("");
          setMessage("");
          setError(null);
          setOpen(true);
        }}
      >
        Interested in this deal
      </Button>

      <dialog
        ref={dialogRef}
        className="fixed left-1/2 top-1/2 z-[200] w-[min(calc(100vw-2rem),26rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-stone-200/70 bg-white p-0 shadow-[0_24px_64px_-20px_rgba(15,23,42,0.2)] ring-1 ring-stone-900/[0.05]"
        aria-labelledby={titleId}
        onClose={close}
        onCancel={(ev) => {
          ev.preventDefault();
          close();
        }}
      >
        <div className="border-b border-stone-100 px-6 py-5 sm:px-7">
          <p
            id={titleId}
            className="text-base font-semibold tracking-tight text-neutral-950"
          >
            {phase === "form" ? "Deal interest" : "Interest recorded"}
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-neutral-500">
            {phase === "form"
              ? "Share how you’re approaching this site. We’ll use this to shape collaboration and deal flow."
              : viewerRole
                ? `Thanks—your signal is saved as ${formatUserRoleLabel(viewerRole)}. We’ll use these responses to connect the right people around opportunities.`
                : "Thanks—your signal is saved. We’ll use these responses to connect the right people around opportunities."}
          </p>
          {phase === "form" && viewerRole ? (
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-stone-100/90 pt-4">
              <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                Inquiring as
              </span>
              <UserRoleBadge role={viewerRole} size="xs" />
            </div>
          ) : null}
        </div>

        {phase === "form" ? (
          <form onSubmit={handleSubmit} className="px-6 py-6 sm:px-7 sm:py-7">
            <fieldset className="space-y-2.5">
              <legend className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                Your intent
              </legend>
              <div className="flex flex-col gap-2">
                {INTENTS.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setIntent(value)}
                    aria-pressed={intent === value}
                    className={cn(
                      "rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors",
                      "border-stone-200/80 bg-stone-50/40 text-neutral-800 hover:border-stone-300 hover:bg-white",
                      intent === value &&
                        "border-neutral-900 bg-neutral-950 text-white shadow-sm",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="mt-6 space-y-2">
              <Label htmlFor="deal-interest-msg" className="text-xs text-neutral-500">
                Optional message
              </Label>
              <Textarea
                id="deal-interest-msg"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                maxLength={2000}
                placeholder="Context, timing, or how you’d like to connect…"
                className="resize-y text-sm"
              />
            </div>

            {error ? (
              <p className="mt-4 text-sm text-red-600" role="alert">
                {error}
              </p>
            ) : null}

            <div className="mt-8 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
              <Button
                type="button"
                variant="ghost"
                className="text-neutral-600"
                disabled={pending}
                onClick={close}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? "Sending…" : "Submit interest"}
              </Button>
            </div>
          </form>
        ) : (
          <div className="px-6 py-8 text-center sm:px-7">
            {viewerRole ? (
              <div className="mb-5 flex justify-center">
                <UserRoleBadge role={viewerRole} size="sm" />
              </div>
            ) : null}
            <div
              className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border border-emerald-200/80 bg-emerald-50/90 text-emerald-800"
              aria-hidden
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <Button type="button" className="mt-8 w-full sm:w-auto" onClick={close}>
              Done
            </Button>
          </div>
        )}
      </dialog>
    </>
  );
}
