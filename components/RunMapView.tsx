import { useMemo } from "react";
import { View, Text } from "react-native";
import {
  Map,
  Camera,
  GeoJSONSource,
  Layer,
  ViewAnnotation,
} from "@maplibre/maplibre-react-native";
import type { GpsPoint } from "@/lib/types";

interface RunMapViewProps {
  route: GpsPoint[];
  /** Height of the map container */
  height?: number;
}

// Use OSM tiles (free, no API key needed)
const STYLE_URL =
  "https://demotiles.maplibre.org/style.json";

export function RunMapView({ route, height = 200 }: RunMapViewProps) {
  if (route.length === 0) {
    return (
      <View
        className="items-center justify-center rounded-xl bg-[#1A1A24]"
        style={{ height }}
      >
        <Text className="text-sm text-gray-500">No GPS data</Text>
      </View>
    );
  }

  const coordinates = useMemo(
    () => route.map((p) => [p.lng, p.lat] as [number, number]),
    [route],
  );

  const bounds = useMemo(() => {
    let minLat = route[0].lat;
    let maxLat = route[0].lat;
    let minLng = route[0].lng;
    let maxLng = route[0].lng;
    for (const p of route) {
      if (p.lat < minLat) minLat = p.lat;
      if (p.lat > maxLat) maxLat = p.lat;
      if (p.lng < minLng) minLng = p.lng;
      if (p.lng > maxLng) maxLng = p.lng;
    }
    return [minLng, minLat, maxLng, maxLat] as [number, number, number, number];
  }, [route]);

  const center = useMemo(
    () => [
      (bounds[0] + bounds[2]) / 2,
      (bounds[1] + bounds[3]) / 2,
    ] as [number, number],
    [bounds],
  );

  const routeGeoJSON = useMemo(
    () => ({
      type: "Feature" as const,
      geometry: {
        type: "LineString" as const,
        coordinates,
      },
      properties: {},
    }),
    [coordinates],
  );

  return (
    <View className="overflow-hidden rounded-xl" style={{ height }}>
      <Map
        style={{ flex: 1 }}
        mapStyle={STYLE_URL}
        attribution={false}
        logo={false}
      >
        <Camera
          initialViewState={{
            center,
            zoom: 14,
            bounds,
            padding: { top: 40, bottom: 40, left: 40, right: 40 },
          }}
        />
        <GeoJSONSource id="routeSource" data={routeGeoJSON}>
          <Layer
            id="routeLine"
            type="line"
            paint={{
              "line-color": "#FF6B6B",
              "line-width": 4,
            }}
            layout={{
              "line-cap": "round",
              "line-join": "round",
            }}
          />
        </GeoJSONSource>
        {/* Start marker */}
        <ViewAnnotation
          id="start"
          lngLat={coordinates[0]}
          title="Start"
        >
          <View className="h-4 w-4 rounded-full border-2 border-white bg-success" />
        </ViewAnnotation>
        {/* End marker */}
        <ViewAnnotation
          id="end"
          lngLat={coordinates[coordinates.length - 1]}
          title="Finish"
        >
          <View className="h-4 w-4 rounded-full border-2 border-white bg-running" />
        </ViewAnnotation>
      </Map>
    </View>
  );
}
