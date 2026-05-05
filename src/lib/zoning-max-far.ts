/**
 * Lightweight zoning-to-FAR heuristic used for submission intake.
 * This is intentionally conservative and can be overridden in edit flows.
 */
export function inferMaxFarFromZoning(zoningDistrict: string): number {
  const z = zoningDistrict.trim().toUpperCase();
  if (!z) return 2;

  if (z.startsWith("MX")) return 6;
  if (z.startsWith("RM") || z.startsWith("R-M")) return 4;
  if (z.startsWith("R")) return 2;
  if (z.startsWith("C")) return 5;
  if (z.startsWith("D")) return 8;
  if (z.startsWith("M")) return 3;
  if (z.includes("TOD")) return 7;
  return 2.5;
}

