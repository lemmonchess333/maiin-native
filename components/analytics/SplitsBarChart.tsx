import { View, Text } from "react-native";
import { BarChart } from "react-native-gifted-charts";

interface Split {
  km: number;
  pace: string;
  paceSeconds: number;
}

interface SplitsBarChartProps {
  splits: Split[];
  avgPaceSeconds: number;
  accentColor?: string;
}

export function SplitsBarChart({
  splits,
  avgPaceSeconds,
  accentColor = "#2dd4bf",
}: SplitsBarChartProps) {
  if (splits.length === 0) return null;

  const maxPace = Math.max(...splits.map((s) => s.paceSeconds));

  const chartData = splits.map((s) => {
    const isFast = s.paceSeconds < avgPaceSeconds * 0.97;
    const isSlow = s.paceSeconds > avgPaceSeconds * 1.03;
    return {
      value: maxPace - s.paceSeconds + 60,
      label: `${s.km}`,
      frontColor: isFast
        ? accentColor
        : isSlow
          ? `${accentColor}59`
          : `${accentColor}A6`,
    };
  });

  const avgMin = Math.floor(avgPaceSeconds / 60);
  const avgSec = Math.floor(avgPaceSeconds) % 60;

  return (
    <View className="rounded-2xl border border-[#2A2A3A] bg-[#1A1A24] p-4">
      <View className="mb-3 flex-row items-center justify-between">
        <Text className="text-sm font-semibold text-white">Splits</Text>
        <Text className="text-[10px] text-gray-500">
          avg {avgMin}:{String(avgSec).padStart(2, "0")}/km
        </Text>
      </View>
      <BarChart
        data={chartData}
        barWidth={18}
        barBorderRadius={4}
        height={130}
        spacing={8}
        hideYAxisText
        xAxisColor="transparent"
        yAxisColor="transparent"
        xAxisLabelTextStyle={{ color: "rgba(255,255,255,0.3)", fontSize: 10 }}
        rulesColor="transparent"
      />
      <View className="mt-1 flex-row justify-around">
        {splits.map((s, i) => {
          const isFast = s.paceSeconds < avgPaceSeconds * 0.97;
          const isSlow = s.paceSeconds > avgPaceSeconds * 1.03;
          return (
            <Text
              key={i}
              className="text-[10px]"
              style={{
                color: isFast ? "#34d399" : isSlow ? "#FF6B6B" : "#6B7280",
                fontVariant: ["tabular-nums"],
              }}
            >
              {s.pace}
            </Text>
          );
        })}
      </View>
    </View>
  );
}
