import type { GpsPoint } from "./types";

export interface MileSplit {
  mile: number;
  timeSeconds: number;
  pace: string; // "m:ss"
}

/**
 * Compute per-mile splits from a GPS route.
 * Uses haversine to accumulate distance and records the time
 * at each mile boundary.
 */
export function computeSplits(route: GpsPoint[]): MileSplit[] {
  if (route.length < 2) return [];

  const splits: MileSplit[] = [];
  let accumulated = 0;
  let mileStart = route[0].timestamp;
  let currentMile = 1;

  for (let i = 1; i < route.length; i++) {
    const prev = route[i - 1];
    const curr = route[i];
    accumulated += haversine(prev.lat, prev.lng, curr.lat, curr.lng);

    if (accumulated >= currentMile) {
      const splitTime = Math.round((curr.timestamp - mileStart) / 1000);
      const paceMin = Math.floor(splitTime / 60);
      const paceSec = splitTime % 60;
      splits.push({
        mile: currentMile,
        timeSeconds: splitTime,
        pace: `${paceMin}:${String(paceSec).padStart(2, "0")}`,
      });
      mileStart = curr.timestamp;
      currentMile++;
    }
  }

  // Partial last mile
  const remainder = accumulated - (currentMile - 1);
  if (remainder > 0.05 && route.length > 1) {
    const lastTime = Math.round(
      (route[route.length - 1].timestamp - mileStart) / 1000,
    );
    // Extrapolate pace for partial mile
    const fullMilePace = Math.round(lastTime / remainder);
    const paceMin = Math.floor(fullMilePace / 60);
    const paceSec = fullMilePace % 60;
    splits.push({
      mile: currentMile,
      timeSeconds: lastTime,
      pace: `${paceMin}:${String(paceSec).padStart(2, "0")}`,
    });
  }

  return splits;
}

function haversine(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 3958.8;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
