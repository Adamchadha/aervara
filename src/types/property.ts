export type PropertyRow = {
  id: string;
  user_id: string;
  /** Acquisition pipeline: New → Reviewing → Priority → Passed */
  status?: string | null;
  address: string;
  city: string;
  state: string;
  zoning_district: string;
  lot_size_sqft: number;
  built_floor_area_sqft: number;
  max_far: number;
  notes: string | null;
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
