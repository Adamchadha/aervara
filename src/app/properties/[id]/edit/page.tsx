import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PropertyEditForm } from "@/components/properties/property-edit-form";
import type { PropertyRow } from "@/types/property";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditPropertyPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    notFound();
  }

  const property = data as PropertyRow;

  return (
    <div className="space-y-8">
      <div>
        <Link
          href={`/properties/${property.id}`}
          className="text-sm text-neutral-500 transition-colors hover:text-neutral-950"
        >
          ← Back to property
        </Link>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-neutral-950">
          Edit property
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          {property.address} — metrics refresh on save.
        </p>
      </div>
      <PropertyEditForm property={property} />
    </div>
  );
}
