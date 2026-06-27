"use client";

import { useEffect, useMemo, useState } from "react";
import Map, { Layer, NavigationControl, Source } from "react-map-gl/maplibre";
import type { HeatmapLayerSpecification } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

import { useDashboard } from "@/components/dashboard-provider";
import { cn } from "@/lib/utils";

// Basemap dark da Carto (grátis, sem token).
const MAP_STYLE =
  "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

type Metrica = "obras" | "metragem";

function heatmapPaint(metrica: Metrica): HeatmapLayerSpecification["paint"] {
  return {
    "heatmap-weight":
      metrica === "metragem"
        ? ["interpolate", ["linear"], ["get", "metragem"], 0, 0, 12000, 1]
        : 1,
    "heatmap-intensity": ["interpolate", ["linear"], ["zoom"], 3, 1, 9, 3],
    "heatmap-color": [
      "interpolate",
      ["linear"],
      ["heatmap-density"],
      0,
      "rgba(0,0,0,0)",
      0.2,
      "rgba(59,108,246,0.35)",
      0.45,
      "rgba(59,108,246,0.7)",
      0.7,
      "rgba(34,184,207,0.85)",
      1,
      "rgba(127,231,255,0.95)",
    ],
    "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 3, 10, 9, 28],
    "heatmap-opacity": 0.85,
  };
}

export function MapaCalor() {
  const { obras } = useDashboard();
  const [mounted, setMounted] = useState(false);
  const [metrica, setMetrica] = useState<Metrica>("obras");

  useEffect(() => setMounted(true), []);

  const geojson = useMemo(
    () =>
      ({
        type: "FeatureCollection",
        features: obras.map((o) => ({
          type: "Feature",
          properties: { metragem: o.metragem },
          geometry: { type: "Point", coordinates: [o.lng, o.lat] },
        })),
      }) as GeoJSON.FeatureCollection,
    [obras],
  );

  return (
    <div className="relative h-[420px] overflow-hidden rounded-lg border border-border bg-card lg:h-full">
      {/* Toggle de métrica */}
      <div className="absolute left-3 top-3 z-10 flex rounded-md border border-border bg-background/80 p-0.5 backdrop-blur">
        {(["obras", "metragem"] as Metrica[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMetrica(m)}
            className={cn(
              "rounded px-2.5 py-1 text-xs font-medium capitalize transition-colors",
              metrica === m
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {m === "obras" ? "Obras" : "Metragem"}
          </button>
        ))}
      </div>

      {mounted ? (
        <Map
          initialViewState={{ longitude: -51, latitude: -14, zoom: 3.2 }}
          mapStyle={MAP_STYLE}
          style={{ width: "100%", height: "100%" }}
          attributionControl={false}
        >
          <Source id="obras" type="geojson" data={geojson}>
            <Layer id="heat" type="heatmap" paint={heatmapPaint(metrica)} />
          </Source>
          <NavigationControl position="bottom-right" showCompass={false} />
        </Map>
      ) : (
        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
          Carregando mapa…
        </div>
      )}
    </div>
  );
}
