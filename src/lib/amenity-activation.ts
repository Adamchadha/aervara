export type AmenityFeasibility = "Low" | "Moderate" | "High";

export type AmenityRentableBasis = "total_buildable" | "unused_buildable";

export type AmenityYieldEstimate = {
  /** Gross rent premium applied per rentable square foot, annualized. */
  premiumPerSqftLow: number;
  premiumPerSqftHigh: number;
  /** Which buildable area was used to scale the effect. */
  rentableBasis: AmenityRentableBasis;
  /** Square feet the premium is multiplied by (from parcel envelope). */
  rentableSqft: number;
  /** Annualized rent effect: low end of range × area. */
  annualNoiUpliftLow: number;
  /** Annualized rent effect: high end of range × area. */
  annualNoiUpliftHigh: number;
};

export type AmenityScenario = {
  id: string;
  name: string;
  description: string;
  valueNote: string;
  feasibility: AmenityFeasibility;
  yield: AmenityYieldEstimate;
};

/** Specified screening tiers for rooftop pickleball / padel-style courts. */
export function courtPairFeasibility(unusedBuildableSqft: number): AmenityFeasibility {
  if (unusedBuildableSqft >= 20_000) return "High";
  if (unusedBuildableSqft >= 10_000) return "Moderate";
  return "Low";
}

function envelopeTier(
  unusedBuildableSqft: number,
  highAt: number,
  moderateAt: number,
): AmenityFeasibility {
  if (unusedBuildableSqft >= highAt) return "High";
  if (unusedBuildableSqft >= moderateAt) return "Moderate";
  return "Low";
}

function buildYield(
  rentableBasis: AmenityRentableBasis,
  totalBuildableSqft: number,
  unusedBuildableSqft: number,
  premiumPerSqftLow: number,
  premiumPerSqftHigh: number,
): AmenityYieldEstimate {
  const rentableSqft =
    rentableBasis === "total_buildable"
      ? Math.max(0, totalBuildableSqft)
      : Math.max(0, unusedBuildableSqft);
  return {
    premiumPerSqftLow,
    premiumPerSqftHigh,
    rentableBasis,
    rentableSqft,
    annualNoiUpliftLow: rentableSqft * premiumPerSqftLow,
    annualNoiUpliftHigh: rentableSqft * premiumPerSqftHigh,
  };
}

export type AmenityBuildInput = {
  unusedBuildableSqft: number;
  /** Lot × max FAR; gross buildable envelope under as-of-right FAR. */
  totalBuildableSqft: number;
};

/**
 * Ordered amenity activation scenarios with institutional copy.
 * Non-court scenarios use conservative unused-area thresholds as an early screen only.
 */
export function buildAmenityScenarios({
  unusedBuildableSqft,
  totalBuildableSqft,
}: AmenityBuildInput): AmenityScenario[] {
  const u = Math.max(0, unusedBuildableSqft);
  const t = Math.max(0, totalBuildableSqft);
  return [
    {
      id: "court",
      name: "Rooftop pickleball / padel courts",
      description:
        "Compact court formats can anchor a rooftop amenity program when clear span, vibration isolation, and vertical circulation can be resolved within the remaining envelope.",
      valueNote:
        "Differentiated outdoor recreation supports renewal economics, lease-up velocity, and resident retention in competitive multifamily and mixed-use settings.",
      feasibility: courtPairFeasibility(u),
      yield: buildYield("total_buildable", t, u, 2, 5),
    },
    {
      id: "wellness",
      name: "Wellness deck / fitness terrace",
      description:
        "Structured outdoor training and recovery zones that pair daylight and air movement with building services and sound separation from residential lines.",
      valueNote:
        "Wellness-forward amenities strengthen net effective rent and reduce churn where tenant experience is a primary leasing argument.",
      feasibility: envelopeTier(u, 16_000, 8_000),
      yield: buildYield("total_buildable", t, u, 1.5, 3),
    },
    {
      id: "lounge",
      name: "Tenant lounge or private club space",
      description:
        "Interior-quality gathering rooms or members-only lounges that extend leasable experience beyond the unit without always adding net-new residential square footage.",
      valueNote:
        "Premium common areas support blended work–residential demand and can improve yield on amenity investment when paired with strong property management.",
      feasibility: envelopeTier(u, 14_000, 7_000),
      yield: buildYield("unused_buildable", t, u, 1, 2),
    },
    {
      id: "dining",
      name: "Outdoor dining / hospitality terrace",
      description:
        "Food service adjacencies with grease, mechanical, and life-safety implications—typically staged as a podium or rooftop terrace with dedicated vertical access.",
      valueNote:
        "Hospitality-led terraces can lift street activation and sponsor longer dwell time, which matters for mixed-use underwriting and retail co-tenancy.",
      feasibility: envelopeTier(u, 13_000, 6_500),
      yield: buildYield("total_buildable", t, u, 1.25, 2.5),
    },
    {
      id: "activation",
      name: "Mixed-use community activation",
      description:
        "Programmable plaza or courtyard space that connects retail, residential, and office frontages—often dependent on easements, loading, and curbside management.",
      valueNote:
        "Shared outdoor rooms can improve placemaking metrics used by municipalities and anchor tenants when entitlement and operations align.",
      feasibility: envelopeTier(u, 15_000, 7_500),
      yield: buildYield("total_buildable", t, u, 0.75, 1.5),
    },
  ];
}
