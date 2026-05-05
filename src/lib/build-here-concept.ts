import { computeFarMetrics } from "@/lib/far-calculations";
import { getDisplayMetricsForRow } from "@/lib/property-display-metrics";
import { getZoningFlags } from "@/lib/opportunity-engine";
import type { PropertyRow } from "@/types/property";

function num(v: unknown): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

function clamp(n: number, lo: number, hi: number): number {
  if (!Number.isFinite(n)) return lo;
  return Math.min(hi, Math.max(lo, n));
}

function isResidentialZoning(z: string): boolean {
  return /\b(r\d|rm\d?|res|residential|multi|multifamily|mf|apt|apartment|rsa|rd-|rg|rh|rz|townhouse|th-|duplex)\b/i.test(
    z,
  );
}

function isOfficeCommercialZoning(z: string): boolean {
  return /\b(c\d|cm|commercial|office|cb|core|biz|b\d|retail)\b/i.test(z);
}

function isIndustrialZoning(z: string): boolean {
  return /\b(m\d|industrial|manufacturing|warehouse|flex)\b/i.test(z);
}

export type BuildHereConcept = {
  buildingType: string;
  estimatedFloors: number;
  unitCount: number | null;
  useMix: string;
  explanation: string;
};

/** Typical net-to-gross for leasable residential in a wrapped building. */
const RESIDENTIAL_NET_RATIO = 0.82;
const MIXED_USE_RESIDENTIAL_RATIO = 0.62;
const AVG_UNIT_SQFT = 880;
/** Assumed average floor plate as share of lot (GFA per story / lot). */
const TYPICAL_COVERAGE_RATIO = 0.68;

/**
 * Heuristic “what would you build?” read from FAR, lot, zoning, and slack.
 * Pure function — not persisted.
 */
export function getBuildHereConcept(p: PropertyRow): BuildHereConcept {
  const lot = Math.max(0, num(p.lot_size_sqft));
  const built = Math.max(0, num(p.built_floor_area_sqft));
  const maxFar = Math.max(0, num(p.max_far));
  const zoning = p.zoning_district ?? "";
  const z = zoning.trim();
  const { mixedUse, unknownOrAmbiguous } = getZoningFlags(zoning);
  const m = getDisplayMetricsForRow(p);
  const unused = Math.max(0, m.unused_buildable_sqft);
  const farMetrics = computeFarMetrics(lot, built, maxFar);
  const maxBuildable = farMetrics.max_buildable_sqft;

  const floorsRaw =
    lot > 0 && maxFar > 0 ? maxFar / TYPICAL_COVERAGE_RATIO : 1;
  const estimatedFloors = clamp(Math.round(floorsRaw), 1, 36);

  const lowFar = maxFar > 0 && maxFar < 1.35;
  const midFar = maxFar >= 1.35 && maxFar < 3.5;
  const highFar = maxFar >= 3.5;

  const residential = isResidentialZoning(z);
  const officeish = isOfficeCommercialZoning(z);
  const industrial = isIndustrialZoning(z);

  let buildingType: string;
  let useMix: string;
  let residentialLed = false;

  if (unknownOrAmbiguous || z.length < 2) {
    buildingType = "Infill or expansion (confirm zoning with counsel)";
    useMix = "Use mix depends on confirmed district and overlays";
    residentialLed = midFar || highFar;
  } else if (industrial && !residential) {
    buildingType = "Light industrial, flex, or warehouse-adaptive reuse";
    useMix = "Industrial / logistics or creative flex; residential only if rezoning";
    residentialLed = false;
  } else if (mixedUse && highFar) {
    buildingType = "Mixed-use mid-rise (retail or services + housing)";
    useMix = "Street-level retail or services with residential or office above";
    residentialLed = true;
  } else if (mixedUse && (midFar || lowFar)) {
    buildingType = "Low-rise mixed-use";
    useMix = "Ground-floor commercial with modest residential or office stack";
    residentialLed = true;
  } else if (residential && highFar) {
    buildingType = "Mid-rise multifamily";
    useMix = "Primarily residential; possible amenity or corner retail if allowed";
    residentialLed = true;
  } else if (residential && (midFar || lowFar)) {
    buildingType = "Low-rise multifamily or townhomes";
    useMix = "Stacked flats or townhouse-style units; limited commercial";
    residentialLed = true;
  } else if (officeish && !residential) {
    buildingType =
      midFar || highFar
        ? "Mid-rise office or commercial podium"
        : "Low-rise office or retail";
    useMix =
      "Office-led or retail/service; conversion to residential may require entitlement";
    residentialLed = false;
  } else if (lowFar && !mixedUse) {
    buildingType = "Single- or two-story retail, office, or services";
    useMix = "Shallow envelope—focus on small-bay retail, medical, or neighborhood office";
    residentialLed = false;
  } else {
    buildingType = highFar
      ? "Multifamily or mixed-use mid-rise infill"
      : "Multifamily or small-scale mixed-use infill";
    useMix = "Residential-weighted with opportunistic ground-floor use where code allows";
    residentialLed = true;
  }

  const resRatio = mixedUse ? MIXED_USE_RESIDENTIAL_RATIO : RESIDENTIAL_NET_RATIO;
  const residentialGfa = residentialLed ? maxBuildable * resRatio : 0;
  const unitCount =
    residentialLed && residentialGfa > 2_000
      ? clamp(Math.round(residentialGfa / AVG_UNIT_SQFT), 4, 450)
      : null;

  const headroomPct =
    maxFar > 0 ? clamp((unused / Math.max(1, maxBuildable)) * 100, 0, 100) : 0;

  const explanation = [
    `At roughly ${estimatedFloors} above-grade floors implied by max FAR (${maxFar.toFixed(2)}) and a typical ${Math.round(TYPICAL_COVERAGE_RATIO * 100)}% lot coverage per story, the as-of-right envelope is about ${Math.round(maxBuildable).toLocaleString("en-US")} sq ft on this ${Math.round(lot).toLocaleString("en-US")} sq ft lot.`,
    headroomPct >= 35
      ? `You still have ~${Math.round(headroomPct)}% of that envelope as unused buildable area—room to grow vertically or expand the floor plate before hitting the cap.`
      : headroomPct >= 12
        ? "Remaining slack is moderate; additions are likely surgical rather than a full high-rise program."
        : "The site is relatively built-out under the modeled FAR—value may lean on renovation, use change, or a modest vertical bump if allowed.",
  ].join(" ");

  return {
    buildingType,
    estimatedFloors,
    unitCount,
    useMix,
    explanation,
  };
}
