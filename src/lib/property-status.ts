import { cn } from "@/lib/utils";

export const PROPERTY_STATUSES = [
  "New",
  "Reviewing",
  "Priority",
  "Passed",
] as const;

export type PropertyStatus = (typeof PROPERTY_STATUSES)[number];

export function normalizePropertyStatus(
  raw: string | null | undefined,
): PropertyStatus {
  const s = (raw ?? "New").trim();
  return (PROPERTY_STATUSES as readonly string[]).includes(s)
    ? (s as PropertyStatus)
    : "New";
}

export function propertyStatusBadgeClass(status: PropertyStatus): string {
  switch (status) {
    case "New":
      return "border border-sky-200/90 bg-sky-50/90 text-sky-950";
    case "Reviewing":
      return "border border-amber-200/90 bg-amber-50/90 text-amber-950";
    case "Priority":
      return "border border-violet-200/90 bg-violet-50/95 text-violet-950";
    case "Passed":
      return "border border-neutral-200/90 bg-neutral-100/90 text-neutral-600";
    default:
      return "border border-neutral-200/90 bg-neutral-50 text-neutral-700";
  }
}

export function propertyStatusSelectClassName(): string {
  return cn(
    "flex h-10 w-full max-w-xs rounded-md border border-neutral-200 bg-white px-3 text-sm text-neutral-950",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-1",
  );
}
