import {
  BlueprintLoadingLine,
  BlueprintLoadingSurface,
} from "@/components/states/blueprint-loading-surface";
import { DetailSkeleton } from "@/components/states/table-skeleton";

export default function NewPropertyLoading() {
  return (
    <div className="space-y-10">
      <BlueprintLoadingSurface
        frame
        className="inline-block max-w-xs rounded-lg border border-stone-200/45 px-5 py-4 ring-1 ring-stone-900/[0.025]"
      >
        <BlueprintLoadingLine className="w-40" />
        <BlueprintLoadingLine className="mt-3 w-24" />
      </BlueprintLoadingSurface>
      <DetailSkeleton />
    </div>
  );
}
