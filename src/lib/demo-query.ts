/** Append `?demo=true` or `&demo=true` for Pro Preview navigation. */
export function withDemoQuery(path: string, isDemo: boolean): string {
  if (!isDemo) return path;
  return path.includes("?") ? `${path}&demo=true` : `${path}?demo=true`;
}

/**
 * Property detail links from pipeline / hero / map.
 * - `publicDemo`: standalone `/demo` workspace (no auth).
 * - `isDemo`: logged-in preview with `?demo=true` on real `/properties` routes.
 */
export function propertyDetailHref(
  id: string,
  opts: { isDemo?: boolean; publicDemo?: boolean },
): string {
  if (opts.publicDemo) return `/demo/properties/${id}`;
  return withDemoQuery(`/properties/${id}`, !!opts.isDemo);
}
