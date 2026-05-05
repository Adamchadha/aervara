import { z } from "zod";
import { DEFAULT_SOFT_COST_PCT } from "@/lib/development-analysis";
import {
  PROPERTY_STATUSES,
  normalizePropertyStatus,
} from "@/lib/property-status";

const statusSchema = z.enum(PROPERTY_STATUSES);

/** Strip currency symbols, commas, and whitespace for numeric coercion. */
export function normalizeNumericInput(raw: unknown): unknown {
  if (raw === null || raw === undefined) return raw;
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  const s = String(raw)
    .trim()
    .replace(/[$€£]/g, "")
    .replace(/\s+/g, "")
    .replace(/,/g, "");
  return s;
}

const optionalPositiveUsd = z.preprocess((raw) => {
  const n = normalizeNumericInput(raw);
  if (n === "" || n === null || n === undefined) return null;
  if (typeof n === "string" && n.trim() === "") return null;
  return typeof n === "string" ? n.trim() : n;
}, z.union([z.coerce.number().positive("Must be a positive number"), z.null()]));

export const propertySchema = z.object({
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zoning_district: z.string().min(1, "Zoning district is required"),
  lot_size_sqft: z.preprocess(
    normalizeNumericInput,
    z.coerce.number().positive("Lot size must be greater than 0"),
  ),
  built_floor_area_sqft: z.preprocess(
    normalizeNumericInput,
    z.coerce.number().min(0, "Built area cannot be negative"),
  ),
  max_far: z.preprocess(
    (raw) => {
      const n = normalizeNumericInput(raw);
      if (n === "" || n === null || n === undefined) return undefined;
      return n;
    },
    z.coerce.number().positive("Max FAR must be greater than 0").optional(),
  ),
  notes: z.string().optional(),
  estimated_value_per_sqft: optionalPositiveUsd,
  construction_cost_per_sqft: optionalPositiveUsd,
  soft_cost_percentage: z.preprocess((raw) => {
    const n = normalizeNumericInput(raw);
    if (n === "" || n === null || n === undefined) {
      return DEFAULT_SOFT_COST_PCT;
    }
    return typeof n === "string" ? n.trim() : n;
  }, z.coerce.number().min(0, "Min 0%").max(100, "Max 100%")),
  exit_value_per_sqft: optionalPositiveUsd,
  status: z.preprocess(
    (raw) => normalizePropertyStatus(raw == null ? undefined : String(raw)),
    statusSchema,
  ),
});

export type ParsedProperty = z.infer<typeof propertySchema>;
