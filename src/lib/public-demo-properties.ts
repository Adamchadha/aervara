import type { PropertyStatus } from "@/lib/property-status";
import { getDisplayMetricsForRow } from "@/lib/property-display-metrics";
import { URBAN_INFILL_SEED_DATASET } from "@/lib/seed-urban-infill-dataset";
import type { PropertyRow } from "@/types/property";

/** Canonical hero parcel for `/demo` — must match seed row address. */
export const PUBLIC_DEMO_HERO_ADDRESS = "401 N Wabash Ave" as const;

const DEMO_USER_ID = "00000000-0000-4000-8000-0000000000d0";
const DEMO_TS = "2024-06-01T12:00:00.000Z";

const STATUS_ROTATION: PropertyStatus[] = [
  "New",
  "Reviewing",
  "Priority",
  "Reviewing",
  "New",
  "Priority",
  "Reviewing",
  "New",
  "Priority",
  "Reviewing",
  "New",
  "Passed",
];

function pickChicagoMadisonRows() {
  const allChicago = URBAN_INFILL_SEED_DATASET.filter((r) => r.city === "Chicago");
  const wabash = allChicago.find((r) => r.address === PUBLIC_DEMO_HERO_ADDRESS);
  const restChicago = allChicago
    .filter((r) => r.address !== PUBLIC_DEMO_HERO_ADDRESS)
    .slice(0, 5);
  const chicago =
    wabash != null ? [wabash, ...restChicago] : allChicago.slice(0, 6);
  const madison = URBAN_INFILL_SEED_DATASET.filter((r) => r.city === "Madison").slice(
    0,
    6,
  );
  return [...chicago, ...madison];
}

/**
 * Stored metrics so the public demo hero matches the intended first impression
 * ($100M upside, 200k unused SF, strong underbuilt read) regardless of raw seed geometry.
 */
function applyPublicDemoHeroMetrics(row: PropertyRow): PropertyRow {
  if (row.address !== PUBLIC_DEMO_HERO_ADDRESS) return row;
  const maxFar = Number(row.max_far);
  const current = 1.0;
  const remaining = Math.max(0, maxFar - current);
  return {
    ...row,
    status: "Priority",
    current_built_far: current,
    remaining_far: remaining,
    unused_buildable_sqft: 200_000,
    underbuilt_score: 95,
    opportunity_value: 100_000_000,
  };
}

function sortPublicDemoByOpportunityDesc(rows: PropertyRow[]): PropertyRow[] {
  return [...rows].sort((a, b) => {
    const va = getDisplayMetricsForRow(a).opportunity_value ?? 0;
    const vb = getDisplayMetricsForRow(b).opportunity_value ?? 0;
    return vb - va;
  });
}

function urbanToPropertyRow(
  row: (typeof URBAN_INFILL_SEED_DATASET)[number],
  index: number,
): PropertyRow {
  const id = `demo-${String(index + 1).padStart(3, "0")}`;
  return {
    id,
    user_id: DEMO_USER_ID,
    status: STATUS_ROTATION[index % STATUS_ROTATION.length]!,
    is_premium: false,
    user_submitted: false,
    needs_verification: false,
    approved_by_admin: null,
    approved_at: null,
    address: row.address,
    city: row.city,
    state: row.state,
    zoning_district: row.zoning,
    lot_size_sqft: row.lot_size,
    built_floor_area_sqft: row.built_sqft,
    max_far: row.max_far,
    notes: `${row.notes}\n\n# aervara-public-demo`,
    site_visited_at: null,
    site_visit_notes: null,
    site_visit_checklist: null,
    estimated_value_per_sqft: row.est_value_per_sqft,
    opportunity_value: null,
    current_built_far: null,
    remaining_far: null,
    unused_buildable_sqft: null,
    underbuilt_score: null,
    construction_cost_per_sqft: 312,
    soft_cost_percentage: 20,
    exit_value_per_sqft: null,
    created_at: DEMO_TS,
    updated_at: DEMO_TS,
  };
}

/** 12 sample parcels (6 Chicago + 6 Madison) — no DB; stable IDs `demo-001` … `demo-012`. */
export function getPublicDemoProperties(): PropertyRow[] {
  const mapped = pickChicagoMadisonRows()
    .map(urbanToPropertyRow)
    .map(applyPublicDemoHeroMetrics);
  return sortPublicDemoByOpportunityDesc(mapped);
}

export function getPublicDemoPropertyById(id: string): PropertyRow | null {
  return getPublicDemoProperties().find((p) => p.id === id) ?? null;
}
