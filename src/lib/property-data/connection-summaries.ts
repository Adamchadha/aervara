import { fetchChicagoBuildingPermitsSample, fetchChicagoZoningLookupPlaceholder } from "@/lib/property-data/chicago";
import {
  fetchCookAssessedValuesByPin,
  fetchCookAssessorPermitsByPin,
  fetchCookParcelSalesByPin,
  fetchCookParcelUniverseByPin,
} from "@/lib/property-data/cook-county";
import {
  isChicagoProperty,
  isIllinoisProperty,
  normalizeCookPin14,
  parseChicagoStreetLine,
  readParcelPinFromProperty,
} from "@/lib/property-data/normalize";
import { getChicagoCityscapeApiKey, type SocrataDatasetResult } from "@/lib/property-data/sources";
import type { PropertyRow } from "@/types/property";

export type UiConnectStatus = "connected" | "not_connected" | "needs_pin" | "needs_address" | "error";

export type DataSourceConnectRow = {
  id: string;
  title: string;
  description: string;
  uiStatus: UiConnectStatus;
  detailMessage: string;
};

const PIN_HELP = "Add a Cook County PIN (14 digits) to query open assessor data.";

function mapProbeToUi(result: SocrataDatasetResult): { uiStatus: UiConnectStatus; detailMessage: string } {
  if (result.status === "error") {
    return { uiStatus: "error", detailMessage: result.message };
  }
  if (result.data.length > 0) {
    return { uiStatus: "connected", detailMessage: result.message };
  }
  return { uiStatus: "not_connected", detailMessage: result.message };
}

/**
 * Live probes against public Socrata endpoints (read-only). Does not persist or overwrite property fields.
 * `previewParcelPin`: optional URL/session preview — used when DB PIN is absent; does not write to the DB.
 */
export async function getCookCountyChicagoDataSourceRows(
  p: PropertyRow,
  options?: { previewParcelPin?: string | null },
): Promise<DataSourceConnectRow[]> {
  const previewNorm = normalizeCookPin14(options?.previewParcelPin ?? null);
  const dbNorm = normalizeCookPin14(readParcelPinFromProperty(p));
  /** Prefer saved property identifiers; preview URL is only used when DB has no usable PIN. */
  const pin = dbNorm ?? previewNorm ?? null;
  const chicago = isChicagoProperty(p);
  const il = isIllinoisProperty(p);
  const parsed = parseChicagoStreetLine(p.address);
  const cityscapeConfigured = Boolean(getChicagoCityscapeApiKey());

  let assessed: SocrataDatasetResult;
  let sales: SocrataDatasetResult;
  let universe: SocrataDatasetResult;
  let cookPermits: SocrataDatasetResult;

  if (pin) {
    [assessed, sales, universe, cookPermits] = await Promise.all([
      fetchCookAssessedValuesByPin(pin),
      fetchCookParcelSalesByPin(pin),
      fetchCookParcelUniverseByPin(pin),
      fetchCookAssessorPermitsByPin(pin),
    ]);
  } else {
    const skip = { status: "not_connected" as const, data: [] as Record<string, unknown>[], message: "" };
    assessed = skip;
    sales = skip;
    universe = skip;
    cookPermits = skip;
  }

  const chicagoPermits: SocrataDatasetResult =
    chicago && parsed
      ? await fetchChicagoBuildingPermitsSample(parsed)
      : { status: "not_connected", data: [], message: "" };

  const zoning = await fetchChicagoZoningLookupPlaceholder();

  const zoningMessage =
    zoning.message +
    (cityscapeConfigured
      ? " (CHICAGO_CITYSCAPE_API_KEY is set for future integration.)"
      : "");

  const cookAssessorRow: DataSourceConnectRow = pin
    ? {
        id: "cook-assessed",
        title: "Cook County Assessor Values",
        description: "Socrata: Assessor assessed values (uzyt-m557).",
        ...mapProbeToUi(assessed),
      }
    : {
        id: "cook-assessed",
        title: "Cook County Assessor Values",
        description: "Socrata: Assessor assessed values (uzyt-m557).",
        uiStatus: "needs_pin",
        detailMessage: PIN_HELP,
      };

  const cookSalesRow: DataSourceConnectRow = pin
    ? {
        id: "cook-sales",
        title: "Cook County Parcel Sales",
        description: "Socrata: Parcel sales / MYDEC (wvhk-k5uv).",
        ...mapProbeToUi(sales),
      }
    : {
        id: "cook-sales",
        title: "Cook County Parcel Sales",
        description: "Socrata: Parcel sales / MYDEC (wvhk-k5uv).",
        uiStatus: "needs_pin",
        detailMessage: PIN_HELP,
      };

  const cookUniverseRow: DataSourceConnectRow = pin
    ? {
        id: "cook-universe",
        title: "Cook County Parcel Universe",
        description: "Socrata: Parcel universe characteristics (nj4t-kc8j).",
        ...mapProbeToUi(universe),
      }
    : {
        id: "cook-universe",
        title: "Cook County Parcel Universe",
        description: "Socrata: Parcel universe characteristics (nj4t-kc8j).",
        uiStatus: "needs_pin",
        detailMessage: PIN_HELP,
      };

  const cookPermitsRow: DataSourceConnectRow = pin
    ? {
        id: "cook-permits",
        title: "Cook County Permits",
        description: "Socrata: Assessor permit index (6yjf-dfxs).",
        ...mapProbeToUi(cookPermits),
      }
    : {
        id: "cook-permits",
        title: "Cook County Permits",
        description: "Socrata: Assessor permit index (6yjf-dfxs).",
        uiStatus: "needs_pin",
        detailMessage: PIN_HELP,
      };

  let chicagoPermitsRow: DataSourceConnectRow;
  if (!il) {
    chicagoPermitsRow = {
      id: "chi-permits",
      title: "Chicago Building Permits",
      description: "Socrata: City of Chicago permits (ydr8-5enu).",
      uiStatus: "not_connected",
      detailMessage: "Illinois-only integration in this build.",
    };
  } else if (!chicago) {
    chicagoPermitsRow = {
      id: "chi-permits",
      title: "Chicago Building Permits",
      description: "Socrata: City of Chicago permits (ydr8-5enu).",
      uiStatus: "not_connected",
      detailMessage: "Chicago permit feed applies to Chicago, IL addresses.",
    };
  } else if (!parsed) {
    chicagoPermitsRow = {
      id: "chi-permits",
      title: "Chicago Building Permits",
      description: "Socrata: City of Chicago permits (ydr8-5enu).",
      uiStatus: "needs_address",
      detailMessage: 'Use a street address like "7529 N Clark St, Chicago, IL".',
    };
  } else {
    chicagoPermitsRow = {
      id: "chi-permits",
      title: "Chicago Building Permits",
      description: "Socrata: City of Chicago permits (ydr8-5enu).",
      ...mapProbeToUi(chicagoPermits),
    };
  }

  const zoningRow: DataSourceConnectRow = {
    id: "chi-zoning",
    title: "Zoning Lookup",
    description: "Future: boundaries / district lookup (no public Socrata probe in this build).",
    uiStatus: zoning.status === "error" ? "error" : "not_connected",
    detailMessage: zoningMessage,
  };

  return [cookAssessorRow, cookSalesRow, cookUniverseRow, cookPermitsRow, chicagoPermitsRow, zoningRow];
}
