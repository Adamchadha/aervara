import type { ReactNode } from "react";
import {
  getCookCountyChicagoDataSourceRows,
  type DataSourceConnectRow,
  type UiConnectStatus,
} from "@/lib/property-data/connection-summaries";
import {
  isChicagoProperty,
  normalizeCookPin14,
  parseChicagoStreetLine,
  readParcelPinFromProperty,
  readPersistedParcelPinApn,
} from "@/lib/property-data/normalize";
import { ParcelPinPublicRecordsClient } from "@/components/properties/parcel-pin-public-records-client";
import { CONNECTABLE_PROPERTY_DATA_SOURCES } from "@/lib/property-data-connect-sources";
import { formatFar, formatMoney, formatSqft } from "@/lib/far-calculations";
import { hasVerifiedParcelGeometry } from "@/lib/property-geometry-verification";
import { getDisplayMetricsForRow } from "@/lib/property-display-metrics";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { PropertyRow } from "@/types/property";

function readOptionalField(p: PropertyRow, key: string): string | null {
  const v = (p as Record<string, unknown>)[key];
  if (v == null) return null;
  if (typeof v === "string") {
    const t = v.trim();
    return t.length > 0 ? t : null;
  }
  if (typeof v === "number" && Number.isFinite(v)) return String(v);
  return null;
}

function cell(value: string | null | undefined) {
  if (value == null || String(value).trim() === "") return "Not connected yet";
  return String(value).trim();
}

function moneyCell(v: number | null | undefined): string {
  if (v == null || !Number.isFinite(Number(v)) || Number(v) <= 0) return "Not connected yet";
  return formatMoney(Number(v));
}

function salesDeedHistoryCell(p: PropertyRow): string {
  const price =
    p.last_sale_price != null &&
    Number.isFinite(Number(p.last_sale_price)) &&
    Number(p.last_sale_price) > 0
      ? formatMoney(Number(p.last_sale_price))
      : null;
  const raw = readOptionalField(p, "last_sale_date");
  const date = raw != null && raw.trim() !== "" ? raw.trim() : null;
  if (!price && !date) return "Not connected yet";
  if (price && date) return `${price} · ${date}`;
  return price ?? date ?? "Not connected yet";
}

type BadgeKind = "amber" | "gray" | "blue" | "green" | "red";

function uiConnectStatusLabel(s: UiConnectStatus): string {
  switch (s) {
    case "connected":
      return "Connected";
    case "not_connected":
      return "Not connected";
    case "needs_pin":
      return "Needs PIN";
    case "needs_address":
      return "Needs address";
    case "error":
      return "Error";
    default:
      return "Not connected";
  }
}

function uiConnectStatusToBadgeKind(s: UiConnectStatus): BadgeKind {
  switch (s) {
    case "connected":
      return "green";
    case "error":
      return "red";
    case "not_connected":
      return "gray";
    case "needs_pin":
    case "needs_address":
      return "amber";
    default:
      return "gray";
  }
}

function SummaryTag({ kind, children }: { kind: BadgeKind; children: ReactNode }) {
  return (
    <span
      className={cn(
        "mt-1.5 inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em]",
        kind === "red" &&
          "border-red-200/90 bg-red-50 text-red-950 ring-1 ring-red-900/[0.04]",
        kind === "amber" &&
          "border-amber-200/90 bg-amber-50 text-amber-950 ring-1 ring-amber-900/[0.04]",
        kind === "gray" &&
          "border-stone-200/90 bg-stone-100 text-stone-800 ring-1 ring-stone-900/[0.04]",
        kind === "blue" &&
          "border-sky-200/90 bg-sky-50 text-sky-950 ring-1 ring-sky-900/[0.04]",
        kind === "green" &&
          "border-emerald-200/90 bg-emerald-50 text-emerald-950 ring-1 ring-emerald-900/[0.04]",
      )}
    >
      {children}
    </span>
  );
}

