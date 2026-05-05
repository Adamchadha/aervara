"use client";

import { useCallback, useMemo, useState } from "react";
import { PropertiesMapView } from "@/components/properties/properties-map-view";
import { PropertiesPipelineToolbar } from "@/components/properties/properties-pipeline-toolbar";
import { PropertiesTable } from "@/components/properties/properties-table";
import {
  filterPipelineProperties,
  sortPipelineProperties,
  uniqueStatesFromProperties,
  type PipelineSortKey,
} from "@/lib/pipeline-properties";
import { selectTopOpportunities } from "@/lib/top-opportunities";
import { cn } from "@/lib/utils";
import type { PropertyRow } from "@/types/property";

type ViewMode = "list" | "map";

type DashboardPropertiesProps = {
  properties: PropertyRow[];
  isDemo?: boolean;
  publicDemo?: boolean;
};

export function DashboardProperties({
  properties,
  isDemo = false,
  publicDemo = false,
}: DashboardPropertiesProps) {
  const [view, setView] = useState<ViewMode>("list");
  const [cityFilter, setCityFilter] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [zoningFilter, setZoningFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sort, setSort] = useState<PipelineSortKey>("opportunity");

  const filters = useMemo(
    () => ({
      city: cityFilter,
      state: stateFilter,
      zoning: zoningFilter,
      status: statusFilter,
    }),
    [cityFilter, stateFilter, zoningFilter, statusFilter],
  );

  const filtered = useMemo(
    () => filterPipelineProperties(properties, filters),
    [properties, filters],
  );

  const sorted = useMemo(
    () => sortPipelineProperties(filtered, sort),
    [filtered, sort],
  );

  const stateOptions = useMemo(
    () => uniqueStatesFromProperties(properties),
    [properties],
  );

  const hasActiveFilters =
    cityFilter.trim() !== "" ||
    stateFilter.trim() !== "" ||
    zoningFilter.trim() !== "" ||
    statusFilter !== "";

  const clearFilters = useCallback(() => {
    setCityFilter("");
    setStateFilter("");
    setZoningFilter("");
    setStatusFilter("");
  }, []);

  const topDealIds = useMemo(() => {
    const top = selectTopOpportunities(filtered, 3);
    return new Set(top.map((p) => p.id));
  }, [filtered]);

  return (
    <section className="space-y-6 border-t border-stone-300/45 pt-10 sm:space-y-7 sm:pt-11">
      <div>
        <p className="text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-neutral-400">
          Full pipeline
        </p>
        <h2 className="mt-2 text-xl font-bold tracking-[-0.03em] text-neutral-950 sm:text-2xl">
          Pipeline
        </h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-neutral-500">
          Filter and open any parcel for full diligence.
        </p>
      </div>

      <div className="inline-flex rounded-full bg-stone-100/70 p-1 ring-1 ring-stone-900/[0.03]">
        <button
          type="button"
          onClick={() => setView("list")}
          className={cn(
            "rounded-full px-5 py-2 text-sm font-medium transition-[color,background-color] duration-300 ease-out",
            view === "list"
              ? "bg-white text-neutral-950 shadow-sm"
              : "text-neutral-500 hover:text-neutral-800",
          )}
        >
          List
        </button>
        <button
          type="button"
          onClick={() => setView("map")}
          className={cn(
            "rounded-full px-5 py-2 text-sm font-medium transition-[color,background-color] duration-300 ease-out",
            view === "map"
              ? "bg-white text-neutral-950 shadow-sm"
              : "text-neutral-500 hover:text-neutral-800",
          )}
        >
          Map
        </button>
      </div>

      <div className="rounded-xl border border-stone-300/45 bg-white/65 px-3 py-3 ring-1 ring-stone-900/[0.025] sm:px-4">
        <PropertiesPipelineToolbar
          cityFilter={cityFilter}
          onCityChange={setCityFilter}
          stateFilter={stateFilter}
          onStateChange={setStateFilter}
          zoningFilter={zoningFilter}
          onZoningChange={setZoningFilter}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          sort={sort}
          onSortChange={setSort}
          stateOptions={stateOptions}
          filteredCount={filtered.length}
          totalCount={properties.length}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={clearFilters}
          showSort={view === "list"}
        />
      </div>

      <div key={view} className="aervara-view-swap-in">
        {view === "list" ? (
          <PropertiesTable
            displayProperties={sorted}
            totalPipelineCount={properties.length}
            topDealPropertyIds={topDealIds}
            isDemo={isDemo}
            publicDemo={publicDemo}
          />
        ) : (
          <PropertiesMapView
            properties={filtered}
            totalPipelineCount={properties.length}
            topDealPropertyIds={topDealIds}
            isDemo={isDemo}
            publicDemo={publicDemo}
          />
        )}
      </div>
    </section>
  );
}
