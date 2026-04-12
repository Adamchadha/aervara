import { PropertyCard } from "@/components/properties/property-card";
import type { PropertyRow } from "@/types/property";

type TopOpportunitiesProps = {
  properties: PropertyRow[];
};

export function TopOpportunities({ properties }: TopOpportunitiesProps) {
  if (properties.length === 0) return null;

  return (
    <section className="space-y-6" aria-labelledby="top-opportunities-heading">
      <div>
        <h2
          id="top-opportunities-heading"
          className="text-lg font-semibold tracking-tight text-neutral-950"
        >
          Top Opportunities
        </h2>
        <p className="mt-1 text-sm text-neutral-500">
          Ranked by estimated development profit when available; otherwise by
          opportunity value.
        </p>
      </div>
      <div className="grid gap-8 gap-y-10 md:grid-cols-2 xl:grid-cols-3">
        {properties.map((property) => (
          <PropertyCard
            key={property.id}
            property={property}
            emphasize
            highlightLabel="Top deal"
          />
        ))}
      </div>
    </section>
  );
}
