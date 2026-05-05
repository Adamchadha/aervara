import { getDisplayMetricsForRow } from "@/lib/property-display-metrics";
import { normalizePropertyStatus } from "@/lib/property-status";
import type { PropertyRow } from "@/types/property";

export type PipelineSortKey =
  | "opportunity"
  | "underbuilt"
  | "unused"
  | "newest";

export type PipelineFilters = {
  city: string;
  state: string;
  zoning: string;
  status: string;
};

export function filterPipelineProperties(
  properties: PropertyRow[],
  filters: PipelineFilters,
): PropertyRow[] {
  const c = filters.city.trim().toLowerCase();
  const s = filters.state.trim();
  const z = filters.zoning.trim().toLowerCase();
  return properties.filter((p) => {
    if (c && !p.city.toLowerCase().includes(c)) return false;
    if (s && p.state !== s) return false;
    if (z && !p.zoning_district.toLowerCase().includes(z)) return false;
    if (
      filters.status &&
      normalizePropertyStatus(p.status) !== filters.status
    ) {
      return false;
    }
    return true;
  });
}

export function sortPipelineProperties(
  list: PropertyRow[],
  sort: PipelineSortKey,
): PropertyRow[] {
  const out = [...list];
  const score = (p: PropertyRow) =>
    getDisplayMetricsForRow(p).underbuilt_score;
  const opp = (p: PropertyRow) => getDisplayMetricsForRow(p).opportunity_value;
  const unused = (p: PropertyRow) =>
    getDisplayMetricsForRow(p).unused_buildable_sqft;
  const time = (p: PropertyRow) => new Date(p.created_at).getTime();

  out.sort((a, b) => {
    if (sort === "newest") return time(b) - time(a);
    if (sort === "underbuilt") return score(b) - score(a);
    if (sort === "unused") return unused(b) - unused(a);
    const ob = opp(b);
    const oa = opp(a);
    if (ob == null && oa == null) return time(b) - time(a);
    if (ob == null) return 1;
    if (oa == null) return -1;
    return ob - oa;
  });
  return out;
}

export function uniqueStatesFromProperties(
  properties: PropertyRow[],
): string[] {
  const set = new Set(properties.map((p) => p.state.trim()).filter(Boolean));
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

export { PROPERTY_STATUSES } from "@/lib/property-status";
