"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { PublicDemoPropertyLink } from "@/components/demo/public-demo-property-link";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  ZoomControl,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { formatMoney, formatScorePercent } from "@/lib/far-calculations";
import { getDisplayMetricsForRow } from "@/lib/property-display-metrics";
import { getOpportunityEngineRead } from "@/lib/opportunity-engine";
import { OpportunityHeatLayer } from "@/components/properties/opportunity-heat-layer";
import { PropertyStatusBadge } from "@/components/properties/property-status-badge";
import { Button } from "@/components/ui/button";
import {
  BlueprintLoadingSurface,
  BlueprintMapGeocodeOverlay,
} from "@/components/states/blueprint-loading-surface";
import { cn } from "@/lib/utils";
import type { PropertyRow } from "@/types/property";

type GeocodeStatus = "idle" | "loading" | "ready" | "error";

type MapLayerMode = "pins" | "heatmap";

const GEOCODE_BATCH = 35;

const PIN_REGULAR = L.divIcon({
  className: "aervara-map-pin",
  html: `<div class="aervara-pin-dot" aria-hidden="true"></div>`,
  iconSize: [28, 36],
  iconAnchor: [14, 34],
  popupAnchor: [0, -30],
});

const PIN_TOP = L.divIcon({
  className: "aervara-map-pin aervara-map-pin--top",
  html: `<div class="aervara-pin-dot aervara-pin-dot--top" aria-hidden="true"></div>`,
  iconSize: [32, 40],
  iconAnchor: [16, 38],
  popupAnchor: [0, -34],
});

export type PropertiesMapViewProps = {
  properties: PropertyRow[];
  /** Total in account (unfiltered), for empty copy. */
  totalPipelineCount: number;
  topDealPropertyIds: ReadonlySet<string>;
  isDemo?: boolean;
  publicDemo?: boolean;
};

function fixLeafletDefaultIcons() {
  const proto = L.Icon.Default.prototype as unknown as {
    _getIconUrl?: () => string;
  };
  delete proto._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
    iconUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  });
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size));
  }
  return out;
}

function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();

  useEffect(() => {
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView(points[0]!, 14);
      return;
    }
    const bounds = L.latLngBounds(
      points.map(([lat, lng]) => L.latLng(lat, lng)),
    );
    map.fitBounds(bounds, { padding: [52, 52], maxZoom: 15 });
  }, [map, points]);

  return null;
}

function MapPopupCard({
  property: p,
  isDemo,
  publicDemo,
}: {
  property: PropertyRow;
  isDemo: boolean;
  publicDemo: boolean;
}) {
  const m = getDisplayMetricsForRow(p);
  const read = getOpportunityEngineRead(p);
  return (
    <div className="aervara-map-popup text-neutral-950">
      <div className="border-b border-neutral-100 px-4 py-3">
        <p className="text-[13px] font-semibold leading-snug tracking-tight">
          {p.address}
        </p>
        <p className="mt-1 text-[11px] text-neutral-500">
          {p.city}, {p.state}
        </p>
        <div className="mt-2.5">
          <PropertyStatusBadge status={p.status} />
        </div>
      </div>
      <div className="space-y-3 px-4 py-3">
        <dl className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-2 text-[11px]">
          <dt className="text-neutral-400">Air rights value</dt>
          <dd className="text-right font-mono text-[12px] font-semibold tabular-nums text-neutral-950">
            {formatMoney(m.air_rights_value)}
          </dd>
          <dt className="text-neutral-400">Underbuilt score</dt>
          <dd className="text-right font-mono text-[12px] font-semibold tabular-nums text-neutral-950">
            {formatScorePercent(m.underbuilt_score)}
          </dd>
        </dl>
        <div className="rounded-lg bg-neutral-50 px-3 py-2.5">
          <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
            Why this matters
          </p>
          <p className="mt-1 text-[11px] leading-snug text-neutral-700">
            Air rights represent unbuilt vertical envelope that can anchor
            institutional upside.
          </p>
        </div>
        <div className="rounded-lg bg-neutral-50 px-3 py-2.5">
          <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
            Recommended play
          </p>
          <p className="mt-1 text-[11px] font-medium leading-snug text-neutral-800">
            {read.recommendedPlay}
          </p>
        </div>
        <Button variant="secondary" className="h-9 w-full text-xs" asChild>
          <PublicDemoPropertyLink
            propertyId={p.id}
            isDemo={isDemo}
            publicDemo={publicDemo}
            className="inline-flex h-9 w-full items-center justify-center rounded-md text-xs"
          >
            View property details
          </PublicDemoPropertyLink>
        </Button>
      </div>
    </div>
  );
}

