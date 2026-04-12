"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import Link from "next/link";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { formatMoney, formatScorePercent } from "@/lib/far-calculations";
import { getDisplayMetricsForRow } from "@/lib/property-display-metrics";
import { PropertyStatusBadge } from "@/components/properties/property-status-badge";
import { cn } from "@/lib/utils";
import type { PropertyRow } from "@/types/property";

type GeocodeStatus = "idle" | "loading" | "ready" | "error";

type PropertiesMapViewProps = {
  properties: PropertyRow[];
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

function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();

  useEffect(() => {
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView(points[0], 14);
      return;
    }
    const bounds = L.latLngBounds(points.map(([lat, lng]) => L.latLng(lat, lng)));
    map.fitBounds(bounds, { padding: [48, 48], maxZoom: 15 });
  }, [map, points]);

  return null;
}

export function PropertiesMapView({ properties }: PropertiesMapViewProps) {
  const [status, setStatus] = useState<GeocodeStatus>("idle");
  const [coords, setCoords] = useState<
    Record<string, { lat: number; lng: number } | null>
  >({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useLayoutEffect(() => {
    fixLeafletDefaultIcons();
  }, []);

  const fetchGeocodes = useCallback(async () => {
    setStatus("loading");
    setErrorMessage(null);
    try {
      const res = await fetch("/api/properties/geocode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyIds: properties.map((p) => p.id),
        }),
      });
      const data = (await res.json()) as {
        results?: Record<string, { lat: number; lng: number } | null>;
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || "Geocoding failed");
      }
      setCoords(data.results ?? {});
      setStatus("ready");
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : "Something went wrong");
      setStatus("error");
    }
  }, [properties]);

  useEffect(() => {
    void fetchGeocodes();
  }, [fetchGeocodes]);

  const points = useMemo(() => {
    const list: [number, number][] = [];
    for (const p of properties) {
      const c = coords[p.id];
      if (c) list.push([c.lat, c.lng]);
    }
    return list;
  }, [properties, coords]);

  const defaultCenter: [number, number] = [39.8283, -98.5795];
  const defaultZoom = 4;

  if (status === "loading" || status === "idle") {
    return (
      <div className="flex min-h-[min(70vh,560px)] flex-col items-center justify-center rounded-2xl border border-neutral-200 bg-neutral-50/80 text-sm text-neutral-600">
        <p>Geocoding addresses…</p>
        <p className="mt-2 max-w-md text-center text-xs text-neutral-500">
          This can take a few seconds per property (OpenStreetMap rate limits).
        </p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex min-h-[min(70vh,560px)] flex-col items-center justify-center gap-4 rounded-2xl border border-red-200 bg-red-50/60 px-6 text-center">
        <p className="text-sm text-red-800">{errorMessage}</p>
        <button
          type="button"
          className="rounded-md border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-950 hover:bg-neutral-50"
          onClick={() => void fetchGeocodes()}
        >
          Try again
        </button>
      </div>
    );
  }

  const found = points.length;
  const total = properties.length;

  return (
    <div className="space-y-3">
      {found < total ? (
        <p className="text-sm text-amber-800">
          Placed {found} of {total} on the map. Some addresses could not be
          geocoded.
        </p>
      ) : null}
      <div className="overflow-hidden rounded-2xl border border-neutral-200 shadow-sm ring-1 ring-neutral-950/[0.04]">
        <MapContainer
          center={points[0] ?? defaultCenter}
          zoom={points.length ? 12 : defaultZoom}
          className={cn("z-0 h-[min(70vh,560px)] w-full")}
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {points.length > 0 ? <FitBounds points={points} /> : null}
          {properties.map((p) => {
            const c = coords[p.id];
            if (!c) return null;
            const m = getDisplayMetricsForRow(p);
            return (
              <Marker key={p.id} position={[c.lat, c.lng]}>
                <Popup>
                  <div className="min-w-[200px] space-y-2 py-1 text-neutral-900">
                    <p className="text-sm font-semibold leading-snug">
                      {p.address}
                    </p>
                    <p className="text-xs text-neutral-600">
                      {p.city}, {p.state}
                    </p>
                    <div className="pt-0.5">
                      <PropertyStatusBadge status={p.status} />
                    </div>
                    <dl className="space-y-1 text-xs">
                      <div className="flex justify-between gap-4">
                        <dt className="text-neutral-500">Opportunity</dt>
                        <dd className="font-mono font-medium tabular-nums">
                          {formatMoney(m.opportunity_value)}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-neutral-500">Score</dt>
                        <dd className="font-mono font-medium tabular-nums">
                          {formatScorePercent(m.underbuilt_score)}
                        </dd>
                      </div>
                    </dl>
                    <Link
                      href={`/properties/${p.id}`}
                      className="inline-block text-xs font-semibold text-neutral-950 underline-offset-2 hover:underline"
                    >
                      View details →
                    </Link>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
      <p className="text-xs text-neutral-500">
        Geocoding data © OpenStreetMap contributors. Configure{" "}
        <code className="rounded bg-neutral-100 px-1">NOMINATIM_USER_AGENT</code>{" "}
        in production per Nominatim policy.
      </p>
    </div>
  );
}
