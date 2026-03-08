/**
 * Background GPS tracking for runs.
 * Uses expo-task-manager + expo-location to continue GPS tracking when app is backgrounded.
 */

import { useEffect, useRef, useCallback } from "react";
import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import type { GpsPoint } from "@/lib/types";

const LOCATION_TASK = "background-location-task";

// Route buffer for background updates
let backgroundRouteBuffer: GpsPoint[] = [];

TaskManager.defineTask(LOCATION_TASK, ({ data, error }) => {
  if (error) return;
  if (data) {
    const { locations } = data as { locations: Location.LocationObject[] };
    for (const loc of locations) {
      backgroundRouteBuffer.push({
        lat: loc.coords.latitude,
        lng: loc.coords.longitude,
        timestamp: loc.timestamp,
      });
    }
  }
});

export function useBackgroundLocation() {
  const isTracking = useRef(false);

  const startBackgroundTracking = useCallback(async () => {
    const { status: fg } = await Location.requestForegroundPermissionsAsync();
    if (fg !== "granted") return false;

    const { status: bg } = await Location.requestBackgroundPermissionsAsync();
    if (bg !== "granted") return false;

    backgroundRouteBuffer = [];

    await Location.startLocationUpdatesAsync(LOCATION_TASK, {
      accuracy: Location.Accuracy.High,
      timeInterval: 2000,
      distanceInterval: 5,
      foregroundService: {
        notificationTitle: "Maiin is tracking your run",
        notificationBody: "GPS active",
        notificationColor: "#FF6B6B",
      },
      showsBackgroundLocationIndicator: true,
    });

    isTracking.current = true;
    return true;
  }, []);

  const stopBackgroundTracking = useCallback(async () => {
    if (isTracking.current) {
      try {
        await Location.stopLocationUpdatesAsync(LOCATION_TASK);
      } catch {}
      isTracking.current = false;
    }
  }, []);

  const getBackgroundRoute = useCallback((): GpsPoint[] => {
    return [...backgroundRouteBuffer];
  }, []);

  const clearBackgroundRoute = useCallback(() => {
    backgroundRouteBuffer = [];
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isTracking.current) {
        Location.stopLocationUpdatesAsync(LOCATION_TASK).catch(() => {});
      }
    };
  }, []);

  return {
    startBackgroundTracking,
    stopBackgroundTracking,
    getBackgroundRoute,
    clearBackgroundRoute,
  };
}