export default function PropertiesMapView({
  properties,
  totalPipelineCount,
  topDealPropertyIds,
  isDemo = false,
  publicDemo = false,
}: PropertiesMapViewProps) {
  const [status, setStatus] = useState<GeocodeStatus>("idle");
  const [coordById, setCoordById] = useState<
    Record<string, { lat: number; lng: number } | null>
  >({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [mapLayerMode, setMapLayerMode] = useState<MapLayerMode>("pins");
  const requestId = useRef(0);

  useLayoutEffect(() => {
    fixLeafletDefaultIcons();
  }, []);

  const missingIds = useMemo(() => {
    const want = properties.map((p) => p.id);
    return want.filter((id) => !(id in coordById));
  }, [properties, coordById]);

  const missingKey = missingIds.slice().sort().join(",");

  useEffect(() => {
    if (properties.length === 0) return;
    if (missingIds.length === 0) {
      setStatus("ready");
    }
  }, [properties.length, missingIds.length]);

  useEffect(() => {
    if (properties.length === 0) return;
    if (!missingKey) return;

    const idsToFetch = missingIds;

    const rid = ++requestId.current;
    let cancelled = false;

    setStatus("loading");
    setErrorMessage(null);

    (async () => {
      try {
        const batches = chunk(idsToFetch, GEOCODE_BATCH);
        const acc: Record<string, { lat: number; lng: number } | null> = {};
        for (const batch of batches) {
          if (cancelled || rid !== requestId.current) return;
          const res = await fetch("/api/properties/geocode", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ propertyIds: batch }),
          });
          const data = (await res.json()) as {
            results?: Record<string, { lat: number; lng: number } | null>;
            error?: string;
          };
          if (!res.ok) {
            throw new Error(data.error || "Geocoding failed");
          }
          Object.assign(acc, data.results ?? {});
        }
        if (cancelled || rid !== requestId.current) return;
        setCoordById((prev) => ({ ...prev, ...acc }));
        setStatus("ready");
      } catch (e) {
        if (cancelled || rid !== requestId.current) return;
        setErrorMessage(
          e instanceof Error ? e.message : "Something went wrong",
        );
        setStatus("error");
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- missingKey is derived from missingIds (stable string)
  }, [missingKey, properties.length]);

  const points = useMemo(() => {
    const list: [number, number][] = [];
    for (const p of properties) {
      const c = coordById[p.id];
      if (c) list.push([c.lat, c.lng]);
    }
    return list;
  }, [properties, coordById]);

  const placedCount = points.length;
  const filterTotal = properties.length;

  const defaultCenter: [number, number] = [39.8283, -98.5795];
  const defaultZoom = 4;

  const retry = useCallback(() => {
    requestId.current += 1;
    setErrorMessage(null);
    setCoordById((prev) => {
      const next = { ...prev };
      for (const p of properties) {
        delete next[p.id];
      }
      return next;
    });
  }, [properties]);

  const showHeavyLoader =
    status === "loading" &&
    properties.length > 0 &&
    placedCount === 0 &&
    !errorMessage;

  if (totalPipelineCount === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-200/90 bg-white px-8 py-20 text-center shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-neutral-950/[0.03]">
        <p className="text-base font-semibold tracking-tight text-neutral-950">
          Nothing to map yet
        </p>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-neutral-500">
          Add a property with a full street address. Aervara will place it on the
          map after geocoding.
        </p>
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-200/90 bg-white px-8 py-20 text-center shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-neutral-950/[0.03]">
        <p className="text-base font-semibold tracking-tight text-neutral-950">
          No matching properties on the map
        </p>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-neutral-500">
          Your filters hide every parcel. Clear filters or widen city / state /
          zoning to see pins again.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3 text-sm text-neutral-600">
          <p className="tabular-nums">
            <span className="font-medium text-neutral-900">{placedCount}</span>
            {" of "}
            <span className="font-medium text-neutral-900">{filterTotal}</span>
            {" plotted"}
            {topDealPropertyIds.size > 0 ? (
              <span className="ml-2 text-neutral-400">
                · Top opportunities use the gold-accent pin
              </span>
            ) : null}
          </p>
          {placedCount < filterTotal && status === "ready" ? (
            <div className="flex max-w-xl flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              <p className="text-xs text-amber-900/90">
                Some addresses could not be placed on the map. Check spelling and
                city/state, set{" "}
                <code className="rounded bg-amber-100/70 px-1">
                  NOMINATIM_USER_AGENT
                </code>
                , then retry geocoding.
              </p>
              <Button
                type="button"
                variant="secondary"
                className="h-8 shrink-0 px-3 text-xs"
                onClick={retry}
              >
                Retry geocoding
              </Button>
            </div>
          ) : null}
        </div>
        {placedCount > 0 && status === "ready" ? (
          <div className="flex flex-col gap-2 sm:items-end">
            <div
              className="inline-flex rounded-lg border border-neutral-200/70 bg-neutral-50/90 p-0.5 shadow-sm"
              role="group"
              aria-label="Map layer"
            >
              <button
                type="button"
                onClick={() => setMapLayerMode("pins")}
                className={cn(
                  "rounded-md px-3.5 py-2 text-xs font-semibold transition-colors",
                  mapLayerMode === "pins"
                    ? "bg-white text-neutral-950 shadow-sm"
                    : "text-neutral-500 hover:text-neutral-900",
                )}
              >
                Pins
              </button>
              <button
                type="button"
                onClick={() => setMapLayerMode("heatmap")}
                className={cn(
                  "rounded-md px-3.5 py-2 text-xs font-semibold transition-colors",
                  mapLayerMode === "heatmap"
                    ? "bg-white text-neutral-950 shadow-sm"
                    : "text-neutral-500 hover:text-neutral-900",
                )}
              >
                Heatmap
              </button>
            </div>
            {mapLayerMode === "heatmap" ? (
              <p className="max-w-xs text-right text-[10px] leading-snug text-neutral-400">
                Warmer = stronger opportunity &amp; underbuilt signal. Pins stay
                on top for detail.
              </p>
            ) : null}
          </div>
        ) : null}
      </div>

      <div
        className={cn(
          "aervara-map-root relative overflow-hidden rounded-2xl border border-neutral-200/80 bg-neutral-100 shadow-[0_2px_12px_rgba(15,23,42,0.06)] ring-1 ring-neutral-950/[0.04]",
        )}
      >
        <MapContainer
          center={points[0] ?? defaultCenter}
          zoom={points.length ? 12 : defaultZoom}
          className="z-0 h-[min(72vh,580px)] w-full"
          scrollWheelZoom
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />
          <ZoomControl position="bottomright" />
          {mapLayerMode === "heatmap" && placedCount > 0 ? (
            <OpportunityHeatLayer
              properties={properties}
              coordById={coordById}
              visible
            />
          ) : null}
          {points.length > 0 ? <FitBounds points={points} /> : null}
          {properties.map((p) => {
            const c = coordById[p.id];
            if (!c) return null;
            const isTop = topDealPropertyIds.has(p.id);
            return (
              <Marker
                key={p.id}
                position={[c.lat, c.lng]}
                icon={isTop ? PIN_TOP : PIN_REGULAR}
              >
                <Popup
                  className="aervara-popup-shell"
                  closeButton
                  minWidth={268}
                  maxWidth={320}
                >
                  <MapPopupCard property={p} isDemo={isDemo} publicDemo={publicDemo} />
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {showHeavyLoader ? (
          <div className="absolute inset-0 z-[500] flex items-center justify-center bg-stone-50/86 backdrop-blur-[2px]">
            <BlueprintMapGeocodeOverlay />
          </div>
        ) : null}

        {status === "loading" && placedCount > 0 ? (
          <BlueprintLoadingSurface
            frame={false}
            className="pointer-events-none absolute left-3 top-3 z-[500] rounded-full border border-stone-200/75 px-3.5 py-1.5 shadow-sm ring-1 ring-stone-900/[0.04] backdrop-blur-[2px]"
          >
            <span className="text-[11px] font-medium tracking-tight text-neutral-600">
              Updating map…
            </span>
          </BlueprintLoadingSurface>
        ) : null}

        {status === "error" ? (
          <div className="absolute inset-0 z-[500] flex flex-col items-center justify-center gap-4 bg-white/90 px-6 text-center backdrop-blur-sm">
            <p className="max-w-sm text-sm text-red-800">{errorMessage}</p>
            <Button type="button" variant="secondary" onClick={retry}>
              Try again
            </Button>
          </div>
        ) : null}
      </div>

      {status === "ready" && placedCount === 0 && filterTotal > 0 ? (
        <div className="rounded-xl border border-amber-200/70 bg-amber-50/50 px-4 py-3 text-sm text-amber-950">
          <p className="font-medium">No pins on the map</p>
          <p className="mt-1 text-xs leading-relaxed text-amber-900/85">
            None of the filtered addresses returned coordinates. Confirm each
            property has a complete street address, city, and state, then try
            again—or check your geocoding configuration (
            <code className="rounded bg-amber-100/80 px-1">
              NOMINATIM_USER_AGENT
            </code>
            ).
          </p>
        </div>
      ) : null}

      <p className="text-[11px] leading-relaxed text-neutral-400">
        Map tiles © OpenStreetMap contributors, © CARTO. Geocoding ©
        OpenStreetMap Nominatim — set{" "}
        <code className="rounded bg-neutral-100 px-1 text-neutral-600">
          NOMINATIM_USER_AGENT
        </code>{" "}
        in production per Nominatim policy.
      </p>
    </div>
  );
}