function StatusBadge({ kind, label }: { kind: BadgeKind; label: string }) {
  return (
    <span
      className={cn(
        "shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em]",
        kind === "gray" &&
          "border-stone-200/90 bg-stone-50 text-stone-700 ring-1 ring-stone-900/[0.03]",
        kind === "blue" &&
          "border-sky-200/90 bg-sky-50 text-sky-900 ring-1 ring-sky-900/[0.03]",
        kind === "green" &&
          "border-emerald-200/90 bg-emerald-50 text-emerald-900 ring-1 ring-emerald-900/[0.03]",
        kind === "amber" &&
          "border-amber-200/90 bg-amber-50 text-amber-950 ring-1 ring-amber-900/[0.03]",
        kind === "red" &&
          "border-red-200/90 bg-red-50 text-red-900 ring-1 ring-red-900/[0.03]",
      )}
    >
      {label}
    </span>
  );
}

function ConnectDataSourcePanelRow({ row }: { row: DataSourceConnectRow }) {
  const badgeKind = uiConnectStatusToBadgeKind(row.uiStatus);
  const badgeLabel = uiConnectStatusLabel(row.uiStatus);
  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-xl border border-stone-200/80 bg-white/90 p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between",
        "transition duration-200 ease-out hover:-translate-y-px hover:shadow-md motion-reduce:transition-none motion-reduce:hover:translate-y-0",
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-stone-900">{row.title}</p>
        <p className="mt-0.5 text-[11px] leading-relaxed text-stone-500">{row.description}</p>
        <p className="mt-1.5 text-[11px] leading-snug text-stone-600">{row.detailMessage}</p>
      </div>
      <div className="flex shrink-0 items-center justify-end">
        <StatusBadge kind={badgeKind} label={badgeLabel} />
      </div>
    </div>
  );
}

type SourceStatusCardProps = {
  title: string;
  description: string;
  detail?: string | null;
  statusKind: BadgeKind;
  statusLabel: string;
};

function SourceStatusCard({ title, description, detail, statusKind, statusLabel }: SourceStatusCardProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 rounded-xl border border-stone-200/80 bg-white/90 p-3 shadow-sm",
        "transition duration-200 ease-out hover:-translate-y-px hover:shadow-lg motion-reduce:transition-none motion-reduce:hover:translate-y-0",
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-stone-900">{title}</p>
        <p className="mt-0.5 text-[11px] leading-relaxed text-stone-500">{description}</p>
        {detail != null && detail !== "" && detail !== "Not connected yet" ? (
          <p className="mt-1 truncate font-mono text-xs font-medium tabular-nums text-stone-700">
            {detail}
          </p>
        ) : null}
      </div>
      <StatusBadge kind={statusKind} label={statusLabel} />
    </div>
  );
}

type WorkspaceCardProps = {
  title: string;
  description: string;
  value: string;
  statusKind: BadgeKind;
  statusLabel: string;
};

function WorkspaceInputCard({ title, description, value, statusKind, statusLabel }: WorkspaceCardProps) {
  const missing = value === "Not connected yet" || value === "Manual input needed";
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 rounded-xl border border-stone-200/80 bg-white/90 p-3 shadow-sm",
        "transition duration-200 ease-out hover:-translate-y-px hover:shadow-lg motion-reduce:transition-none motion-reduce:hover:translate-y-0",
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-stone-900">{title}</p>
        <p className="mt-0.5 text-[11px] leading-relaxed text-stone-500">{description}</p>
        <p
          className={cn(
            "mt-1 text-sm font-medium tabular-nums text-stone-900",
            missing && "font-normal italic text-stone-500",
          )}
        >
          {value}
        </p>
      </div>
      <StatusBadge kind={statusKind} label={statusLabel} />
    </div>
  );
}

type DataInputsVerificationSectionProps = {
  property: PropertyRow;
  /** Optional session preview PIN (query string); not persisted. */
  previewParcelPin?: string | null;
  /** Property detail URL including demo flag when applicable. */
  propertyPagePath: string;
};

