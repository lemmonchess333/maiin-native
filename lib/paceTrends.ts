/**
 * Pace Trend Badges — compare runs within 20% distance to detect improvement trends.
 * Pure TypeScript, no web dependencies.
 */

export type PaceTrend = "pr" | "improving" | "consistent" | "no-data";

export interface PaceTrendResult {
  trend: PaceTrend;
  label: string;
  color: string;
  bgColor: string;
}

interface RunForTrend {
  distance: number; // metres
  avgPace: number; // sec/km
  completedAt: Date;
}

const MIN_COMPARABLE_RUNS = 8;
const DISTANCE_TOLERANCE = 0.2; // 20%

export function calculatePaceTrend(
  currentRun: RunForTrend,
  allRuns: RunForTrend[],
): PaceTrendResult {
  if (currentRun.avgPace <= 0 || currentRun.distance <= 0) {
    return { trend: "no-data", label: "", color: "", bgColor: "" };
  }

  const comparable = allRuns.filter((r) => {
    if (r.completedAt.getTime() === currentRun.completedAt.getTime())
      return false;
    if (r.avgPace <= 0 || r.distance <= 0) return false;
    const ratio = r.distance / currentRun.distance;
    return ratio >= 1 - DISTANCE_TOLERANCE && ratio <= 1 + DISTANCE_TOLERANCE;
  });

  if (comparable.length < MIN_COMPARABLE_RUNS) {
    return { trend: "no-data", label: "", color: "", bgColor: "" };
  }

  const sorted = [...comparable].sort(
    (a, b) => a.completedAt.getTime() - b.completedAt.getTime(),
  );

  const bestPace = Math.min(...sorted.map((r) => r.avgPace));
  const recentAvg =
    sorted.slice(-3).reduce((s, r) => s + r.avgPace, 0) /
    Math.min(3, sorted.length);

  if (currentRun.avgPace < bestPace) {
    return {
      trend: "pr",
      label: "PR!",
      color: "#f59e0b",
      bgColor: "rgba(245, 158, 11, 0.15)",
    };
  }

  if (currentRun.avgPace < recentAvg * 0.98) {
    return {
      trend: "improving",
      label: "Faster",
      color: "#2dd4bf",
      bgColor: "rgba(45, 212, 191, 0.15)",
    };
  }

  if (currentRun.avgPace <= recentAvg * 1.02) {
    return {
      trend: "consistent",
      label: "Steady",
      color: "#8b5cf6",
      bgColor: "rgba(139, 92, 246, 0.15)",
    };
  }

  return { trend: "no-data", label: "", color: "", bgColor: "" };
}
