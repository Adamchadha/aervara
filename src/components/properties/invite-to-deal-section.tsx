"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { RequestFullAccessLink } from "@/components/navigation/request-full-access-link";
import { useRouter } from "next/navigation";
import { submitDealInvite } from "@/app/properties/deal-invite-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { DealInviteRole } from "@/types/deal-invite";

const ROLES: { value: DealInviteRole; label: string }[] = [
  { value: "investor", label: "Investor" },
  { value: "developer", label: "Developer" },
  { value: "broker", label: "Broker" },
];

type InviteToDealSectionProps = {
  propertyId: string;
  className?: string;
  readOnly?: boolean;
};

export function InviteToDealSection({
  propertyId,
  className,
  readOnly = false,
}: InviteToDealSectionProps) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<DealInviteRole | "">("");
  const [message, setMessage] = useState("");
  const [simulateSend, setSimulateSend] = useState(true);
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
        <p className="font-medium text-neutral-800">Invite to Deal (preview)</p>
        <p className="mt-2">
          Invites are not sent in Pro Preview. In production, stored invites help you
          loop in investors, developers, and brokers around this opportunity.
        </p>
        <Button asChild variant="secondary" className="mt-4 rounded-xl">
          <RequestFullAccessLink returnToPath={`/properties/${propertyId}`}>
            Join waitlist
          </RequestFullAccessLink>
        </Button>
      </div>
    );
  }

  const close = useCallback(() => {
    dialogRef.current?.close();
    setOpen(false);
    setPhase("form");
    setEmail("");
    setRole("");
    setMessage("");
    setSimulateSend(true);
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
    if (!role) {
      setError("Choose how you’re framing this invite.");
      return;
    }
    setPending(true);
    const res = await submitDealInvite({
      propertyId,
      inviteeEmail: email,
      inviteeRole: role,
      message: message.trim() === "" ? undefined : message.trim(),
      simulateEmailSend: simulateSend,
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
        "rounded-[1.05rem] border border-stone-200/60 bg-gradient-to-br from-white via-stone-50/20 to-sky-50/[0.06]",
        "p-7 ring-1 ring-stone-900/[0.02] sm:p-8",
        className,
      )}
    >
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between sm:gap-10">
        <div className="min-w-0 max-w-xl space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-900/45">
            Collaboration
          </p>
          <p className="text-sm leading-relaxed text-neutral-600">
            Bring someone into this Site Room context—structured invite, role-first framing. No
            real email is sent unless you enable the simulation stamp (delivery still runs through
            your own channels until Aervara ships outbound mail).
          </p>
        </div>
        <Button
          type="button"
          className="h-11 shrink-0 rounded-xl px-6 text-sm font-semibold shadow-sm"
          onClick={() => {
            setPhase("form");
            setEmail("");
            setRole("");
            setMessage("");
            setSimulateSend(true);
            setError(null);
            setOpen(true);
          }}
        >
          Invite someone
        </Button>
      </div>

      <dialog
        ref={dialogRef}
        className={cn(
          "fixed left-1/2 top-1/2 z-[200] w-[min(calc(100vw-1.5rem),28rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-stone-200/80 bg-white p-0",
          "shadow-[0_32px_88px_-28px_rgba(15,23,42,0.3)] ring-1 ring-stone-900/[0.06]",
          "[&::backdrop]:bg-stone-950/[0.45] [&::backdrop]:backdrop-blur-[4px]",
        )}
        aria-labelledby={titleId}
        onClose={close}
        onCancel={(ev) => {
          ev.preventDefault();
          close();
        }}
      >
        <div className="border-b border-stone-100/90 bg-gradient-to-br from-stone-50/95 via-white to-sky-50/15 px-6 py-5 sm:px-7">
          <p
            id={titleId}
            className="text-lg font-semibold tracking-[-0.02em] text-neutral-950"
          >
            {phase === "form" ? "Invite to deal" : "Invite saved"}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-neutral-600">
            {phase === "form" ? (
              <>
                Aervara stores the invite on this opportunity so collaboration stays tied to the
                parcel—not a mass share link.
              </>
            ) : (
              <>
                The invite is on file for this property. Share access through your own channels
                until automated email is available.
              </>
            )}
          </p>
        </div>

        {phase === "form" ? (
          <form onSubmit={handleSubmit} className="px-6 py-6 sm:px-7 sm:py-7">
            <div className="space-y-2">
              <Label htmlFor="deal-invite-email" className="text-xs text-neutral-500">
                Email
              </Label>
              <Input
                id="deal-invite-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="text-sm"
                required
              />
            </div>

            <fieldset className="mt-6 space-y-2.5">
              <legend className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                Their role
              </legend>
              <div className="grid grid-cols-3 gap-2">
                {ROLES.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRole(value)}
                    aria-pressed={role === value}
                    className={cn(
                      "rounded-xl border px-2 py-2.5 text-center text-sm font-medium transition-colors",
                      "border-stone-200/90 bg-stone-50/50 text-neutral-800 hover:border-stone-300 hover:bg-white",
                      role === value &&
                        "border-neutral-900 bg-neutral-950 text-white shadow-sm",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="mt-6 space-y-2">
              <Label htmlFor="deal-invite-msg" className="text-xs text-neutral-500">
                Message <span className="font-normal text-neutral-400">(optional)</span>
              </Label>
              <Textarea
                id="deal-invite-msg"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                maxLength={2000}
                placeholder="Why this site, timing, or how you’d like them to engage…"
                className="resize-y text-sm"
              />
            </div>

            <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl border border-stone-100 bg-stone-50/40 px-3 py-3">
              <input
                type="checkbox"
                checked={simulateSend}
                onChange={(e) => setSimulateSend(e.target.checked)}
                className="mt-1 size-4 rounded border-stone-300 text-neutral-900"
              />
              <span className="text-sm leading-snug text-neutral-700">
                <span className="font-medium text-neutral-900">Simulate email send</span>
                <span className="mt-0.5 block text-xs text-neutral-500">
                  Records a “sent” timestamp for this invite. No real email is delivered from
                  Aervara.
                </span>
              </span>
            </label>

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
                {pending ? "Saving…" : "Save invite"}
              </Button>
            </div>
          </form>
        ) : (
          <div className="px-6 py-10 text-center sm:px-7">
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
              {simulateSend
                ? "Invite stored with a simulated send timestamp."
                : "Invite stored without a simulated send."}
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
