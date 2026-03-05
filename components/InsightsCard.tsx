import { useMemo } from "react";
import { View, Text } from "react-native";
import { Card } from "@/components/Card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react-native";
import type { Workout, Run } from "@/lib/types";

interface InsightsCardProps {
  workouts: Workout[];
  runs: Run[];
}

export function InsightsCard({ workouts, runs }: InsightsCardProps) {
  const insights = useMemo(() => {
    const now = Date.now();
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const twoWeeksAgo = now - 14 * 24 * 60 * 60 * 1000;

    // This week
    const thisWeekWorkouts = workouts.filter(
      (w) => w.createdAt.toMillis() > weekAgo,
    );
    const thisWeekRuns = runs.filter(
      (r) => r.createdAt.toMillis() > weekAgo,
    );
    const thisWeekSessions = thisWeekWorkouts.length + thisWeekRuns.length;
    const thisWeekVolume = thisWeekWorkouts.reduce(
      (sum, w) =>
        sum +
        w.exercises.reduce(
          (s, ex) =>
            s + ex.sets.reduce((ss, set) => ss + set.weight * set.reps, 0),
          0,
        ),
      0,
    );
    const thisWeekMiles = thisWeekRuns.reduce(
      (s, r) => s + r.distanceMiles,
      0,
    );

    // Last week
    const lastWeekWorkouts = workouts.filter((w) => {
      const t = w.createdAt.toMillis();
      return t > twoWeeksAgo && t <= weekAgo;
    });
    const lastWeekRuns = runs.filter((r) => {
      const t = r.createdAt.toMillis();
      return t > twoWeeksAgo && t <= weekAgo;
    });
    const lastWeekSessions = lastWeekWorkouts.length + lastWeekRuns.length;
    const lastWeekVolume = lastWeekWorkouts.reduce(
      (sum, w) =>
        sum +
        w.exercises.reduce(
          (s, ex) =>
            s + ex.sets.reduce((ss, set) => ss + set.weight * set.reps, 0),
          0,
        ),
      0,
    );

    const sessionTrend =
      lastWeekSessions > 0
        ? Math.round(
            ((thisWeekSessions - lastWeekSessions) / lastWeekSessions) * 100,
          )
        : thisWeekSessions > 0
          ? 100
          : 0;

    const volumeTrend =
      lastWeekVolume > 0
        ? Math.round(
            ((thisWeekVolume - lastWeekVolume) / lastWeekVolume) * 100,
          )
        : thisWeekVolume > 0
          ? 100
          : 0;

    return {
      thisWeekSessions,
      thisWeekVolume,
      thisWeekMiles,
      sessionTrend,
      volumeTrend,
    };
  }, [workouts, runs]);

  if (insights.thisWeekSessions === 0) return null;

  return (
    <Card className="mb-5">
      <Text className="mb-3 text-sm font-semibold text-white">
        Weekly Insights
      </Text>
      <View className="flex-row justify-between">
        <InsightStat
          label="Sessions"
          value={String(insights.thisWeekSessions)}
          trend={insights.sessionTrend}
        />
        <InsightStat
          label="Volume"
          value={`${(insights.thisWeekVolume / 1000).toFixed(1)}k`}
          trend={insights.volumeTrend}
          unit="lbs"
        />
        <InsightStat
          label="Miles"
          value={insights.thisWeekMiles.toFixed(1)}
        />
      </View>
    </Card>
  );
}

function InsightStat({
  label,
  value,
  trend,
  unit,
}: {
  label: string;
  value: string;
  trend?: number;
  unit?: string;
}) {
  const TrendIcon =
    trend != null && trend > 0
      ? TrendingUp
      : trend != null && trend < 0
        ? TrendingDown
        : Minus;
  const trendColor =
    trend != null && trend > 0
      ? "#34d399"
      : trend != null && trend < 0
        ? "#FF6B6B"
        : "#6B7280";

  return (
    <View className="items-center">
      <Text className="text-lg font-bold text-white">{value}</Text>
      {unit && <Text className="text-[10px] text-gray-500">{unit}</Text>}
      <Text className="text-xs text-gray-400">{label}</Text>
      {trend != null && (
        <View className="mt-1 flex-row items-center">
          <TrendIcon size={10} color={trendColor} />
          <Text style={{ color: trendColor }} className="ml-0.5 text-[10px]">
            {trend > 0 ? "+" : ""}
            {trend}%
          </Text>
        </View>
      )}
    </View>
  );
}
