"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { RequestFullAccessLink } from "@/components/navigation/request-full-access-link";
import { submitDealConciergeRequest } from "@/app/properties/deal-concierge-request-actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type {
  DealConciergeConnectionType,
  DealConciergeRequesterRole,
  DealConciergeUrgency,
} from "@/types/deal-concierge-request";

const ROLES: { value: DealConciergeRequesterRole; label: string }[] = [
  { value: "developer", label: "Developer" },
  { value: "investor", label: "Investor" },
  { value: "broker", label: "Broker" },
  { value: "partner", label: "Partner" },
  { value: "acquisition_team", label: "Acquisition team" },
  { value: "other", label: "Other" },
];

const CONNECTION: { value: DealConciergeConnectionType; label: string; hint: string }[] =
  [
    { value: "call", label: "Call", hint: "A focused phone conversation" },
    { value: "meeting", label: "Meeting", hint: "In person or video" },
    { value: "intro", label: "Warm intro", hint: "Curated email or mutual connect" },
  ];

const URGENCY: { value: DealConciergeUrgency; label: string }[] = [
  { value: "low", label: "Exploratory" },
  { value: "standard", label: "Active" },
  { value: "high", label: "Time-sensitive" },
];

type DealConciergeSectionProps = {
  propertyId: string;
  className?: string;
  /** Pro Preview / demo — no outbound requests. */
  readOnly?: boolean;
};

