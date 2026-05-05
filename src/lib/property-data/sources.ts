/**
 * Chicago / Cook County open data — Socrata (SODA) endpoints.
 * Optional SOCRATA_APP_TOKEN increases rate limits; unauthenticated access still works.
 */

export const COOK_COUNTY_BASE = "https://datacatalog.cookcountyil.gov/resource";

/** Assessor — assessed values (PIN + year). */
export const COOK_ASSESSED_VALUES_URL = `${COOK_COUNTY_BASE}/uzyt-m557.json`;

/** Assessor — parcel sales (MYDEC). */
export const COOK_PARCEL_SALES_URL = `${COOK_COUNTY_BASE}/wvhk-k5uv.json`;

/** Assessor — parcel universe (characteristics, lat/lon). */
export const COOK_PARCEL_UNIVERSE_URL = `${COOK_COUNTY_BASE}/nj4t-kc8j.json`;

/** Assessor — permits (PIN-linked). */
export const COOK_ASSESSOR_PERMITS_URL = `${COOK_COUNTY_BASE}/6yjf-dfxs.json`;

/** City of Chicago — building permits. */
export const CHICAGO_BUILDING_PERMITS_URL = "https://data.cityofchicago.org/resource/ydr8-5enu.json";

/** Default Socrata probe limit (small response for connectivity checks). */
export const SOCRATA_PROBE_LIMIT = 5;

/** Request timeout (ms). */
export const SOCRATA_FETCH_TIMEOUT_MS = 14_000;

export type SocrataIntegrationStatus = "connected" | "not_connected" | "error";

export type SocrataDatasetResult = {
  status: SocrataIntegrationStatus;
  data: Record<string, unknown>[];
  message: string;
};

export function getSocrataAppToken(): string | undefined {
  const t = process.env.SOCRATA_APP_TOKEN?.trim();
  return t && t.length > 0 ? t : undefined;
}

/** Reserved for future Cityscape / premium zoning integrations (do not send to Socrata). */
export function getChicagoCityscapeApiKey(): string | undefined {
  const t = process.env.CHICAGO_CITYSCAPE_API_KEY?.trim();
  return t && t.length > 0 ? t : undefined;
}

function buildSocrataUrl(path: string, params: Record<string, string>): string {
  const u = new URL(path);
  for (const [k, v] of Object.entries(params)) {
    u.searchParams.set(k, v);
  }
  return u.toString();
}

/**
 * Safe GET to a Socrata JSON endpoint. Never throws; returns structured error on failure.
 */
export async function socrataFetchJson(
  resourceUrl: string,
  params: Record<string, string>,
): Promise<SocrataDatasetResult> {
  const url = buildSocrataUrl(resourceUrl, params);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), SOCRATA_FETCH_TIMEOUT_MS);
  try {
    const headers: HeadersInit = { Accept: "application/json" };
    const token = getSocrataAppToken();
    if (token) headers["X-App-Token"] = token;

    const res = await fetch(url, {
      method: "GET",
      headers,
      signal: controller.signal,
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return {
        status: "error",
        data: [],
        message: `HTTP ${res.status} from open data API`,
      };
    }

    const raw = (await res.json()) as unknown;
    if (!Array.isArray(raw)) {
      return {
        status: "error",
        data: [],
        message: "Unexpected response shape from open data API",
      };
    }

    const data = raw as Record<string, unknown>[];
    return {
      status: "connected",
      data,
      message:
        data.length === 0
          ? "API responded successfully; no matching rows for this query."
          : `Retrieved ${data.length} row(s) (capped).`,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Request failed";
    const aborted = e instanceof Error && e.name === "AbortError";
    return {
      status: "error",
      data: [],
      message: aborted ? "Request timed out" : msg,
    };
  } finally {
    clearTimeout(timer);
  }
}

/** SoQL string literal escape for $where clauses. */
export function escapeSoqlString(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/'/g, "''");
}
