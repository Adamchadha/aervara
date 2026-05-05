import {
  COOK_ASSESSED_VALUES_URL,
  COOK_ASSESSOR_PERMITS_URL,
  COOK_PARCEL_SALES_URL,
  COOK_PARCEL_UNIVERSE_URL,
  SOCRATA_PROBE_LIMIT,
  escapeSoqlString,
  socrataFetchJson,
  type SocrataDatasetResult,
} from "@/lib/property-data/sources";

function pinWhere(pin14: string): Record<string, string> {
  const safe = escapeSoqlString(pin14);
  return {
    $where: `pin='${safe}'`,
    $order: "year DESC",
    $limit: String(SOCRATA_PROBE_LIMIT),
  };
}

export async function fetchCookAssessedValuesByPin(pin14: string): Promise<SocrataDatasetResult> {
  return socrataFetchJson(COOK_ASSESSED_VALUES_URL, pinWhere(pin14));
}

export async function fetchCookParcelSalesByPin(pin14: string): Promise<SocrataDatasetResult> {
  return socrataFetchJson(COOK_PARCEL_SALES_URL, pinWhere(pin14));
}

export async function fetchCookParcelUniverseByPin(pin14: string): Promise<SocrataDatasetResult> {
  return socrataFetchJson(COOK_PARCEL_UNIVERSE_URL, pinWhere(pin14));
}

export async function fetchCookAssessorPermitsByPin(pin14: string): Promise<SocrataDatasetResult> {
  return socrataFetchJson(COOK_ASSESSOR_PERMITS_URL, pinWhere(pin14));
}
