import type { PropertyRow } from "@/types/property";

/** Future: true when parcel GIS / survey fields are linked and flagged verified. */
export function hasVerifiedParcelGeometry(p: PropertyRow): boolean {
  return Boolean(
    p.parcel_geometry_verified_at?.trim() &&
      p.parcel_pin_apn != null &&
      String(p.parcel_pin_apn).trim().length > 0,
  );
}
