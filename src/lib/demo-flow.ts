import { withDemoQuery } from "@/lib/demo-query";

/** Canonical demo flag parser used by routing + UI gating. */
export function isDemoMode(value: string | null | undefined): boolean {
  return value === "true";
}

function pickSearchParam(
  sp: Record<string, string | string[] | undefined>,
  key: string,
): string | undefined {
  const v = sp[key];
  if (typeof v === "string") return v.trim() || undefined;
  if (Array.isArray(v) && typeof v[0] === "string") return v[0].trim() || undefined;
  return undefined;
}

/** Canonical `/apply` path including `next`, `source`, and `demo` when present. */
export function buildApplyPath(
  sp: Record<string, string | string[] | undefined>,
): string {
  const params = new URLSearchParams();
  const n = pickSearchParam(sp, "next");
  const s = pickSearchParam(sp, "source");
  const d = pickSearchParam(sp, "demo");
  if (n) params.set("next", n);
  if (s) params.set("source", s);
  if (d) params.set("demo", d);
  const q = params.toString();
  return q ? `/apply?${q}` : "/apply";
}

export function inferRequestedFromDemo(
  sp: Record<string, string | string[] | undefined>,
): boolean {
  if (isDemoMode(pickSearchParam(sp, "demo"))) return true;
  const next = pickSearchParam(sp, "next") ?? "";
  return next.includes("demo=true");
}

export function inferDefaultSourceRoute(
  sp: Record<string, string | string[] | undefined>,
): string {
  const source = pickSearchParam(sp, "source");
  if (source?.startsWith("/")) return source.slice(0, 2000);
  const next = pickSearchParam(sp, "next");
  if (next?.startsWith("/")) return next.slice(0, 2000);
  return "/apply";
}

/** Apply flow for users leaving public demo (and other gated surfaces). */
export function requestFullAccessHref(options?: {
  nextPath?: string;
  /** Where the user clicked from (pathname + optional query). */
  sourceRoute?: string;
}): string {
  const params = new URLSearchParams();
  if (options?.nextPath?.trim()) {
    params.set("next", options.nextPath.trim());
  }
  if (options?.sourceRoute?.trim()) {
    params.set("source", options.sourceRoute.trim());
  }
  const q = params.toString();
  return q ? `/apply?${q}` : "/apply";
}

/** Preserve demo mode on internal links when already in demo. */
export function demoAwarePath(path: string, isDemo: boolean): string {
  return withDemoQuery(path, isDemo);
}
