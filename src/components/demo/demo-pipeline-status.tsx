"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import {
  PROPERTY_STATUSES,
  normalizePropertyStatus,
  propertyStatusSelectClassName,
} from "@/lib/property-status";

type DemoPipelineStatusProps = {
  initialStatus?: string | null;
};

/** Client-only pipeline picker — local state; nothing persists. */
export function DemoPipelineStatus({ initialStatus }: DemoPipelineStatusProps) {
  const [value, setValue] = useState(() => normalizePropertyStatus(initialStatus));

  return (
    <div className="space-y-2">
      <Label htmlFor="demo-pipeline-status" className="text-xs text-neutral-500">
        Pipeline status
      </Label>
      <select
        id="demo-pipeline-status"
        value={value}
        onChange={(e) => setValue(normalizePropertyStatus(e.target.value))}
        className={propertyStatusSelectClassName()}
      >
        {PROPERTY_STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <p className="text-[11px] text-neutral-400">Demo only — not saved.</p>
    </div>
  );
}
