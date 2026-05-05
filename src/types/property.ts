export type PropertyRow = {
  id: string;
  user_id: string;
  /** Acquisition pipeline: New → Reviewing → Priority → Passed */
  status?: string | null;
  /** Elite-only curated opportunities (hidden from Free / Pro in the app). */
  is_premium?: boolean | null;
  /** Intake pipeline: created from user building/data submission form. */
  user_submitted?: boolean | null;
  /** Intake pipeline: awaits admin verification before trusted status. */
  needs_verification?: boolean | null;
  /** Intake pipeline: admin user id that verified this submission. */
  approved_by_admin?: string | null;
  /** Intake pipeline: approval timestamp. */
  approved_at?: string | null;
  address: string;
  city: string;
  state: string;
  zoning_district: string;
  lot_size_sqft: number;
  built_floor_area_sqft: number;
  max_far: number;
  notes: string | null;
  /** In-person site visit stamp (owner-only). */
  site_visited_at?: string | null;
  /** Field observations separate from general property notes. */
  site_visit_notes?: string | null;
  /** Checklist completion map for Site Visit Mode. */
  site_visit_checklist?: Record<string, boolean> | null;
  estimated_value_per_sqft: number | null;
  opportunity_value: number | null;
  current_built_far: number | null;
  remaining_far: number | null;
  unused_buildable_sqft: number | null;
  underbuilt_score: number | null;
  construction_cost_per_sqft: number | null;
  soft_cost_percentage: number | null;
  exit_value_per_sqft: number | null;
  created_at: string;
  updated_at: string;
  /** Optional future columns for record linking / verification (safe when absent). */
  parcel_id_apn?: string | null;
  parcel_pin_apn?: string | null;
  parcel_pin?: string | null;
  apn?: string | null;
  parcel_geometry_verified_at?: string | null;
  geometry_source?: string | null;
  height_limit_ft?: number | null;
  allowed_use?: string | null;
  use_class?: string | null;
  assessed_land_value?: number | null;
  assessed_improvement_value?: number | null;
  last_sale_price?: number | null;
  last_sale_date?: string | null;
  owner_name?: string | null;
  data_source?: string | null;
  last_verified_date?: string | null;
  lot_width_ft?: number | null;
  lot_depth_ft?: number | null;
};

export type PropertyInput = {
  address: string;
  city: string;
  state: string;
  zoning_district: string;
  lot_size_sqft: number;
  built_floor_area_sqft: number;
  max_far: number;
  notes: string | null;
  estimated_value_per_sqft: number | null;
  construction_cost_per_sqft: number | null;
  soft_cost_percentage: number;
  exit_value_per_sqft: number | null;
};
