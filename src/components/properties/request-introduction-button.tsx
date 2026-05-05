"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { submitIntroductionRequest } from "@/app/properties/introduction-request-actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UserRoleBadge } from "@/components/ui/user-role-badge";
import { cn } from "@/lib/utils";
import type { IntroductionPurpose, IntroductionTargetRole } from "@/types/introduction-request";

const TARGET_ROLES: { value: IntroductionTargetRole; label: string }[] = [
  { value: "developer", label: "Developer" },
  { value: "investor", label: "Investor" },
  { value: "broker", label: "Broker" },
  { value: "partner", label: "Partner" },
  { value: "acquisition_team", label: "Acquisition team" },
];

const PURPOSES: { value: IntroductionPurpose; label: string }[] = [
  { value: "explore_acquisition", label: "Explore acquisition" },
  { value: "explore_investment", label: "Explore investment" },
  { value: "explore_brokerage_marketing", label: "Explore brokerage / marketing" },
  { value: "discuss_partnership", label: "Discuss partnership" },
  { value: "general_inquiry", label: "General inquiry" },
];

type RequestIntroductionButtonProps = {
  propertyId: string;
  viewerRole?: string | null;
  className?: string;
  /** Visible label on the trigger (default: Request introduction). */
  triggerLabel?: string;
  disabled?: boolean;
};

export function RequestIntroductionButton({
  propertyId,
  viewerRole = null,
  className,
  triggerLabel = "Request introduction",
  disabled = false,
}: RequestIntroductionButtonProps) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [open, setOpen] = useState(false);
  const [targetRole, setTargetRole] = useState<IntroductionTargetRole | "">("");
  const [purpose, setPurpose] = useState<IntroductionPurpose | "">("");
  const [message, setMessage] = useState("");
  const [phase, setPhase] = useState<"form" | "success">("form");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const close = useCallback(() => {
    dialogRef.current?.close();
    setOpen(false);
    setPhase("form");
    setTargetRole("");
    setPurpose("");
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
    if (!targetRole) {
      setError("Choose who you’d like to connect with.");
      return;
    }
    if (!purpose) {
      setError("Choose a purpose for the introduction.");
      return;
    }
    const trimmed = message.trim();
    if (trimmed.length < 3) {
      setError("Add a short message (at least a few words).");
      return;
    }
    setPending(true);
    const res = await submitIntroductionRequest({
      propertyId,
      targetRole,
      purpose,
      message: trimmed,
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
          setTargetRole("");
          setPurpose("");
          setMessage("");
          setError(null);
          setOpen(true);
        }}
      >
        {triggerLabel}
      </Button>

      <dialog
        ref={dialogRef}
        className={cn(
          "fixed left-1/2 top-1/2 z-[200] w-[min(calc(100vw-1.5rem),32rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-stone-200/80 bg-white p-0",
          "shadow-[0_32px_80px_-24px_rgba(15,23,42,0.28)] ring-1 ring-stone-900/[0.06]",
          "[&::backdrop]:bg-stone-950/[0.42] [&::backdrop]:backdrop-blur-[3px]",
        )}
        aria-labelledby={titleId}
        onClose={close}
        onCancel={(ev) => {
          ev.preventDefault();
          close();
        }}
      >
        <div className="border-b border-stone-100/90 bg-gradient-to-br from-stone-50/90 via-white to-amber-50/20 px-6 py-6 sm:px-8">
          <p
            id={titleId}
            className="text-lg font-semibold tracking-[-0.02em] text-neutral-950"
          >
            {phase === "form" ? "Request introduction" : "Request received"}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-neutral-600">
            {phase === "form" ? (
              <>
                Aervara routes structured introduction requests around this
                opportunity—so the right developers, investors, brokers, and
                partners can connect with context.
              </>
            ) : (
              <>
                Your request is queued for review. We’ll use it to align
                parties around this site when there is a fit—this is not a
                guarantee of introduction or transaction.
              </>
            )}
          </p>
          {phase === "form" && viewerRole ? (
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-stone-200/50 pt-4">
              <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                Requesting as
              </span>
              <UserRoleBadge role={viewerRole} size="xs" />
            </div>
          ) : null}
        </div>

        {phase === "form" ? (
          <form onSubmit={handleSubmit} className="px-6 py-6 sm:px-8 sm:py-7">
            <fieldset className="space-y-2.5">
              <legend className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                Who do you want to connect with?
              </legend>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {TARGET_ROLES.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setTargetRole(value)}
                    aria-pressed={targetRole === value}
                    className={cn(
                      "rounded-xl border px-3.5 py-2.5 text-left text-sm font-medium transition-colors",
                      "border-stone-200/90 bg-stone-50/50 text-neutral-800 hover:border-stone-300 hover:bg-white",
                      targetRole === value &&
                        "border-neutral-900 bg-neutral-950 text-white shadow-sm",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset className="mt-7 space-y-2.5">
              <legend className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                Purpose of introduction
              </legend>
              <div className="flex flex-col gap-2">
                {PURPOSES.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setPurpose(value)}
                    aria-pressed={purpose === value}
                    className={cn(
                      "rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors",
                      "border-stone-200/90 bg-stone-50/40 text-neutral-800 hover:border-stone-300 hover:bg-white",
                      purpose === value &&
                        "border-neutral-900 bg-neutral-950 text-white shadow-sm",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="mt-7 space-y-2">
              <Label htmlFor="intro-request-msg" className="text-xs text-neutral-500">
                Short message
              </Label>
              <Textarea
                id="intro-request-msg"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                maxLength={2000}
                placeholder="Timing, mandate, or what a good introduction would look like…"
                className="resize-y text-sm"
              />
              <p className="text-[11px] text-neutral-400">
                {message.trim().length}/2000 · minimum 3 characters
              </p>
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
                {pending ? "Submitting…" : "Submit request"}
              </Button>
            </div>
          </form>
        ) : (
          <div className="px-6 py-9 text-center sm:px-8">
            {viewerRole ? (
              <div className="mb-5 flex justify-center">
                <UserRoleBadge role={viewerRole} size="sm" />
              </div>
            ) : null}
            <div
              className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-emerald-200/90 bg-emerald-50 text-emerald-800"
              aria-hidden
            >
              <svg
                className="h-6 w-6"
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
            <p className="mx-auto mt-5 max-w-sm text-sm leading-relaxed text-neutral-600">
              It’s stored securely for the Aervara team to review and route when
              there’s a fit—not a guarantee of introduction or transaction.
            </p>
            <Button type="button" className="mt-8 w-full sm:w-auto" onClick={close}>
              Done
            </Button>
          </div>
        )}
      </dialog>
    </>
  );
}
