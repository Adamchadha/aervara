"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  PROPERTY_STATUSES,
  type PipelineSortKey,
} from "@/lib/pipeline-properties";

type PropertiesPipelineToolbarProps = {
  cityFilter: string;
  onCityChange: (v: string) => void;
  stateFilter: string;
  onStateChange: (v: string) => void;
  zoningFilter: string;
  onZoningChange: (v: string) => void;
  statusFilter: string;
  onStatusChange: (v: string) => void;
  sort: PipelineSortKey;
  onSortChange: (v: PipelineSortKey) => void;
  stateOptions: string[];
  filteredCount: number;
  totalCount: number;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  /** List view shows sort; map ignores it but we keep one control surface. */
  showSort?: boolean;
};

export function PropertiesPipelineToolbar({
  cityFilter,
  onCityChange,
  stateFilter,
  onStateChange,
  zoningFilter,
  onZoningChange,
  statusFilter,
  onStatusChange,
  sort,
  onSortChange,
  stateOptions,
  filteredCount,
  totalCount,
  hasActiveFilters,
  onClearFilters,
  showSort = true,
}: PropertiesPipelineToolbarProps) {
  const fieldChrome = cn(
    "border-stone-100/80 bg-stone-50/35 shadow-none",
    "transition-[border-color,box-shadow,background-color] duration-300 ease-out",
    "hover:border-stone-200/70 hover:bg-white",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600/20 focus-visible:ring-offset-0",
  );
  const selectClass = cn(
    "flex h-11 w-full rounded-xl border px-3.5 text-sm text-neutral-950",
    "active:scale-[0.99] motion-reduce:active:scale-100",
    fieldChrome,
  );
  const inputClass = cn(
    "h-11 rounded-xl border",
    "placeholder:text-neutral-400",
    "focus-visible:border-stone-200/80",
    fieldChrome,
  );

  return (
    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
      <div
        className={
          showSort
            ? "grid w-full gap-3 sm:grid-cols-2 lg:max-w-5xl lg:grid-cols-5"
            : "grid w-full gap-3 sm:grid-cols-2 lg:max-w-4xl lg:grid-cols-4"
        }
      >
        <div className="space-y-2">
          <Label
            className="text-xs font-medium text-neutral-500"
            htmlFor="filter-city"
          >
            City
          </Label>
          <Input
            id="filter-city"
            className={inputClass}
            value={cityFilter}
            onChange={(e) => onCityChange(e.target.value)}
            placeholder="Filter by city"
          />
        </div>
        <div className="space-y-2">
          <Label
            className="text-xs font-medium text-neutral-500"
            htmlFor="filter-state"
          >
            State
          </Label>
          <select
            id="filter-state"
            value={stateFilter}
            onChange={(e) => onStateChange(e.target.value)}
            className={selectClass}
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
          <Label
            className="text-xs font-medium text-neutral-500"
            htmlFor="filter-zoning"
          >
            Zoning district
          </Label>
          <Input
            id="filter-zoning"
            className={inputClass}
            value={zoningFilter}
            onChange={(e) => onZoningChange(e.target.value)}
            placeholder="Contains…"
          />
        </div>
        <div className="space-y-2">
          <Label
            className="text-xs font-medium text-neutral-500"
            htmlFor="filter-status"
          >
            Pipeline status
          </Label>
          <select
            id="filter-status"
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            className={selectClass}
          >
            <option value="">All statuses</option>
            {PROPERTY_STATUSES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>
        {showSort ? (
          <div className="space-y-2">
            <Label
              className="text-xs font-medium text-neutral-500"
              htmlFor="sort"
            >
              Sort by
            </Label>
            <select
              id="sort"
              value={sort}
              onChange={(e) =>
                onSortChange(e.target.value as PipelineSortKey)
              }
              className={selectClass}
            >
              <option value="opportunity">Highest opportunity value</option>
              <option value="underbuilt">Highest Underbuilt score</option>
              <option value="unused">Largest unused buildable area</option>
              <option value="newest">Newest</option>
            </select>
          </div>
        ) : null}
      </div>
      <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-end">
        <p className="text-sm font-normal tabular-nums text-neutral-500">
          {filteredCount} of {totalCount} properties
        </p>
        {hasActiveFilters ? (
          <Button
            type="button"
            variant="secondary"
            className="shrink-0 sm:w-auto"
            onClick={onClearFilters}
          >
            Clear filters
          </Button>
        ) : null}
      </div>
    </div>
  );
}
