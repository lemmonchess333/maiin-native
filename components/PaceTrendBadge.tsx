import { View, Text } from "react-native";
import { calculatePaceTrend, type PaceTrendResult } from "@/lib/paceTrends";
import type { Run } from "@/lib/types";

interface Props {
  run: Run;
  allRuns: Run[];
}

function toTrendInput(run: Run) {
  const distanceMetres = run.distanceMiles * 1609.34;
  const distanceKm = distanceMetres / 1000;
  const avgPace = distanceKm > 0 ? run.durationSeconds / distanceKm : 0;
  return {
    distance: distanceMetres,
    avgPace,
    completedAt: run.createdAt?.toDate?.() ?? new Date(),
  };
}

export function PaceTrendBadge({ run, allRuns }: Props) {
  const current = toTrendInput(run);
  const all = allRuns.map(toTrendInput);
  const result = calculatePaceTrend(current, all);

  if (result.trend === "no-data") return null;

  const emoji =
    result.trend === "pr"
      ? "\u{1F3C6}"
      : result.trend === "improving"
        ? "\u{1F525}"
        : "\u2713";

  return (
    <View
      className="self-center rounded-full px-3 py-1"
      style={{ backgroundColor: result.bgColor }}
    >
      <Text style={{ color: result.color }} className="text-sm font-semibold">
        {emoji} {result.label}
      </Text>
    </View>
  );
}
