import type { PropertyStatus } from "@/lib/property-status";
import { URBAN_INFILL_SEED_DATASET } from "@/lib/seed-urban-infill-dataset";
import type { PropertyRow } from "@/types/property";

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
  const chicago = URBAN_INFILL_SEED_DATASET.filter((r) => r.city === "Chicago").slice(
    0,
    6,
  );
  const madison = URBAN_INFILL_SEED_DATASET.filter((r) => r.city === "Madison").slice(
    0,
    6,
  );
  return [...chicago, ...madison];
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
  return pickChicagoMadisonRows().map(urbanToPropertyRow);
}

export function getPublicDemoPropertyById(id: string): PropertyRow | null {
  return getPublicDemoProperties().find((p) => p.id === id) ?? null;
}
