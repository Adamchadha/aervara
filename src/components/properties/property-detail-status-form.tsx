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

const initial: UpdatePropertyStatusState = {};

type PropertyDetailStatusFormProps = {
  propertyId: string;
  status: string | null | undefined;
};

export function PropertyDetailStatusForm({
  propertyId,
  status,
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

  return (
    <form ref={formRef} action={formAction} className="space-y-2">
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
