import { TableSkeleton } from "@/components/states/table-skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <div className="h-8 w-48 animate-pulse rounded-md bg-neutral-200" />
          <div className="h-4 w-72 animate-pulse rounded bg-neutral-100" />
        </div>
        <div className="h-10 w-32 animate-pulse rounded-md bg-neutral-200" />
      </div>
      <TableSkeleton rows={8} />
    </div>
  );
}
