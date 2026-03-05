import { useMemo } from "react";
import { View, Text } from "react-native";
import MapLibreGL from "@maplibre/maplibre-react-native";
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
    return {
      ne: [maxLng, maxLat] as [number, number],
      sw: [minLng, minLat] as [number, number],
    };
  }, [route]);

  const center = useMemo(
    () => [
      (bounds.ne[0] + bounds.sw[0]) / 2,
      (bounds.ne[1] + bounds.sw[1]) / 2,
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
      <MapLibreGL.MapView
        style={{ flex: 1 }}
        mapStyle={STYLE_URL}
        attributionEnabled={false}
        logoEnabled={false}
      >
        <MapLibreGL.Camera
          defaultSettings={{
            centerCoordinate: center,
            zoomLevel: 14,
          }}
          bounds={{
            ne: bounds.ne,
            sw: bounds.sw,
            paddingTop: 40,
            paddingBottom: 40,
            paddingLeft: 40,
            paddingRight: 40,
          }}
        />
        <MapLibreGL.ShapeSource id="routeSource" shape={routeGeoJSON}>
          <MapLibreGL.LineLayer
            id="routeLine"
            style={{
              lineColor: "#FF6B6B",
              lineWidth: 4,
              lineCap: "round",
              lineJoin: "round",
            }}
          />
        </MapLibreGL.ShapeSource>
        {/* Start marker */}
        <MapLibreGL.PointAnnotation
          id="start"
          coordinate={coordinates[0]}
          title="Start"
        >
          <View className="h-4 w-4 rounded-full border-2 border-white bg-success" />
        </MapLibreGL.PointAnnotation>
        {/* End marker */}
        <MapLibreGL.PointAnnotation
          id="end"
          coordinate={coordinates[coordinates.length - 1]}
          title="Finish"
        >
          <View className="h-4 w-4 rounded-full border-2 border-white bg-running" />
        </MapLibreGL.PointAnnotation>
      </MapLibreGL.MapView>
    </View>
  );
}
