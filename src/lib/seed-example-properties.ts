import { propertySchema, type ParsedProperty } from "@/lib/property-form-schema";
import { buildPropertyInsertRow } from "@/lib/property-insert-row";
import type { PropertyStatus } from "@/lib/property-status";
import {
  URBAN_INFILL_SEED_DATASET,
  type UrbanInfillSeedRecord,
} from "@/lib/seed-urban-infill-dataset";

/**
 * Marker in `notes` — idempotent seed checks this substring only.
 * (Distinct from older demo bundles.)
 */
export const EXAMPLE_SEED_MARKER = "aervara-seed-urban-dev-opportunities-v1";

type SeedInput = {
  address: string;
  city: string;
  state: string;
  zoning_district: string;
  lot_size_sqft: number;
  built_floor_area_sqft: number;
  max_far: number;
  estimated_value_per_sqft: number;
  construction_cost_per_sqft: number;
  soft_cost_percentage: number;
  exit_value_per_sqft: number | null;
  status: PropertyStatus;
  notes: string;
};

const STATUS_CYCLE: readonly PropertyStatus[] = [
  "New",
  "Reviewing",
  "Priority",
  "Reviewing",
];

function urbanRowToSeedInput(
  row: UrbanInfillSeedRecord,
  index: number,
): SeedInput {
  return {
    address: row.address,
    city: row.city,
    state: row.state,
    zoning_district: row.zoning,
    lot_size_sqft: row.lot_size,
    built_floor_area_sqft: row.built_sqft,
    max_far: row.max_far,
    estimated_value_per_sqft: row.est_value_per_sqft,
    construction_cost_per_sqft: 312,
    soft_cost_percentage: 20,
    exit_value_per_sqft: null,
    status: STATUS_CYCLE[index % STATUS_CYCLE.length]!,
    notes: row.notes,
  };
}

const SEED_INPUTS: readonly SeedInput[] = URBAN_INFILL_SEED_DATASET.map(
  urbanRowToSeedInput,
);

function withSeedNote(notes: string): string {
  return `${notes.trim()}\n\n# ${EXAMPLE_SEED_MARKER}`;
}

/** Validates and returns parsed properties ready for `buildPropertyInsertRow`. */
export function getExampleSeedParsedProperties(): ParsedProperty[] {
  const out: ParsedProperty[] = [];
  for (const row of SEED_INPUTS) {
    const parsed = propertySchema.safeParse({
      ...row,
      notes: withSeedNote(row.notes),
    });
    if (!parsed.success) {
      throw new Error(
        `Seed validation failed for ${row.address}: ${parsed.error.message}`,
      );
    }
    out.push(parsed.data);
  }
  return out;
}

export function getExampleSeedRowCount(): number {
  return SEED_INPUTS.length;
}

/** DB rows for Supabase `insert` (service role or user session). */
export function getExampleSeedInsertPayloads(userId: string) {
  return getExampleSeedParsedProperties().map((p) =>
    buildPropertyInsertRow(p, userId),
  );
}
