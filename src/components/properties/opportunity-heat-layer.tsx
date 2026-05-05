"use client";

import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.heat";
import { getDisplayMetricsForRow } from "@/lib/property-display-metrics";
import type { PropertyRow } from "@/types/property";

function clamp(n: number, lo: number, hi: number): number {
  if (!Number.isFinite(n)) return lo;
  return Math.min(hi, Math.max(lo, n));
}

function buildHeatLatLngs(
  properties: PropertyRow[],
  coordById: Record<string, { lat: number; lng: number } | null>,
): [number, number, number][] {
  const raw: { lat: number; lng: number; w: number }[] = [];
  for (const p of properties) {
    const c = coordById[p.id];
    if (!c) continue;
    const m = getDisplayMetricsForRow(p);
    const ub = clamp(m.underbuilt_score / 100, 0, 1);
    const opp =
      m.opportunity_value != null &&
      m.opportunity_value > 0 &&
      Number.isFinite(m.opportunity_value)
        ? Math.min(1, Math.log10(m.opportunity_value + 1) / 8)
        : 0;
    const w = Math.max(
      0.08,
      0.38 * ub + 0.62 * Math.max(opp, ub * 0.35),
    );
    raw.push({ lat: c.lat, lng: c.lng, w });
  }
  if (raw.length === 0) return [];
  const maxW = Math.max(...raw.map((r) => r.w), 0.01);
  return raw.map((r) => [r.lat, r.lng, r.w / maxW] as [number, number, number]);
}

type OpportunityHeatLayerProps = {
  properties: PropertyRow[];
  coordById: Record<string, { lat: number; lng: number } | null>;
  visible: boolean;
};

export function OpportunityHeatLayer({
  properties,
  coordById,
  visible,
}: OpportunityHeatLayerProps) {
  const map = useMap();
  const layerRef = useRef<L.Layer | null>(null);

  useEffect(() => {
    if (!visible) {
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
      return;
    }

    const latlngs = buildHeatLatLngs(properties, coordById);
    if (latlngs.length === 0) {
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
      return;
    }

    if (layerRef.current) {
      map.removeLayer(layerRef.current);
      layerRef.current = null;
    }

    const heatFactory = (
      L as unknown as {
        heatLayer: (
          ll: [number, number, number][],
          opts: Record<string, unknown>,
        ) => L.Layer;
      }
    ).heatLayer;

    const layer = heatFactory(latlngs, {
      radius: 46,
      blur: 34,
      maxZoom: 16,
      minOpacity: 0.1,
      gradient: {
        0.0: "rgba(250, 250, 249, 0)",
        0.2: "rgba(254, 249, 195, 0.32)",
        0.4: "rgba(253, 224, 71, 0.48)",
        0.6: "rgba(251, 146, 60, 0.55)",
        0.8: "rgba(234, 88, 12, 0.6)",
        1.0: "rgba(153, 27, 27, 0.68)",
      },
    });

    layer.addTo(map);
    layerRef.current = layer;

    return () => {
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
    };
  }, [map, visible, properties, coordById]);

  return null;
}
