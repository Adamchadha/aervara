"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { submitMeetingRequest } from "@/app/properties/meeting-request-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UserRoleBadge } from "@/components/ui/user-role-badge";
import { cn } from "@/lib/utils";
import type { MeetingRequestType } from "@/types/meeting-request";

const MEETING_TYPES: { value: MeetingRequestType; label: string }[] = [
  { value: "in_person", label: "In person" },
  { value: "video_call", label: "Video call" },
  { value: "phone_call", label: "Phone call" },
];

type RequestMeetingButtonProps = {
  propertyId: string;
  viewerRole?: string | null;
  className?: string;
  /** Button label (default: Request meeting). */
  triggerLabel?: string;
  /** When the dialog opens, pre-select this meeting type (e.g. phone for “Request a call”). */
  initialMeetingType?: MeetingRequestType;
  /** Dialog heading while filling the form (default: Request meeting). */
  formTitle?: string;
  disabled?: boolean;
};

export function RequestMeetingButton({
  propertyId,
  viewerRole = null,
  className,
  triggerLabel = "Request meeting",
  initialMeetingType,
  formTitle = "Request meeting",
  disabled = false,
}: RequestMeetingButtonProps) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [open, setOpen] = useState(false);
  const [meetingType, setMeetingType] = useState<MeetingRequestType | "">("");
  const [rangeStart, setRangeStart] = useState("");
  const [rangeEnd, setRangeEnd] = useState("");
  const [agenda, setAgenda] = useState("");
  const [notes, setNotes] = useState("");
  const [phase, setPhase] = useState<"form" | "success">("form");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const close = useCallback(() => {
    dialogRef.current?.close();
    setOpen(false);
    setPhase("form");
    setMeetingType("");
    setRangeStart("");
    setRangeEnd("");
    setAgenda("");
    setNotes("");
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
    if (!meetingType) {
      setError("Choose a preferred meeting type.");
      return;
    }
    if (!rangeStart || !rangeEnd) {
      setError("Add a preferred start and end date for your window.");
      return;
    }
    const agendaTrim = agenda.trim();
    if (agendaTrim.length < 5) {
      setError("Add a short agenda (at least 5 characters).");
      return;
    }
    setPending(true);
    const res = await submitMeetingRequest({
      propertyId,
      meetingType,
      preferredRangeStart: rangeStart,
      preferredRangeEnd: rangeEnd,
      agenda: agendaTrim,
      notes: notes.trim() === "" ? null : notes.trim(),
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
          setMeetingType(initialMeetingType ?? "");
          setRangeStart("");
          setRangeEnd("");
          setAgenda("");
          setNotes("");
          setError(null);
          setOpen(true);
        }}
      >
        {triggerLabel}
      </Button>

      <dialog
        ref={dialogRef}
        className={cn(
          "fixed left-1/2 top-1/2 z-[200] w-[min(calc(100vw-1.5rem),28rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-stone-200/80 bg-white p-0",
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
        <div className="border-b border-stone-100/90 bg-gradient-to-br from-stone-50/90 via-white to-sky-50/15 px-6 py-6 sm:px-7">
          <p
            id={titleId}
            className="text-lg font-semibold tracking-[-0.02em] text-neutral-950"
          >
            {phase === "form" ? formTitle : "Request received"}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-neutral-600">
            {phase === "form" ? (
              <>
                A first step toward getting the right people in a room around
                this opportunity—Aervara will coordinate timing with you after
                review.
              </>
            ) : (
              <>
                Your meeting request is saved. We&apos;ll follow up using your
                account contact path—this is not a confirmed calendar hold.
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
          <form onSubmit={handleSubmit} className="px-6 py-6 sm:px-7 sm:py-7">
            <fieldset className="space-y-2.5">
              <legend className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                Preferred meeting type
              </legend>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {MEETING_TYPES.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setMeetingType(value)}
                    aria-pressed={meetingType === value}
                    className={cn(
                      "rounded-xl border px-3 py-2.5 text-center text-sm font-medium transition-colors",
                      "border-stone-200/90 bg-stone-50/50 text-neutral-800 hover:border-stone-300 hover:bg-white",
                      meetingType === value &&
                        "border-neutral-900 bg-neutral-950 text-white shadow-sm",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label
                  htmlFor="meeting-range-start"
                  className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-400"
                >
                  Preferred window — start
                </Label>
                <Input
                  id="meeting-range-start"
                  type="date"
                  value={rangeStart}
                  onChange={(e) => setRangeStart(e.target.value)}
                  className="font-mono text-sm tabular-nums"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="meeting-range-end"
                  className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-400"
                >
                  Preferred window — end
                </Label>
                <Input
                  id="meeting-range-end"
                  type="date"
                  value={rangeEnd}
                  onChange={(e) => setRangeEnd(e.target.value)}
                  className="font-mono text-sm tabular-nums"
                  required
                />
              </div>
            </div>

            <div className="mt-7 space-y-2">
              <Label htmlFor="meeting-agenda" className="text-xs text-neutral-500">
                Short agenda
              </Label>
              <Textarea
                id="meeting-agenda"
                value={agenda}
                onChange={(e) => setAgenda(e.target.value)}
                rows={3}
                maxLength={2000}
                placeholder="What you want to cover in the session…"
                className="resize-y text-sm"
              />
            </div>

            <div className="mt-5 space-y-2">
              <Label htmlFor="meeting-notes" className="text-xs text-neutral-500">
                Optional notes
              </Label>
              <Textarea
                id="meeting-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                maxLength={2000}
                placeholder="Attendees, location preferences, NDAs…"
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
          <div className="px-6 py-9 text-center sm:px-7">
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
            <Button type="button" className="mt-8 w-full sm:w-auto" onClick={close}>
              Done
            </Button>
          </div>
        )}
      </dialog>
    </>
  );
}
