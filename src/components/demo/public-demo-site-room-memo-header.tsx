import { DemoPipelineStatus } from "@/components/demo/demo-pipeline-status";
import { PropertySiteRoomActions } from "@/components/properties/property-site-room-actions";
import type { DealReportPayload } from "@/types/deal-report-payload";
import type { PropertyRow } from "@/types/property";

/**
 * Authenticated Site Room memo shell for public `/demo/properties/:id` —
 * white identity column + navy “Investment memo controls” rail.
 */
export function PublicDemoSiteRoomMemoHeader({
  property: p,
  dealReportPayload,
  initialPipelineStatus,
}: {
  property: PropertyRow;
  dealReportPayload: DealReportPayload;
  initialPipelineStatus: PropertyRow["status"];
}) {
  return (
    <header
      id="site-room"
      className="relative mx-auto w-full max-w-5xl scroll-mt-24 overflow-hidden rounded-[2rem] border border-stone-200/70 bg-white/90 shadow-[0_24px_70px_rgba(15,23,42,0.12)] backdrop-blur-md"
    >
      <div className="relative grid min-h-0 h-full overflow-hidden rounded-[2rem] lg:grid-cols-[1fr_340px]">
        <div className="h-full min-w-0 rounded-l-[2rem] bg-white/85 p-8 backdrop-blur-sm sm:p-10">
          <div className="mt-2 inline-flex items-center rounded-full border border-amber-200/65 bg-gradient-to-r from-amber-50/90 to-amber-50/40 px-3.5 py-1.5 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-amber-950/85">
              Site Room
            </span>
          </div>
          <h1 className="mt-5 max-w-[46rem] text-pretty text-[1.65rem] font-semibold leading-[1.2] tracking-[-0.03em] text-neutral-950 sm:text-[1.85rem] sm:leading-[1.18] sm:tracking-[-0.032em] lg:text-[2rem]">
            {p.address}
          </h1>
          <p className="mt-3 text-[0.9375rem] font-medium text-neutral-600">
            {p.city}, {p.state}
          </p>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-neutral-500">
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-400">
              Zoning
            </span>
            <span className="mt-1 block text-[0.9375rem] font-normal text-neutral-700">
              {p.zoning_district}
            </span>
          </p>
          <p className="mt-5 max-w-xl text-sm leading-relaxed text-neutral-500">
            One workspace for this parcel: envelope math, execution read, and
            collaboration signals structured for investor diligence.
          </p>
        </div>
        <aside className="relative flex h-full min-w-0 flex-col overflow-visible rounded-r-[2rem] border border-white/10 bg-[#071827] p-8 text-white shadow-[0_20px_50px_rgba(0,0,0,0.25)] sm:p-10">
          <div
            className="pointer-events-none absolute left-0 top-0 z-[1] h-full w-16 bg-gradient-to-r from-white/50 via-white/15 to-transparent"
            aria-hidden
          />
          <div className="relative z-[2] flex min-h-0 flex-1 flex-col gap-6">
            <div className="rounded-lg bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-neutral-800">
              Investment memo controls
            </div>
            <DemoPipelineStatus initialStatus={initialPipelineStatus} />
            <div className="h-px w-full bg-white/20" />
            <PropertySiteRoomActions
              propertyId={p.id}
              viewerRole={null}
              dealReportPayload={dealReportPayload}
              addressForFilename={p.address}
              proLocked
              readOnly
            />
          </div>
        </aside>
      </div>
    </header>
  );
}
