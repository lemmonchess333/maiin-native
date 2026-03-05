import { useState, useEffect, useRef, useCallback } from "react";
import * as Location from "expo-location";
import type { GpsPoint } from "@/lib/types";

interface LocationState {
  tracking: boolean;
  route: GpsPoint[];
  distanceMiles: number;
  currentSpeed: number | null; // mph
  error: string | null;
}

function haversine(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 3958.8; // Earth radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function useLocation() {
  const [state, setState] = useState<LocationState>({
    tracking: false,
    route: [],
    distanceMiles: 0,
    currentSpeed: null,
    error: null,
  });
  const subRef = useRef<Location.LocationSubscription | null>(null);

  const startTracking = useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setState((s) => ({ ...s, error: "Location permission denied" }));
      return;
    }

    setState({
      tracking: true,
      route: [],
      distanceMiles: 0,
      currentSpeed: null,
      error: null,
    });

    subRef.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        distanceInterval: 5, // meters
        timeInterval: 3000, // ms
      },
      (loc) => {
        const point: GpsPoint = {
          lat: loc.coords.latitude,
          lng: loc.coords.longitude,
          timestamp: loc.timestamp,
        };
        // Speed in mph (loc.coords.speed is m/s)
        const speedMph =
          loc.coords.speed != null && loc.coords.speed >= 0
            ? loc.coords.speed * 2.237
            : null;

        setState((prev) => {
          const newRoute = [...prev.route, point];
          let addedDist = 0;
          if (prev.route.length > 0) {
            const last = prev.route[prev.route.length - 1];
            addedDist = haversine(last.lat, last.lng, point.lat, point.lng);
          }
          return {
            ...prev,
            route: newRoute,
            distanceMiles: prev.distanceMiles + addedDist,
            currentSpeed: speedMph,
          };
        });
      },
    );
  }, []);

  const stopTracking = useCallback(() => {
    subRef.current?.remove();
    subRef.current = null;
    setState((s) => ({ ...s, tracking: false }));
  }, []);

  const reset = useCallback(() => {
    stopTracking();
    setState({
      tracking: false,
      route: [],
      distanceMiles: 0,
      currentSpeed: null,
      error: null,
    });
  }, [stopTracking]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      subRef.current?.remove();
    };
  }, []);

  return { ...state, startTracking, stopTracking, reset };
}
