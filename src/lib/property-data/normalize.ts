import type { PropertyRow } from "@/types/property";

/** Cook County / Chicago IL state check. */
export function isIllinoisProperty(p: Pick<PropertyRow, "state">): boolean {
  return (p.state ?? "").trim().toUpperCase() === "IL";
}

export function isChicagoProperty(p: Pick<PropertyRow, "city" | "state">): boolean {
  if (!isIllinoisProperty(p)) return false;
  return /\bchicago\b/i.test((p.city ?? "").trim());
}

/**
 * Normalize user-entered PIN / APN to a 14-digit Cook County PIN when possible.
 * Returns null if the string cannot be interpreted as a plausible Cook PIN.
 */
export function normalizeCookPin14(raw: string | null | undefined): string | null {
  if (raw == null) return null;
  const digits = String(raw).replace(/\D/g, "");
  if (digits.length === 14) return digits;
  if (digits.length === 10) return digits.padStart(14, "0");
  if (digits.length > 10 && digits.length < 14) return digits.padStart(14, "0");
  if (digits.length > 14) return digits.slice(0, 14);
  return null;
}

/** Value stored in `parcel_pin_apn` only (used for “PIN connected” vs entry card). */
export function readPersistedParcelPinApn(p: PropertyRow): string | null {
  const v = p.parcel_pin_apn;
  if (typeof v === "string" && v.trim().length > 0) return v.trim();
  return null;
}

/** Prefer explicit PIN/APN columns for open-data matching (parcel_pin_apn first). */
export function readParcelPinFromProperty(p: PropertyRow): string | null {
  const keys = ["parcel_pin_apn", "parcel_id_apn", "parcel_pin", "apn"] as const;
  for (const k of keys) {
    const v = (p as Record<string, unknown>)[k];
    if (typeof v === "string" && v.trim().length > 0) return v.trim();
  }
  return null;
}

/**
 * Very small street parse for Chicago permit queries: leading number + remainder before comma.
 * Example: "7529 N Clark St" → { streetNumber: "7529", streetName: "N Clark St" }
 */
export function parseChicagoStreetLine(address: string | null | undefined): {
  streetNumber: string;
  streetName: string;
} | null {
  if (address == null) return null;
  const line = address.split(",")[0]?.trim() ?? "";
  const m = line.match(/^(\d{1,6})\s+(.{2,120})$/);
  if (!m) return null;
  return { streetNumber: m[1], streetName: m[2].trim() };
}
