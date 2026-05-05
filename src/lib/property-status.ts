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
      return "border border-sky-200/70 bg-sky-50/85 text-sky-950 shadow-sm ring-1 ring-sky-950/[0.04]";
    case "Reviewing":
      return "border border-amber-200/70 bg-amber-50/85 text-amber-950 shadow-sm ring-1 ring-amber-950/[0.04]";
    case "Priority":
      return "border border-violet-200/70 bg-violet-50/90 text-violet-950 shadow-sm ring-1 ring-violet-950/[0.04]";
    case "Passed":
      return "border border-neutral-200/70 bg-neutral-100/85 text-neutral-600 shadow-sm ring-1 ring-neutral-950/[0.03]";
    default:
      return "border border-neutral-200/70 bg-neutral-50/90 text-neutral-700 shadow-sm ring-1 ring-neutral-950/[0.03]";
  }
}

export function propertyStatusSelectClassName(): string {
  return cn(
    "flex h-10 w-full rounded-xl border border-neutral-200/80 bg-white px-3 text-sm font-medium text-neutral-950 shadow-sm",
    "transition-[border-color,box-shadow,background-color] duration-[320ms] ease-out hover:border-neutral-300/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950/80 focus-visible:ring-offset-2",
  );
}
