/**
 * Server-side geocoding via OpenStreetMap Nominatim.
 * @see https://operations.osmfoundation.org/policies/nominatim/
 * Respect rate limits (caller should serialize requests, ~1/sec).
 */
export type GeocodeHit = { lat: number; lng: number };

const NOMINATIM_SEARCH =
  "https://nominatim.openstreetmap.org/search?format=json&limit=1";

/** US state / territory abbreviations → full name for clearer Nominatim queries. */
const US_STATE_NAMES: Record<string, string> = {
  AL: "Alabama",
  AK: "Alaska",
  AZ: "Arizona",
  AR: "Arkansas",
  CA: "California",
  CO: "Colorado",
  CT: "Connecticut",
  DE: "Delaware",
  FL: "Florida",
  GA: "Georgia",
  HI: "Hawaii",
  ID: "Idaho",
  IL: "Illinois",
  IN: "Indiana",
  IA: "Iowa",
  KS: "Kansas",
  KY: "Kentucky",
  LA: "Louisiana",
  ME: "Maine",
  MD: "Maryland",
  MA: "Massachusetts",
  MI: "Michigan",
  MN: "Minnesota",
  MS: "Mississippi",
  MO: "Missouri",
  MT: "Montana",
  NE: "Nebraska",
  NV: "Nevada",
  NH: "New Hampshire",
  NJ: "New Jersey",
  NM: "New Mexico",
  NY: "New York",
  NC: "North Carolina",
  ND: "North Dakota",
  OH: "Ohio",
  OK: "Oklahoma",
  OR: "Oregon",
  PA: "Pennsylvania",
  RI: "Rhode Island",
  SC: "South Carolina",
  SD: "South Dakota",
  TN: "Tennessee",
  TX: "Texas",
  UT: "Utah",
  VT: "Vermont",
  VA: "Virginia",
  WA: "Washington",
  WV: "West Virginia",
  WI: "Wisconsin",
  WY: "Wyoming",
  DC: "District of Columbia",
};

function expandUsState(state: string): string {
  const s = state.trim();
  if (s.length <= 2) {
    const full = US_STATE_NAMES[s.toUpperCase()];
    if (full) return full;
  }
  return s;
}

/**
 * Rough downtown / metro centers when street-level geocoding fails (no network).
 * Coordinates are approximate public reference points, not parcel-specific.
 */
const METRO_CENTROIDS: Record<string, GeocodeHit> = {
  "madison|wi": { lat: 43.073051, lng: -89.40123 },
  "chicago|il": { lat: 41.878113, lng: -87.629799 },
};

function metroCentroid(city: string, state: string): GeocodeHit | null {
  const key = `${city.trim().toLowerCase()}|${state.trim().toLowerCase()}`;
  return METRO_CENTROIDS[key] ?? null;
}

/** Spread overlapping metro-fallback pins deterministically from address text. */
export function jitterAroundCentroid(base: GeocodeHit, seed: string): GeocodeHit {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  const dx = ((h % 2001) / 500000) - 0.002;
  const dy = ((((h / 2001) >>> 0) % 2001) / 500000) - 0.002;
  return { lat: base.lat + dx, lng: base.lng + dy };
}

function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

export async function nominatimGeocode(
  query: string,
  userAgent: string,
  options?: { countryCodes?: string },
): Promise<GeocodeHit | null> {
  const q = query.trim();
  if (!q) return null;

  const cc = options?.countryCodes
    ? `&countrycodes=${encodeURIComponent(options.countryCodes)}`
    : "";
  const url = `${NOMINATIM_SEARCH}&q=${encodeURIComponent(q)}${cc}`;
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

async function nominatimStructured(
  street: string,
  city: string,
  stateFull: string,
  userAgent: string,
): Promise<GeocodeHit | null> {
  const streetLine = street.trim();
  const cityLine = city.trim();
  const stateLine = stateFull.trim();
  if (!streetLine || !cityLine || !stateLine) return null;

  const params = new URLSearchParams({
    format: "json",
    limit: "1",
    street: streetLine,
    city: cityLine,
    state: stateLine,
    country: "United States",
  });
  const url = `https://nominatim.openstreetmap.org/search?${params.toString()}`;
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

/**
 * Street-level geocode with fallbacks so dashboard maps stay useful:
 * 1) Structured US search
 * 2) Free-text with full state + United States + countrycodes=us
 * 3) Free-text with original state token
 * 4) Metro centroid (Madison WI / Chicago IL) with small deterministic jitter
 * 5) City + state Nominatim (last resort)
 *
 * Callers must still rate-limit between *properties*; this function may issue
 * multiple requests with ~1.1s gaps when earlier steps miss.
 */
export async function geocodePropertyRow(
  address: string,
  city: string,
  state: string,
  userAgent: string,
): Promise<GeocodeHit | null> {
  const a = address.trim();
  const c = city.trim();
  const sRaw = state.trim();
  const full = expandUsState(sRaw);

  let hit = await nominatimStructured(a, c, full, userAgent);
  if (hit) return hit;

  await sleep(1100);
  hit = await nominatimGeocode(`${a}, ${c}, ${full}, United States`, userAgent, {
    countryCodes: "us",
  });
  if (hit) return hit;

  if (full !== sRaw) {
    await sleep(1100);
    hit = await nominatimGeocode(`${a}, ${c}, ${sRaw}, United States`, userAgent, {
      countryCodes: "us",
    });
    if (hit) return hit;
  }

  const metro = metroCentroid(c, sRaw);
  if (metro) {
    return jitterAroundCentroid(metro, `${a}|${c}|${sRaw}`);
  }

  await sleep(1100);
  hit = await nominatimGeocode(`${c}, ${full}, United States`, userAgent, {
    countryCodes: "us",
  });
  return hit;
}

export function nominatimUserAgent(): string {
  return (
    process.env.NOMINATIM_USER_AGENT?.trim() ||
    "Aervara/1.0 (https://github.com/aervara; contact: configure NOMINATIM_USER_AGENT)"
  );
}
