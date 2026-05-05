import Link from "next/link";
import { PropertyCard } from "@/components/properties/property-card";
import { getPublicDemoProperties } from "@/lib/public-demo-properties";

export default function PublicDemoPage() {
  const rows = getPublicDemoProperties();

  return (
    <div className="mx-auto max-w-6xl space-y-10">
      <header className="space-y-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-400">
          Sample workspace
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-stone-950 sm:text-[2rem]">
          Explore deals
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-stone-600">
          Twelve Chicago and Madison sample parcels — open any card to walk the Site Room.
          Nothing here is saved.
        </p>
        <p className="pt-1 text-sm">
          <Link
            href="/"
            className="font-medium text-stone-700 underline-offset-4 transition-colors hover:text-stone-950 hover:underline"
          >
            ← Back to home
          </Link>
        </p>
      </header>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {rows.map((p) => (
          <PropertyCard
            key={p.id}
            property={p}
            surface="airy"
            detailHref={`/demo/properties/${p.id}`}
          />
        ))}
      </div>
    </div>
  );
}
