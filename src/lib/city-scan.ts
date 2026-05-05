import { getDisplayMetricsForRow } from "@/lib/property-display-metrics";
import type { PropertyRow } from "@/types/property";

export type AssetTypeClass =
  | "multifamily"
  | "industrial"
  | "office"
  | "retail"
  | "hospitality"
  | "mixed_use"
  | "other";

export function classifyAssetTypeFromZoning(zoning: string): AssetTypeClass {
  const z = zoning.toLowerCase();
  if (z.includes("mx") || z.includes("mixed")) return "mixed_use";
  if (z.includes("rm") || z.includes("res") || z.includes("mf")) {
    return "multifamily";
  }
  if (z.includes("ind") || z.includes("m1") || z.includes("m2")) {
    return "industrial";
  }
  if (z.includes("office") || z.includes("o-")) return "office";
  if (z.includes("retail") || z.includes("c-")) return "retail";
  if (z.includes("hotel") || z.includes("h-")) return "hospitality";
  return "other";
}

export function assetTypeLabel(t: AssetTypeClass): string {
  switch (t) {
    case "mixed_use":
      return "Mixed-use";
    case "multifamily":
      return "Multifamily";
    case "industrial":
      return "Industrial";
    case "office":
      return "Office";
    case "retail":
      return "Retail";
    case "hospitality":
      return "Hospitality";
    default:
      return "Other";
  }
}

export type CityGroup = {
  city: string;
  state: string;
  count: number;
  totalPotentialValueUnlocked: number;
  totalUnusedFar: number;
};

export function groupPropertiesByCity(properties: PropertyRow[]): CityGroup[] {
  const map = new Map<string, CityGroup>();
  for (const p of properties) {
    const city = p.city.trim();
    const state = p.state.trim();
    if (!city) continue;
    const key = `${city.toLowerCase()}|${state.toLowerCase()}`;
    const m = getDisplayMetricsForRow(p);
    const current = map.get(key) ?? {
      city,
      state,
      count: 0,
      totalPotentialValueUnlocked: 0,
      totalUnusedFar: 0,
    };
    current.count += 1;
    current.totalPotentialValueUnlocked += m.air_rights_value ?? 0;
    current.totalUnusedFar += m.unused_vertical_capacity;
    map.set(key, current);
  }
  return [...map.values()].sort(
    (a, b) => b.totalPotentialValueUnlocked - a.totalPotentialValueUnlocked,
  );
}

export type CityScanFilters = {
  zoning: string;
  minFar: number | null;
  assetType: AssetTypeClass | "all";
};

export function filterCityProperties(
  rows: PropertyRow[],
  filters: CityScanFilters,
): PropertyRow[] {
  const z = filters.zoning.trim().toLowerCase();
  return rows.filter((p) => {
    if (z && !p.zoning_district.toLowerCase().includes(z)) return false;
    if (filters.minFar != null && Number.isFinite(filters.minFar)) {
      if ((p.max_far ?? 0) < filters.minFar) return false;
    }
    if (filters.assetType !== "all") {
      const inferred = classifyAssetTypeFromZoning(p.zoning_district);
      if (inferred !== filters.assetType) return false;
    }
    return true;
  });
}

export function rankCityOpportunities(rows: PropertyRow[]): PropertyRow[] {
  return [...rows].sort((a, b) => {
    const ma = getDisplayMetricsForRow(a);
    const mb = getDisplayMetricsForRow(b);
    if (mb.unused_buildable_sqft !== ma.unused_buildable_sqft) {
      return mb.unused_buildable_sqft - ma.unused_buildable_sqft;
    }
    const vA = ma.air_rights_value ?? -1;
    const vB = mb.air_rights_value ?? -1;
    if (vB !== vA) return vB - vA;
    return mb.underbuilt_score - ma.underbuilt_score;
  });
}

