/** Append `?demo=true` or `&demo=true` for Pro Preview navigation. */
export function withDemoQuery(path: string, isDemo: boolean): string {
  if (!isDemo) return path;
  return path.includes("?") ? `${path}&demo=true` : `${path}?demo=true`;
}
