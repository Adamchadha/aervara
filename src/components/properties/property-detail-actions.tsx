"use client";

import { useTransition } from "react";
import Link from "next/link";
import { deleteProperty } from "@/app/properties/actions";
import { Button } from "@/components/ui/button";

type PropertyDetailActionsProps = {
  propertyId: string;
};

export function PropertyDetailActions({ propertyId }: PropertyDetailActionsProps) {
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    if (
      !window.confirm(
        "Delete this property? This cannot be undone.",
      )
    ) {
      return;
    }
    startTransition(async () => {
      const result = await deleteProperty(propertyId);
      if (result?.success === false) {
        window.alert(result.message);
      }
    });
  }

  return (
    <div className="flex flex-wrap gap-3">
      <Button variant="secondary" asChild>
        <Link href={`/properties/${propertyId}/edit`}>Edit property</Link>
      </Button>
      <Button
        type="button"
        variant="destructive"
        disabled={pending}
        onClick={handleDelete}
      >
        {pending ? "Deleting…" : "Delete property"}
      </Button>
    </div>
  );
}
