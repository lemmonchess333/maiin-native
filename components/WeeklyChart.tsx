import { View, Text } from "react-native";
import { BarChart } from "react-native-gifted-charts";
import type { Workout, Run } from "@/lib/types";

interface WeeklyChartProps {
  workouts: Workout[];
  runs: Run[];
}

function getLast7Days(): { label: string; start: number; end: number }[] {
  const days: { label: string; start: number; end: number }[] = [];
  const now = new Date();

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    const end = new Date(d);
    end.setHours(23, 59, 59, 999);
    days.push({
      label: d.toLocaleDateString("en-US", { weekday: "short" }).slice(0, 2),
      start: d.getTime(),
      end: end.getTime(),
    });
  }
  return days;
}

export function WeeklyChart({ workouts, runs }: WeeklyChartProps) {
  const days = getLast7Days();

  const data = days.map((day) => {
    const liftCount = workouts.filter((w) => {
      const t = w.createdAt.toMillis();
      return t >= day.start && t <= day.end;
    }).length;

    const runCount = runs.filter((r) => {
      const t = r.createdAt.toMillis();
      return t >= day.start && t <= day.end;
    }).length;

    return {
      value: liftCount + runCount,
      label: day.label,
      frontColor: liftCount > runCount ? "#8b5cf6" : runCount > 0 ? "#FF6B6B" : "#2A2A3A",
      topLabelComponent: () =>
        liftCount + runCount > 0 ? (
          <Text className="text-[9px] text-gray-400">
            {liftCount + runCount}
          </Text>
        ) : null,
    };
  });

  const hasActivity = data.some((d) => d.value > 0);

  if (!hasActivity) {
    return (
      <View className="items-center py-6">
        <Text className="text-sm text-gray-500">
          No activity this week — start one!
        </Text>
      </View>
    );
  }

  return (
    <View className="items-center">
      <BarChart
        data={data}
        width={280}
        height={120}
        barWidth={24}
        spacing={14}
        roundedTop
        roundedBottom
        noOfSections={3}
        yAxisThickness={0}
        xAxisThickness={0}
        xAxisLabelTextStyle={{ color: "#6B7280", fontSize: 10 }}
        hideRules
        hideYAxisText
        backgroundColor="transparent"
        isAnimated
        animationDuration={600}
      />
    </View>
  );
}
