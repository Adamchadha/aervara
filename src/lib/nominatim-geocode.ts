/**
 * Server-side geocoding via OpenStreetMap Nominatim.
 * @see https://operations.osmfoundation.org/policies/nominatim/
 * Respect rate limits (caller should serialize requests, ~1/sec).
 */
export type GeocodeHit = { lat: number; lng: number };

const NOMINATIM_SEARCH =
  "https://nominatim.openstreetmap.org/search?format=json&limit=1";

export async function nominatimGeocode(
  query: string,
  userAgent: string,
): Promise<GeocodeHit | null> {
  const q = query.trim();
  if (!q) return null;

  const url = `${NOMINATIM_SEARCH}&q=${encodeURIComponent(q)}`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": userAgent,
      "Accept-Language": "en",
    },
    cache: "no-store",
  });

  if (!res.ok) return null;

  const data = (await res.json()) as { lat?: string; lon?: string }[];
  const first = data[0];
  if (!first?.lat || !first?.lon) return null;

  const lat = Number(first.lat);
  const lng = Number(first.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  return { lat, lng };
}

export function nominatimUserAgent(): string {
  return (
    process.env.NOMINATIM_USER_AGENT?.trim() ||
    "Aervara/1.0 (https://github.com/aervara; contact: configure NOMINATIM_USER_AGENT)"
  );
}
