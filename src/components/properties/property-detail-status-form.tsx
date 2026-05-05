"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef } from "react";
import {
  updatePropertyStatus,
  type UpdatePropertyStatusState,
} from "@/app/properties/actions";
import {
  PROPERTY_STATUSES,
  normalizePropertyStatus,
  propertyStatusSelectClassName,
} from "@/lib/property-status";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const initial: UpdatePropertyStatusState = {};

type PropertyDetailStatusFormProps = {
  propertyId: string;
  status: string | null | undefined;
  className?: string;
  readOnly?: boolean;
};

export function PropertyDetailStatusForm({
  propertyId,
  status,
  className,
  readOnly = false,
}: PropertyDetailStatusFormProps) {
  const router = useRouter();
  const bound = updatePropertyStatus.bind(null, propertyId);
  const [state, formAction, pending] = useActionState(bound, initial);
  const formRef = useRef<HTMLFormElement>(null);
  const wasPending = useRef(false);
  const current = normalizePropertyStatus(status);

  useEffect(() => {
    if (wasPending.current && !pending && !state.error) {
      router.refresh();
    }
    wasPending.current = pending;
  }, [pending, router, state.error]);

  if (readOnly) {
    return (
      <div className={cn("w-full max-w-none space-y-2", className)}>
        <Label className="text-xs text-neutral-500">Pipeline status</Label>
        <p className="rounded-xl border border-stone-200/70 bg-stone-50/50 px-3 py-2 text-sm font-medium text-neutral-800">
          {current}
        </p>
        <p className="text-[11px] text-neutral-400">Read-only in Pro Preview.</p>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      action={formAction}
      className={cn("w-full max-w-none space-y-2", className)}
    >
      <Label htmlFor="detail-status" className="text-xs text-neutral-500">
        Pipeline status
      </Label>
      <select
        id="detail-status"
        name="status"
        defaultValue={current}
        disabled={pending}
        onChange={() => formRef.current?.requestSubmit()}
        className={propertyStatusSelectClassName()}
      >
        {PROPERTY_STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      {state.error ? (
        <p className="text-xs text-red-600">{state.error}</p>
      ) : null}
      <p className="text-[11px] text-neutral-400" aria-live="polite">
        {pending ? "Saving…" : "Changes save automatically."}
      </p>
    </form>
  );
}
