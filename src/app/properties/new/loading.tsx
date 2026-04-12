import { DetailSkeleton } from "@/components/states/table-skeleton";

export default function NewPropertyLoading() {
  return (
    <div className="space-y-8">
      <div className="h-6 w-40 animate-pulse rounded bg-neutral-200" />
      <DetailSkeleton />
    </div>
  );
}
