"use client";

import { useState } from "react";
import { PropertiesMapView } from "@/components/properties/properties-map-view";
import { PropertiesTable } from "@/components/properties/properties-table";
import { cn } from "@/lib/utils";
import type { PropertyRow } from "@/types/property";

type ViewMode = "list" | "map";

type DashboardPropertiesProps = {
  properties: PropertyRow[];
};

export function DashboardProperties({ properties }: DashboardPropertiesProps) {
  const [view, setView] = useState<ViewMode>("list");

  return (
    <div className="space-y-8">
      <div className="inline-flex rounded-lg border border-neutral-200/60 bg-neutral-50/80 p-0.5 shadow-sm">
        <button
          type="button"
          onClick={() => setView("list")}
          className={cn(
            "rounded-md px-4 py-2 text-sm font-medium transition-colors",
            view === "list"
              ? "bg-white text-neutral-950 shadow-sm"
              : "text-neutral-600 hover:text-neutral-950",
          )}
        >
          List view
        </button>
        <button
          type="button"
          onClick={() => setView("map")}
          className={cn(
            "rounded-md px-4 py-2 text-sm font-medium transition-colors",
            view === "map"
              ? "bg-white text-neutral-950 shadow-sm"
              : "text-neutral-600 hover:text-neutral-950",
          )}
        >
          Map view
        </button>
      </div>

      {view === "list" ? (
        <PropertiesTable properties={properties} />
      ) : (
        <PropertiesMapView properties={properties} />
      )}
    </div>
  );
}
