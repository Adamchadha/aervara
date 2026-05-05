"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { markPropertyForLaterReview } from "@/app/properties/actions";
import { requestFullAccessHref } from "@/lib/demo-flow";
import { RequestIntroductionButton } from "@/components/properties/request-introduction-button";
import { RequestMeetingButton } from "@/components/properties/request-meeting-button";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const actionBtn =
  "h-11 w-full justify-center rounded-xl border border-stone-200/90 bg-white px-4 text-sm font-semibold text-neutral-950 shadow-sm ring-1 ring-stone-900/[0.04] transition-[border-color,background-color,box-shadow] hover:border-stone-300 hover:bg-stone-50/80";

type TakeActionPanelProps = {
  propertyId: string;
  viewerRole: string | null;
  readOnly?: boolean;
  isDemo?: boolean;
  /** Override apply next/source paths (e.g. public `/demo/properties/…`). */
  demoApplyNextPath?: string;
  demoApplySourcePath?: string;
};

export function TakeActionPanel({
  propertyId,
  viewerRole,
  readOnly = false,
  isDemo = false,
  demoApplyNextPath,
  demoApplySourcePath,
}: TakeActionPanelProps) {
  const router = useRouter();
  const [saveState, setSaveState] = useState<"idle" | "pending" | "done" | "error">("idle");
  const [saveError, setSaveError] = useState<string | null>(null);

  const onSaveForLater = useCallback(async () => {
    setSaveError(null);
    setSaveState("pending");
    const res = await markPropertyForLaterReview(propertyId);
    if (!res.ok) {
      setSaveState("error");
      setSaveError(res.error);
      return;
    }
    setSaveState("done");
    router.refresh();
    window.setTimeout(() => setSaveState("idle"), 2400);
  }, [propertyId, router]);

  const saveLabel =
    saveState === "pending"
      ? "Saving…"
      : saveState === "done"
        ? "Saved to pipeline"
        : "Save for later";

  if (readOnly) {
    if (isDemo) {
      const nextPath =
        demoApplyNextPath ?? `/properties/${propertyId}?demo=true`;
      const sourceRoute =
        demoApplySourcePath ?? `/properties/${propertyId}?demo=true`;
      const accessHref = requestFullAccessHref({
        nextPath,
        sourceRoute,
      });
      return (
        <div className="space-y-5">
          <p className="text-sm leading-relaxed text-neutral-600">
            In full access you can request calls, meetings, and introductions from this
            room—everything routes through Aervara for structured review.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Button asChild variant="secondary" className={cn(actionBtn, "h-auto py-3")}>
              <Link href={accessHref}>Request a call</Link>
            </Button>
            <Button asChild variant="secondary" className={cn(actionBtn, "h-auto py-3")}>
              <Link href={accessHref}>Request a meeting</Link>
            </Button>
            <Button asChild variant="secondary" className={cn(actionBtn, "h-auto py-3")}>
              <Link href={accessHref}>Request introduction</Link>
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled
              className={cn(actionBtn, "h-auto cursor-not-allowed py-3 opacity-60")}
              title="Available with full access"
            >
              Save for later
            </Button>
          </div>
          <p className="text-xs text-neutral-500">
            Demo mode keeps these actions off your workspace—use{" "}
            <span className="font-medium text-neutral-700">Request Full Access</span> to
            apply.
          </p>
        </div>
      );
    }
    return (
      <div className="space-y-4 rounded-2xl border border-stone-200/60 bg-stone-50/40 px-5 py-5 text-sm text-neutral-600">
        <p className="font-medium text-neutral-800">Take Action (preview)</p>
        <p>
          Calls, meetings, introductions, and pipeline saves are disabled in Pro
          Preview so you can review the workflow without generating real coordination
          tasks.
        </p>
        <Button asChild variant="secondary" className="rounded-xl">
          <Link
            href={requestFullAccessHref({
              nextPath: `/properties/${propertyId}`,
              sourceRoute: `/properties/${propertyId}`,
            })}
          >
            Request full access
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <RequestMeetingButton
          propertyId={propertyId}
          viewerRole={viewerRole}
          triggerLabel="Request a call"
          initialMeetingType="phone_call"
          formTitle="Request a call"
          className={actionBtn}
        />
        <RequestMeetingButton
          propertyId={propertyId}
          viewerRole={viewerRole}
          triggerLabel="Request a meeting"
          formTitle="Request a meeting"
          className={actionBtn}
        />
        <RequestIntroductionButton
          propertyId={propertyId}
          viewerRole={viewerRole}
          triggerLabel="Request introduction"
          className={actionBtn}
        />
        <Button
          type="button"
          variant="secondary"
          disabled={saveState === "pending"}
          className={cn(actionBtn, saveState === "done" && "border-emerald-200/90 bg-emerald-50/50")}
          onClick={onSaveForLater}
        >
          {saveLabel}
        </Button>
      </div>

      <div className="rounded-xl border border-stone-100/90 bg-stone-50/40 px-4 py-3.5 sm:px-5">
        <p className="text-[13px] leading-relaxed text-neutral-600">
          There is no assigned contact on this parcel—requests go to Aervara for structured
          review. We coordinate the right introduction or conversation based on your
          submission; nothing here is a booked call or guaranteed meeting until confirmed.
        </p>
        {saveError ? (
          <p className="mt-2 text-sm text-red-600" role="alert">
            {saveError}
          </p>
        ) : null}
        <p className="mt-2 text-[12px] leading-relaxed text-neutral-400">
          <span className="font-medium text-neutral-500">Save for later</span> marks this
          property as <span className="font-medium text-neutral-600">Reviewing</span> in your
          pipeline so it stays on your radar without sending a coordination request.
        </p>
      </div>
    </div>
  );
}