function countyGisDetail(p: PropertyRow): string {
  if (!hasVerifiedParcelGeometry(p)) return "";
  const src = p.geometry_source != null && String(p.geometry_source).trim();
  return src ? String(p.geometry_source).trim() : "Parcel geometry on file";
}

/**
 * Read-only digest of inputs and future record links. Optional columns read safely when absent.
 */
export async function DataInputsVerificationSection({
  property: p,
  previewParcelPin = null,
  propertyPagePath,
}: DataInputsVerificationSectionProps) {
  const connectRows = await getCookCountyChicagoDataSourceRows(p, { previewParcelPin });
  const persistedApnRaw = readPersistedParcelPinApn(p);
  const hasPersistedParcelPinApn = Boolean(persistedApnRaw);
  const persistedPinNormalized = normalizeCookPin14(persistedApnRaw);
  const previewPinNormalized = normalizeCookPin14(previewParcelPin);
  const baselineCookProbePin =
    normalizeCookPin14(readParcelPinFromProperty(p)) ?? previewPinNormalized ?? null;
  const chicagoAddressReady = Boolean(
    isChicagoProperty(p) && parseChicagoStreetLine(p.address),
  );
  const parcelId =
    readOptionalField(p, "parcel_id_apn") ??
    readOptionalField(p, "parcel_pin_apn") ??
    readOptionalField(p, "parcel_pin") ??
    readOptionalField(p, "apn");

  const heightLimit = readOptionalField(p, "height_limit_ft") ?? readOptionalField(p, "height_limit");
  const allowedUse = readOptionalField(p, "allowed_use") ?? readOptionalField(p, "use_class");
  const lastVerified = readOptionalField(p, "last_verified_date");

  const zoningPlatformVerified = Boolean(p.approved_at && p.approved_by_admin);
  const parcelIdMissing = cell(parcelId) === "Not connected yet";
  const landVal = moneyCell(p.assessed_land_value);
  const imprVal = moneyCell(p.assessed_improvement_value);
  const salesVal = salesDeedHistoryCell(p);
  const ownerVal = cell(readOptionalField(p, "owner_name"));

  const metrics = getDisplayMetricsForRow(p);
  const unusedBuildableLabel =
    metrics.unused_buildable_sqft > 0 ? formatSqft(metrics.unused_buildable_sqft) : "—";
  const opportunityLabel =
    metrics.opportunity_value != null && metrics.opportunity_value > 0
      ? formatMoney(metrics.opportunity_value)
      : "—";

  return (
    <section
      className="rounded-[1.75rem] border border-stone-200/70 bg-white/82 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)] backdrop-blur-sm sm:p-6"
      aria-labelledby="data-inputs-verification-heading"
    >
      {/* A) Summary strip */}
      <div className="rounded-xl border border-stone-200/70 bg-stone-50/60 p-3 sm:p-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500">
          Record & model summary
        </p>
        <dl className="mt-2 grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-lg border border-stone-200/60 bg-white/80 px-2.5 py-2">
            <dt className="text-[10px] font-semibold uppercase tracking-[0.1em] text-stone-500">
              Data confidence
            </dt>
            <dd className="mt-0.5 font-semibold text-stone-900">Estimated</dd>
            <SummaryTag kind="amber">Estimated</SummaryTag>
          </div>
          <div className="rounded-lg border border-stone-200/60 bg-white/80 px-2.5 py-2">
            <dt className="text-[10px] font-semibold uppercase tracking-[0.1em] text-stone-500">
              Geometry
            </dt>
            <dd className="mt-0.5 font-semibold text-stone-900">Illustrative only</dd>
            <SummaryTag kind="gray">Illustrative</SummaryTag>
          </div>
          <div className="rounded-lg border border-stone-200/60 bg-white/80 px-2.5 py-2">
            <dt className="text-[10px] font-semibold uppercase tracking-[0.1em] text-stone-500">
              Zoning source
            </dt>
            <dd className="mt-0.5 font-semibold text-stone-900">Manual input</dd>
            <SummaryTag kind="blue">Manual input</SummaryTag>
          </div>
          <div className="rounded-lg border border-stone-200/60 bg-white/80 px-2.5 py-2">
            <dt className="text-[10px] font-semibold uppercase tracking-[0.1em] text-stone-500">
              Valuation source
            </dt>
            <dd className="mt-0.5 font-semibold text-stone-900">User/model estimate</dd>
            <SummaryTag kind="amber">Estimated</SummaryTag>
          </div>
          <div className="rounded-lg border border-stone-200/60 bg-white/80 px-2.5 py-2">
            <dt className="text-[10px] font-semibold uppercase tracking-[0.1em] text-stone-500">
              Last verified
            </dt>
            <dd className="mt-0.5 font-semibold text-stone-900">{cell(lastVerified)}</dd>
            <SummaryTag kind="gray">
              {cell(lastVerified) === "Not connected yet" ? "Not connected" : "Recorded"}
            </SummaryTag>
          </div>
        </dl>
        <p className="mt-2 text-[11px] leading-relaxed text-stone-600">
          Illustrative only — not a surveyed parcel boundary or approved building footprint.
        </p>
      </div>

      <h2
        id="data-inputs-verification-heading"
        className="mt-6 text-lg font-semibold tracking-tight text-stone-950 sm:text-xl"
      >
        Data Inputs &amp; Verification
      </h2>
      <p className="text-xs text-stone-500 mt-1">
        Confidence increases as more verified data sources are connected.
      </p>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-stone-600">
        Core parcel, zoning, and valuation fields used to estimate opportunity. Connect public
        records or update manually for higher confidence.
      </p>

      <div className="mt-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500">
          Connectable sources (planned)
        </p>
        <ul className="mt-1.5 flex flex-wrap gap-1.5">
          {CONNECTABLE_PROPERTY_DATA_SOURCES.map((src) => (
            <li
              key={src}
              className="rounded-full border border-stone-200/80 bg-stone-50/90 px-2.5 py-1 text-[11px] font-medium text-stone-600"
            >
              {src}
            </li>
          ))}
        </ul>
      </div>

      <ParcelPinPublicRecordsClient
        propertyPagePath={propertyPagePath}
        hasPersistedParcelPinApn={hasPersistedParcelPinApn}
        persistedPinRaw={persistedApnRaw}
        persistedPinNormalized={persistedPinNormalized}
        previewPinRaw={previewParcelPin?.trim() ? previewParcelPin.trim() : null}
        previewPinNormalized={previewPinNormalized}
        baselineCookProbePin={baselineCookProbePin}
        chicagoAddressReady={chicagoAddressReady}
      />

      <div className="mt-5 border-t border-stone-200/60 pt-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-500">
          Connect data sources
        </p>
        <p className="mt-1 max-w-3xl text-[11px] leading-relaxed text-stone-500">
          Live read-only checks against public Socrata endpoints (Cook County &amp; City of Chicago). Results are
          not saved to your property — manual fields stay unchanged.
        </p>
        <div className="mt-3 grid gap-2">
          {connectRows.map((row) => (
            <ConnectDataSourcePanelRow key={row.id} row={row} />
          ))}
        </div>
      </div>

      {/* B) Source status grid */}
      <div className="mt-5 border-t border-stone-200/60 pt-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-500">
          Source status
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <SourceStatusCard
            title="Parcel ID / PIN / APN"
            description="Official identifier from county assessor or title research."
            detail={parcelIdMissing ? null : cell(parcelId)}
            statusKind={parcelIdMissing ? "gray" : "blue"}
            statusLabel={parcelIdMissing ? "Not connected" : "Manual"}
          />
          <SourceStatusCard
            title="County GIS parcel boundary"
            description="Survey-grade boundary when linked to GIS or verified geometry."
            detail={hasVerifiedParcelGeometry(p) ? countyGisDetail(p) : null}
            statusKind={hasVerifiedParcelGeometry(p) ? "green" : "gray"}
            statusLabel={hasVerifiedParcelGeometry(p) ? "Verified" : "Not connected"}
          />
          <SourceStatusCard
            title="City zoning district"
            description="Overlay district used for capacity and use assumptions."
            detail={p.zoning_district?.trim() || null}
            statusKind={zoningPlatformVerified ? "green" : "blue"}
            statusLabel={zoningPlatformVerified ? "Verified" : "Manual"}
          />
          <SourceStatusCard
            title="Assessor land value"
            description="Tax roll land component for benchmarking and sensitivity."
            detail={landVal === "Not connected yet" ? null : landVal}
            statusKind={landVal === "Not connected yet" ? "gray" : "blue"}
            statusLabel={landVal === "Not connected yet" ? "Not connected" : "Manual"}
          />
          <SourceStatusCard
            title="Assessor improvement value"
            description="Improvements on roll; pairs with land for total assessed value."
            detail={imprVal === "Not connected yet" ? null : imprVal}
            statusKind={imprVal === "Not connected yet" ? "gray" : "blue"}
            statusLabel={imprVal === "Not connected yet" ? "Not connected" : "Manual"}
          />
          <SourceStatusCard
            title="Building permits"
            description="Issued construction, renovation, and certificate of occupancy history."
            statusKind="gray"
            statusLabel="Not connected"
          />
          <SourceStatusCard
            title="Sales / deed history"
            description="Recorded transfers and arms-length sale evidence when available."
            detail={salesVal === "Not connected yet" ? null : salesVal}
            statusKind={salesVal === "Not connected yet" ? "gray" : "blue"}
            statusLabel={salesVal === "Not connected yet" ? "Not connected" : "Manual"}
          />
          <SourceStatusCard
            title="Owner / entity name"
            description="Title holder or operating entity for diligence routing."
            detail={ownerVal === "Not connected yet" ? null : ownerVal}
            statusKind={ownerVal === "Not connected yet" ? "gray" : "blue"}
            statusLabel={ownerVal === "Not connected yet" ? "Not connected" : "Manual"}
          />
          <SourceStatusCard
            title="Flood / environmental overlay"
            description="FEMA zones, wetlands, and hazard layers for risk screening."
            statusKind="gray"
            statusLabel="Not connected"
          />
          <SourceStatusCard
            title="Transit / walkability / access"
            description="Mobility and access context for program and parking assumptions."
            statusKind="gray"
            statusLabel="Not connected"
          />
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2 border-t border-stone-200/60 pt-4">
        <Button type="button" variant="secondary" disabled className="cursor-not-allowed gap-2 opacity-70">
          <span>Connect parcel API</span>
          <span className="rounded-md bg-stone-200/80 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-stone-600">
            Coming soon
          </span>
        </Button>
        <Button type="button" variant="secondary" disabled className="cursor-not-allowed gap-2 opacity-70">
          <span>Import assessor CSV</span>
          <span className="rounded-md bg-stone-200/80 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-stone-600">
            Coming soon
          </span>
        </Button>
        <Button type="button" variant="secondary" disabled className="cursor-not-allowed gap-2 opacity-70">
          <span>Add manual verification</span>
          <span className="rounded-md bg-stone-200/80 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-stone-600">
            Coming soon
          </span>
        </Button>
      </div>

      {/* Workspace inputs — same card system */}
      <div className="mt-5 border-t border-stone-200/60 pt-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-500">
          Workspace inputs (used in models)
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <WorkspaceInputCard
            title="Address"
            description="Primary site address for maps and correspondence."
            value={cell(p.address)}
            statusKind="blue"
            statusLabel="Manual"
          />
          <WorkspaceInputCard
            title="City / State"
            description="Jurisdiction for zoning and market context."
            value={cell(`${p.city}, ${p.state}`)}
            statusKind="blue"
            statusLabel="Manual"
          />
          <WorkspaceInputCard
            title="Lot size"
            description="Lot area driving FAR capacity and envelope math."
            value={p.lot_size_sqft > 0 ? formatSqft(p.lot_size_sqft) : "Manual input needed"}
            statusKind="blue"
            statusLabel="Manual"
          />
          <WorkspaceInputCard
            title="Current built floor area"
            description="Existing GFA against max buildable under submitted FAR."
            value={
              p.built_floor_area_sqft > 0 ? formatSqft(p.built_floor_area_sqft) : "Manual input needed"
            }
            statusKind="blue"
            statusLabel="Manual"
          />
          <WorkspaceInputCard
            title="Max FAR"
            description="Zoning ceiling for floor area ratio used in the model."
            value={p.max_far > 0 ? formatFar(p.max_far) : "Manual input needed"}
            statusKind="blue"
            statusLabel="Manual"
          />
          <WorkspaceInputCard
            title="Height limit"
            description="Vertical constraint when provided with zoning inputs."
            value={cell(heightLimit)}
            statusKind={cell(heightLimit) === "Not connected yet" ? "gray" : "blue"}
            statusLabel={cell(heightLimit) === "Not connected yet" ? "Not connected" : "Manual"}
          />
          <WorkspaceInputCard
            title="Allowed use / use class"
            description="Permitted use classes informing screening and concepts."
            value={cell(allowedUse)}
            statusKind={cell(allowedUse) === "Not connected yet" ? "gray" : "blue"}
            statusLabel={cell(allowedUse) === "Not connected yet" ? "Not connected" : "Manual"}
          />
          <WorkspaceInputCard
            title="Data source (notes)"
            description="Provenance notes from your team or import batch."
            value={cell(readOptionalField(p, "data_source"))}
            statusKind={cell(readOptionalField(p, "data_source")) === "Not connected yet" ? "gray" : "blue"}
            statusLabel={
              cell(readOptionalField(p, "data_source")) === "Not connected yet" ? "Not connected" : "Manual"
            }
          />
          <WorkspaceInputCard
            title="Confidence level (overall)"
            description="Platform review state versus workspace-only inputs."
            value={
              p.approved_at
                ? "Platform-reviewed submission"
                : "Owner / workspace inputs — verify externally"
            }
            statusKind={p.approved_at ? "green" : "blue"}
            statusLabel={p.approved_at ? "Verified" : "Manual"}
          />
        </div>
      </div>

      {/* C) Modeled outputs — engine highlight */}
      <div className="mt-5 rounded-xl bg-[#071827]/90 p-4 text-white shadow-[0_16px_40px_rgba(15,23,42,0.2)] ring-1 ring-white/10 sm:p-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/55">
          Modeled outputs
        </p>
        <p className="mt-1 text-xs font-medium text-white/70">What the opportunity engine produces from your inputs</p>
        <ul className="mt-4 space-y-3 border-t border-white/10 pt-3 text-sm">
          <li className="flex items-center justify-between gap-4">
            <span className="font-medium text-white/90">Unused buildable area</span>
            <div className="flex shrink-0 flex-col items-end gap-1 sm:flex-row sm:items-center sm:gap-3">
              <span className="font-mono text-xs tabular-nums text-white/80">{unusedBuildableLabel}</span>
              <SummaryTag kind="amber">Estimated</SummaryTag>
            </div>
          </li>
          <li className="flex items-center justify-between gap-4">
            <span className="font-medium text-white/90">Opportunity value</span>
            <div className="flex shrink-0 flex-col items-end gap-1 sm:flex-row sm:items-center sm:gap-3">
              <span className="font-mono text-xs tabular-nums text-white/80">{opportunityLabel}</span>
              <SummaryTag kind="amber">Estimated</SummaryTag>
            </div>
          </li>
          <li className="flex items-center justify-between gap-4">
            <span className="font-medium text-white/90">Geometry</span>
            <SummaryTag kind="gray">Illustrative</SummaryTag>
          </li>
        </ul>
      </div>
    </section>
  );
}
