import { View, Text } from "react-native";
import { BarChart } from "react-native-gifted-charts";

interface VolumeChartProps {
  data: { week: string; volume: number }[];
  accentColor?: string;
}

export function VolumeChart({ data, accentColor = "#8b5cf6" }: VolumeChartProps) {
  if (data.length === 0) return null;

  const chartData = data.map((d, i) => ({
    value: d.volume,
    label: (() => {
      const date = new Date(d.week);
      return `${date.getDate()}/${date.getMonth() + 1}`;
    })(),
    frontColor: i === data.length - 1 ? accentColor : `${accentColor}80`,
    topLabelComponent: undefined,
  }));

  const maxVal = Math.max(...data.map((d) => d.volume), 1);

  return (
    <View className="rounded-2xl border border-[#2A2A3A] bg-[#1A1A24] p-4">
      <View className="mb-3 flex-row items-center justify-between">
        <Text className="text-sm font-semibold text-white">Weekly Volume</Text>
        <Text className="text-[10px] text-gray-500">kg lifted</Text>
      </View>
      <BarChart
        data={chartData}
        barWidth={20}
        barBorderRadius={4}
        noOfSections={4}
        maxValue={maxVal * 1.1}
        height={120}
        spacing={12}
        xAxisColor="transparent"
        yAxisColor="transparent"
        yAxisTextStyle={{ color: "rgba(255,255,255,0.2)", fontSize: 9 }}
        xAxisLabelTextStyle={{ color: "rgba(255,255,255,0.3)", fontSize: 9 }}
        rulesColor="rgba(255,255,255,0.05)"
        formatYLabel={(val) => {
          const n = Number(val);
          return n >= 1000 ? `${(n / 1000).toFixed(0)}k` : String(Math.round(n));
        }}
      />
    </View>
  );
}
