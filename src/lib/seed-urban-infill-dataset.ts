/**
 * Urban development opportunity seed records (portable JS shape).
 *
 * DB mapping (see `seed-example-properties.ts`):
 *   zoning → zoning_district
 *   lot_size → lot_size_sqft
 *   built_sqft → built_floor_area_sqft
 *   est_value_per_sqft → estimated_value_per_sqft
 *
 * Every row satisfies: built_sqft < lot_size * max_far (modeled unused buildable > 0).
 */

export type UrbanInfillSeedRecord = {
  address: string;
  city: string;
  state: string;
  zoning: string;
  lot_size: number;
  built_sqft: number;
  max_far: number;
  est_value_per_sqft: number;
  notes: string;
};

/** 22 mid-to-high value infill / mixed-use / commercial / parking-adjacent sites. */
export const URBAN_INFILL_SEED_DATASET: readonly UrbanInfillSeedRecord[] = [
  // —— Madison, WI — downtown + Capitol + near campus
  {
    address: "1 S Webster St",
    city: "Madison",
    state: "WI",
    zoning: "DX-7 (Downtown Mixed)",
    lot_size: 14400,
    built_sqft: 3200,
    max_far: 7.2,
    est_value_per_sqft: 198,
    notes:
      "Surface parking / low cover — exceptional unused FAR envelope steps from Capitol Square.",
  },
  {
    address: "17 S Carroll St",
    city: "Madison",
    state: "WI",
    zoning: "MXD",
    lot_size: 6200,
    built_sqft: 10500,
    max_far: 5.5,
    est_value_per_sqft: 208,
    notes:
      "Older low-rise retail under a high downtown FAR cap — strong vertical mixed-use story.",
  },
  {
    address: "425 W Washington Ave",
    city: "Madison",
    state: "WI",
    zoning: "MXD",
    lot_size: 9800,
    built_sqft: 8800,
    max_far: 4.0,
    est_value_per_sqft: 222,
    notes:
      "Isthmus corridor office over retail — meaningful residual buildable vs current bulk.",
  },
  {
    address: "214 State St",
    city: "Madison",
    state: "WI",
    zoning: "PD (Planned Development Overlay)",
    lot_size: 5200,
    built_sqft: 16800,
    max_far: 5.8,
    est_value_per_sqft: 192,
    notes:
      "Pedestrian retail block; PD allows taller envelope — underbuilt vs allowed intensity.",
  },
  {
    address: "111 N Hamilton St",
    city: "Madison",
    state: "WI",
    zoning: "C2 (General Commercial)",
    lot_size: 7600,
    built_sqft: 2100,
    max_far: 3.8,
    est_value_per_sqft: 176,
    notes:
      "Parking-adjacent commercial parcel — low existing floor area vs generous C2 FAR.",
  },
  {
    address: "333 E Campus Mall",
    city: "Madison",
    state: "WI",
    zoning: "UMX",
    lot_size: 22000,
    built_sqft: 48000,
    max_far: 2.4,
    est_value_per_sqft: 78,
    notes:
      "Large-format campus retail shell — tight but positive headroom; rate reflects student market.",
  },
  {
    address: "702 University Ave",
    city: "Madison",
    state: "WI",
    zoning: "MXD",
    lot_size: 16500,
    built_sqft: 22000,
    max_far: 3.2,
    est_value_per_sqft: 96,
    notes:
      "University corridor mid-rise — additional stories supported by unused envelope.",
  },
  {
    address: "925 Regent St",
    city: "Madison",
    state: "WI",
    zoning: "TR-U2 / MXD",
    lot_size: 9800,
    built_sqft: 14000,
    max_far: 2.5,
    est_value_per_sqft: 112,
    notes:
      "Campus-edge multifamily over retail — moderate upside; good pipeline comp.",
  },
  {
    address: "1800 Atwood Ave",
    city: "Madison",
    state: "WI",
    zoning: "C1 (Neighborhood Commercial)",
    lot_size: 11200,
    built_sqft: 8800,
    max_far: 2.2,
    est_value_per_sqft: 88,
    notes:
      "Neighborhood commercial strip — underbuilt single-story retail with FAR room.",
  },
  {
    address: "1 W Gilman St",
    city: "Madison",
    state: "WI",
    zoning: "DX-8",
    lot_size: 5800,
    built_sqft: 6800,
    max_far: 7.0,
    est_value_per_sqft: 232,
    notes:
      "Capitol-view infill — very high allowed intensity vs modest existing mid-rise bulk.",
  },
  {
    address: "651 Williamson St",
    city: "Madison",
    state: "WI",
    zoning: "MXD",
    lot_size: 7800,
    built_sqft: 6200,
    max_far: 3.6,
    est_value_per_sqft: 128,
    notes:
      "Marquette neighborhood mixed-use — older low-rise; density upside on corner lot.",
  },
  // —— Chicago, IL — Loop, West Loop, River North
  {
    address: "8 E Randolph St",
    city: "Chicago",
    state: "IL",
    zoning: "DX-12",
    lot_size: 5400,
    built_sqft: 42000,
    max_far: 12.0,
    est_value_per_sqft: 292,
    notes:
      "Loop tower site — massive allowed FAR; existing high-rise still leaves modeled residual.",
  },
  {
    address: "500 N LaSalle Dr",
    city: "Chicago",
    state: "IL",
    zoning: "DX-16",
    lot_size: 12800,
    built_sqft: 98000,
    max_far: 14.5,
    est_value_per_sqft: 288,
    notes:
      "River North super-block — among the highest opportunity values in the seed set.",
  },
  {
    address: "350 N Orleans St",
    city: "Chicago",
    state: "IL",
    zoning: "DX-10",
    lot_size: 10200,
    built_sqft: 12500,
    max_far: 6.5,
    est_value_per_sqft: 268,
    notes:
      "River North parking / low-rise assembly — huge unused buildable vs current cover.",
  },
  {
    address: "737 W Washington Blvd",
    city: "Chicago",
    state: "IL",
    zoning: "DX-7",
    lot_size: 14200,
    built_sqft: 18500,
    max_far: 5.2,
    est_value_per_sqft: 242,
    notes:
      "West Loop Fulton corridor — creative office loft underbuilt vs DX envelope.",
  },
  {
    address: "1000 W Fulton Market",
    city: "Chicago",
    state: "IL",
    zoning: "M2-3 / DX-5 PD",
    lot_size: 18600,
    built_sqft: 24000,
    max_far: 6.5,
    est_value_per_sqft: 258,
    notes:
      "Fulton Market innovation / light industrial conversion — flagship residual FAR.",
  },
  {
    address: "123 N Peoria St",
    city: "Chicago",
    state: "IL",
    zoning: "DX-5",
    lot_size: 9800,
    built_sqft: 11200,
    max_far: 5.8,
    est_value_per_sqft: 248,
    notes:
      "West Loop infill — mid-rise over retail; strong unused envelope for residential over base.",
  },
  {
    address: "564 W Randolph St",
    city: "Chicago",
    state: "IL",
    zoning: "DX-7",
    lot_size: 7200,
    built_sqft: 9600,
    max_far: 7.0,
    est_value_per_sqft: 238,
    notes:
      "Restaurant row — older 2–4 story building in a very high-FAR restaurant district.",
  },
  {
    address: "401 N Wabash Ave",
    city: "Chicago",
    state: "IL",
    zoning: "DX-10",
    lot_size: 6200,
    built_sqft: 3800,
    max_far: 8.5,
    est_value_per_sqft: 318,
    notes:
      "River North surface lot / single-story retail — extremely high modeled land lift.",
  },
  {
    address: "720 N State St",
    city: "Chicago",
    state: "IL",
    zoning: "B3-5",
    lot_size: 8400,
    built_sqft: 10200,
    max_far: 4.2,
    est_value_per_sqft: 198,
    notes:
      "Near North retail podium — underbuilt vs allowed mid/high-rise commercial FAR.",
  },
  {
    address: "155 N Wacker Dr",
    city: "Chicago",
    state: "IL",
    zoning: "DX-14",
    lot_size: 15000,
    built_sqft: 120000,
    max_far: 15.0,
    est_value_per_sqft: 308,
    notes:
      "West Loop / CBD edge tower assemblage — very large allowed floor area vs existing tower.",
  },
  {
    address: "210 N Green St",
    city: "Chicago",
    state: "IL",
    zoning: "DX-5",
    lot_size: 10800,
    built_sqft: 14200,
    max_far: 5.5,
    est_value_per_sqft: 252,
    notes:
      "West Loop residential over parking podium — additional stories implied by unused FAR.",
  },
];
