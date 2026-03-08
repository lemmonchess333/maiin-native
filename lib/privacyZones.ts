import type { GpsPoint } from "@/lib/types";

export interface PrivacyZone {
  id: string;
  name: string;
  lat: number;
  lon: number;
  radiusMeters: number;
}

function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function isInsideZone(point: GpsPoint, zone: PrivacyZone): boolean {
  return (
    haversineDistance(point.lat, point.lng, zone.lat, zone.lon) <=
    zone.radiusMeters
  );
}

export function applyPrivacyZones(
  points: GpsPoint[],
  zones: PrivacyZone[],
): GpsPoint[] {
  if (zones.length === 0) return points;
  return points.filter((p) => !zones.some((z) => isInsideZone(p, z)));
}
