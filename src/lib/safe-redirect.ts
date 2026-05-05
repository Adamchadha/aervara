/**
 * Returns a same-origin path safe for redirects after auth.
 * Rejects open redirects, protocol-relative URLs, and unknown paths.
 */
function decodeRedirectParam(raw: string): string {
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

export function getSafeInternalRedirect(
  candidate: string | null | undefined,
  fallback = "/dashboard",
): string {
  if (candidate == null || typeof candidate !== "string") return fallback;
  const s = decodeRedirectParam(candidate).trim();
  if (!s.startsWith("/") || s.startsWith("//")) return fallback;
  if (s.includes("://") || s.includes("\\") || s.includes("\0")) {
    return fallback;
  }
  if (s.startsWith("/login")) return fallback;

  const allowedPrefixes = [
    "/",
    "/dashboard",
    "/properties",
    "/demo",
    "/pricing",
    "/apply",
    "/admin",
    "/onboarding",
  ];
  const isAllowed = allowedPrefixes.some(
    (p) => s === p || (p !== "/" && s.startsWith(`${p}/`)),
  );
  return isAllowed ? s : fallback;
}
