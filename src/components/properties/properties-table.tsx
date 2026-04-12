"use client";

import { useCallback, useMemo, useState } from "react";
import { getDisplayMetricsForRow } from "@/lib/property-display-metrics";
import {
  PROPERTY_STATUSES,
  normalizePropertyStatus,
} from "@/lib/property-status";
import type { PropertyRow } from "@/types/property";
import { PropertyCard } from "@/components/properties/property-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type SortKey =
  | "opportunity"
  | "underbuilt"
  | "unused"
  | "newest";

type PropertiesTableProps = {
  properties: PropertyRow[];
};

export function PropertiesTable({ properties }: PropertiesTableProps) {
  const [cityFilter, setCityFilter] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [zoningFilter, setZoningFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sort, setSort] = useState<SortKey>("opportunity");

  const stateOptions = useMemo(() => {
    const set = new Set(
      properties.map((p) => p.state.trim()).filter(Boolean),
    );
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [properties]);

  const filtered = useMemo(() => {
    const c = cityFilter.trim().toLowerCase();
    const s = stateFilter.trim();
    const z = zoningFilter.trim().toLowerCase();
    return properties.filter((p) => {
      if (c && !p.city.toLowerCase().includes(c)) return false;
      if (s && p.state !== s) return false;
      if (z && !p.zoning_district.toLowerCase().includes(z)) return false;
      if (statusFilter && normalizePropertyStatus(p.status) !== statusFilter) {
        return false;
      }
      return true;
    });
  }, [properties, cityFilter, stateFilter, zoningFilter, statusFilter]);

  const sorted = useMemo(() => {
    const list = [...filtered];
    const score = (p: PropertyRow) =>
      getDisplayMetricsForRow(p).underbuilt_score;
    const opp = (p: PropertyRow) =>
      getDisplayMetricsForRow(p).opportunity_value;
    const unused = (p: PropertyRow) =>
      getDisplayMetricsForRow(p).unused_buildable_sqft;
    const time = (p: PropertyRow) => new Date(p.created_at).getTime();

    list.sort((a, b) => {
      if (sort === "newest") return time(b) - time(a);
      if (sort === "underbuilt") return score(b) - score(a);
      if (sort === "unused") return unused(b) - unused(a);
      const ob = opp(b);
      const oa = opp(a);
      if (ob == null && oa == null) return time(b) - time(a);
      if (ob == null) return 1;
      if (oa == null) return -1;
      return ob - oa;
    });
    return list;
  }, [filtered, sort]);

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

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="grid w-full gap-4 sm:grid-cols-2 lg:max-w-5xl lg:grid-cols-5">
          <div className="space-y-2">
            <Label htmlFor="filter-city">City</Label>
            <Input
              id="filter-city"
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              placeholder="Filter by city"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="filter-state">State</Label>
            <select
              id="filter-state"
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 text-sm text-neutral-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-1"
            >
              <option value="">All states</option>
              {stateOptions.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="filter-zoning">Zoning district</Label>
            <Input
              id="filter-zoning"
              value={zoningFilter}
              onChange={(e) => setZoningFilter(e.target.value)}
              placeholder="Contains…"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="filter-status">Pipeline status</Label>
            <select
              id="filter-status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 text-sm text-neutral-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-1"
            >
              <option value="">All statuses</option>
              {PROPERTY_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="sort">Sort by</Label>
            <select
              id="sort"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 text-sm text-neutral-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-1"
            >
              <option value="opportunity">Highest opportunity value</option>
              <option value="underbuilt">Highest Underbuilt score</option>
              <option value="unused">Largest unused buildable area</option>
              <option value="newest">Newest</option>
            </select>
          </div>
        </div>
        <p className="text-sm tabular-nums text-neutral-500">
          {sorted.length} of {properties.length} properties
        </p>
      </div>

      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-200/90 bg-white px-8 py-20 text-center shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-neutral-950/[0.03]">
          <p className="text-base font-semibold tracking-tight text-neutral-950">
            No matching properties
          </p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-neutral-500">
            {properties.length === 0
              ? "Add a parcel to model FAR headroom and implied value—it will show up here."
              : "No parcels match these filters. Adjust city, state, zoning, or pipeline status—or clear filters to see your full list."}
          </p>
          {hasActiveFilters && properties.length > 0 ? (
            <Button
              type="button"
              variant="secondary"
              className="mt-8"
              onClick={clearFilters}
            >
              Clear filters
            </Button>
          ) : null}
        </div>
      ) : (
        <ul className="grid gap-8 gap-y-10 lg:grid-cols-2">
          {sorted.map((p) => (
            <li key={p.id}>
              <PropertyCard property={p} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