export function DealConciergeSection({
  propertyId,
  className,
  readOnly = false,
}: DealConciergeSectionProps) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [open, setOpen] = useState(false);
  const [requesterRole, setRequesterRole] = useState<DealConciergeRequesterRole | "">("");
  const [intent, setIntent] = useState("");
  const [connectionType, setConnectionType] = useState<DealConciergeConnectionType | "">("");
  const [urgency, setUrgency] = useState<DealConciergeUrgency | "">("");
  const [message, setMessage] = useState("");
  const [phase, setPhase] = useState<"form" | "success">("form");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  if (readOnly) {
    return (
      <div
        className={cn(
          "rounded-2xl border border-stone-200/60 bg-stone-50/40 px-6 py-6 text-sm leading-relaxed text-neutral-600",
          className,
        )}
      >
        <p className="font-medium text-neutral-800">Concierge (preview)</p>
        <p className="mt-2">
          Curated introduction requests are disabled in Pro Preview. In production,
          Aervara routes structured asks to the right counterparties around this parcel.
        </p>
        <Button asChild variant="secondary" className="mt-4 rounded-xl">
          <RequestFullAccessLink returnToPath={`/properties/${propertyId}`}>
            Request full access
          </RequestFullAccessLink>
        </Button>
      </div>
    );
  }

  const close = useCallback(() => {
    dialogRef.current?.close();
    setOpen(false);
    setPhase("form");
    setRequesterRole("");
    setIntent("");
    setConnectionType("");
    setUrgency("");
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
    if (!requesterRole) {
      setError("Select the role that best describes you for this request.");
      return;
    }
    const intentTrim = intent.trim();
    if (intentTrim.length < 10) {
      setError("Briefly describe what you’re looking for (at least a sentence or two).");
      return;
    }
    if (!connectionType) {
      setError("Choose how you’d prefer to connect.");
      return;
    }
    if (!urgency) {
      setError("Select how time-sensitive this is.");
      return;
    }
    setPending(true);
    const res = await submitDealConciergeRequest({
      propertyId,
      requesterRole,
      intent: intentTrim,
      connectionType,
      urgency,
      message: message.trim(),
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
    <div
      className={cn(
        "rounded-[1.15rem] border border-stone-200/55 bg-gradient-to-br from-white via-stone-50/30 to-amber-50/[0.12]",
        "p-8 shadow-[0_2px_12px_rgba(15,23,42,0.04),0_24px_64px_-40px_rgba(15,23,42,0.1)] ring-1 ring-stone-900/[0.03] sm:p-10",
        className,
      )}
    >
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between lg:gap-12">
        <div className="min-w-0 max-w-xl space-y-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-900/55">
            Deal Concierge
          </p>
          <h3 className="text-xl font-semibold tracking-[-0.02em] text-neutral-950 sm:text-[1.35rem]">
            Aervara connects the right people around this site
          </h3>
          <p className="text-sm leading-relaxed text-neutral-600">
            Beyond the model and memo, we can help you meet relevant developers, investors,
            brokers, or partners—curated and structured around real opportunities on this
            parcel, not bulk intros.
          </p>
          <p className="text-sm leading-relaxed text-neutral-500">
            Think of Aervara as a discreet intermediary: we read context from your Site Room
            and align conversations when there is mutual fit. No spam, no open lists—just
            intentional routing.
          </p>
        </div>
        <div className="shrink-0 lg:pt-1">
          <Button
            type="button"
            className={cn(
              "h-11 min-w-[14rem] rounded-xl px-6 text-sm font-semibold shadow-sm",
              "bg-neutral-950 text-white hover:bg-neutral-900",
            )}
            onClick={() => {
              setPhase("form");
              setRequesterRole("");
              setIntent("");
              setConnectionType("");
              setUrgency("");
              setMessage("");
              setError(null);
              setOpen(true);
            }}
          >
            Request Aervara Introduction
          </Button>
        </div>
      </div>

      <dialog
        ref={dialogRef}
        className={cn(
          "fixed left-1/2 top-1/2 z-[200] w-[min(calc(100vw-1.5rem),34rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-stone-200/80 bg-white p-0",
          "shadow-[0_32px_88px_-28px_rgba(15,23,42,0.32)] ring-1 ring-stone-900/[0.06]",
          "[&::backdrop]:bg-stone-950/[0.45] [&::backdrop]:backdrop-blur-[4px]",
        )}
        aria-labelledby={titleId}
        onClose={close}
        onCancel={(ev) => {
          ev.preventDefault();
          close();
        }}
      >
        <div className="border-b border-stone-100/90 bg-gradient-to-br from-stone-50/95 via-white to-amber-50/[0.18] px-6 py-6 sm:px-8">
          <p
            id={titleId}
            className="text-lg font-semibold tracking-[-0.02em] text-neutral-950"
          >
            {phase === "form" ? "Request Aervara Introduction" : "Request received"}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-neutral-600">
            {phase === "form" ? (
              <>
                Share how you’d like to engage. Our team reviews each request against this
                opportunity—introductions are selective and context-led.
              </>
            ) : (
              <>
                Thank you. Your request is on file for this property. We’ll reach out only
                when there is a credible match—never as a mass blast.
              </>
            )}
          </p>
        </div>

        {phase === "form" ? (
          <form
            onSubmit={handleSubmit}
            className="max-h-[min(70vh,calc(100vh-8rem))] overflow-y-auto px-6 py-6 sm:px-8 sm:py-7"
          >
            <fieldset className="space-y-2.5">
              <legend className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                Your role
              </legend>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {ROLES.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRequesterRole(value)}
                    aria-pressed={requesterRole === value}
                    className={cn(
                      "rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition-colors",
                      "border-stone-200/90 bg-stone-50/40 text-neutral-800 hover:border-stone-300 hover:bg-white",
                      requesterRole === value &&
                        "border-neutral-900 bg-neutral-950 text-white shadow-sm",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="mt-6 space-y-2">
              <Label htmlFor="deal-concierge-intent" className="text-xs text-neutral-500">
                What are you looking for?
              </Label>
              <Textarea
                id="deal-concierge-intent"
                value={intent}
                onChange={(e) => setIntent(e.target.value)}
                rows={4}
                maxLength={4000}
                placeholder="e.g. Joint venture for multifamily, LP for ground-up, disposition support…"
                className="resize-y text-sm"
              />
              <p className="text-[11px] text-neutral-400">
                {intent.trim().length}/4000 · be specific; this is your primary intent
              </p>
            </div>

            <fieldset className="mt-7 space-y-3">
              <legend className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                Preferred connection type
              </legend>
              <div className="flex flex-col gap-2">
                {CONNECTION.map(({ value, label, hint }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setConnectionType(value)}
                    aria-pressed={connectionType === value}
                    className={cn(
                      "rounded-xl border px-4 py-3 text-left transition-colors",
                      "border-stone-200/90 bg-stone-50/30 hover:border-stone-300 hover:bg-white",
                      connectionType === value &&
                        "border-neutral-900 bg-neutral-950 text-white shadow-sm",
                    )}
                  >
                    <span className="block text-sm font-semibold">{label}</span>
                    <span
                      className={cn(
                        "mt-0.5 block text-xs",
                        connectionType === value ? "text-stone-300" : "text-neutral-500",
                      )}
                    >
                      {hint}
                    </span>
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset className="mt-7 space-y-2.5">
              <legend className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                Urgency
              </legend>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {URGENCY.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setUrgency(value)}
                    aria-pressed={urgency === value}
                    className={cn(
                      "rounded-xl border px-3 py-2.5 text-center text-sm font-medium transition-colors",
                      "border-stone-200/90 bg-stone-50/40 text-neutral-800 hover:border-stone-300 hover:bg-white",
                      urgency === value &&
                        "border-neutral-900 bg-neutral-950 text-white shadow-sm",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="mt-7 space-y-2">
              <Label htmlFor="deal-concierge-msg" className="text-xs text-neutral-500">
                Short message <span className="font-normal text-neutral-400">(optional)</span>
              </Label>
              <Textarea
                id="deal-concierge-msg"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                maxLength={2000}
                placeholder="Timing, constraints, or anything else we should know…"
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
                {pending ? "Submitting…" : "Submit request"}
              </Button>
            </div>
          </form>
        ) : (
          <div className="px-6 py-10 text-center sm:px-8">
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
              Your concierge request is tied to this property and your account. We review
              each submission individually.
            </p>
            <Button type="button" className="mt-8 w-full sm:w-auto" onClick={close}>
              Done
            </Button>
          </div>
        )}
      </dialog>
    </div>
  );
}
