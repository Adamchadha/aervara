import {
  CHICAGO_BUILDING_PERMITS_URL,
  SOCRATA_PROBE_LIMIT,
  escapeSoqlString,
  socrataFetchJson,
  type SocrataDatasetResult,
} from "@/lib/property-data/sources";

/**
 * Probe Chicago building permits (Socrata) by street number + street name fragment.
 * Does not geocode; relies on parsed address line.
 */
export async function fetchChicagoBuildingPermitsSample(parts: {
  streetNumber: string;
  streetName: string;
}): Promise<SocrataDatasetResult> {
  const num = escapeSoqlString(parts.streetNumber.trim());
  const nameRaw = parts.streetName.trim();
  if (!num || nameRaw.length < 2) {
    return {
      status: "not_connected",
      data: [],
      message: "Street number and name are required for Chicago permit lookup.",
    };
  }
  const stripped = nameRaw.replace(/^(N|S|E|W)\s+/i, "").trim();
  const firstWord = stripped.split(/\s+/)[0] ?? stripped;
  const frag = escapeSoqlString(
    firstWord.length >= 3 ? firstWord.slice(0, 14) : stripped.slice(0, 14),
  );
  return socrataFetchJson(CHICAGO_BUILDING_PERMITS_URL, {
    $where: `street_number='${num}' AND upper(street_name) like upper('%${frag}%')`,
    $order: "issue_date DESC",
    $limit: String(SOCRATA_PROBE_LIMIT),
  });
}

/**
 * Zoning polygons / intersection are not exposed via the Socrata resource list in this build.
 * Cityscape key is reserved for a future integration (see getChicagoCityscapeApiKey).
 */
export async function fetchChicagoZoningLookupPlaceholder(): Promise<SocrataDatasetResult> {
  return {
    status: "not_connected",
    data: [],
    message:
      "Zoning boundary lookup is not wired to a public API in this build. Use the manual zoning field; optional CHICAGO_CITYSCAPE_API_KEY reserved for future use.",
  };
}
