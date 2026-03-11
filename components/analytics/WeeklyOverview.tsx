import { View, Text } from "react-native";
import Svg, { Circle as SvgCircle } from "react-native-svg";
import { Footprints, Dumbbell, UtensilsCrossed } from "lucide-react-native";

interface WeeklyOverviewProps {
  runCount: number;
  runDistance: number;
  liftCount: number;
  liftVolume: number;
  caloriesBurned: number;
  nutritionAdherence: number;
}

function Ring({
  value,
  max,
  color,
  size = 44,
}: {
  value: number;
  max: number;
  color: string;
  size?: number;
}) {
  const r = size / 2 - 5;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(value / Math.max(max, 1), 1);
  const half = size / 2;
  return (
    <Svg
      width={size}
      height={size}
      style={{ transform: [{ rotate: "-90deg" }] }}
    >
      <SvgCircle
        cx={half}
        cy={half}
        r={r}
        fill="none"
        stroke={`${color}18`}
        strokeWidth={4}
      />
      <SvgCircle
        cx={half}
        cy={half}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={4}
        strokeDasharray={`${circ * pct} ${circ}`}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function WeeklyOverview({
  runCount,
  runDistance,
  liftCount,
  liftVolume,
  caloriesBurned,
  nutritionAdherence,
}: WeeklyOverviewProps) {
  const volStr =
    liftVolume >= 1000
      ? `${(liftVolume / 1000).toFixed(1)}k`
      : `${Math.round(liftVolume)}`;

  const stats = [
    {
      icon: <Footprints size={16} color="#FF6B6B" />,
      label: "Runs",
      value: String(runCount),
      sub: `${runDistance.toFixed(1)} km`,
      color: "#FF6B6B",
      ringVal: runCount,
      ringMax: 5,
    },
    {
      icon: <Dumbbell size={16} color="#8b5cf6" />,
      label: "Sessions",
      value: String(liftCount),
      sub: `${volStr}kg vol`,
      color: "#8b5cf6",
      ringVal: liftCount,
      ringMax: 5,
    },
    {
      icon: <UtensilsCrossed size={16} color="#34d399" />,
      label: "Adherence",
      value: `${nutritionAdherence}%`,
      sub: `${caloriesBurned.toLocaleString()} cal`,
      color: "#34d399",
      ringVal: nutritionAdherence,
      ringMax: 100,
    },
  ];

  return (
    <View className="rounded-2xl border border-[#2A2A3A] bg-[#1A1A24] p-4">
      <Text className="mb-4 text-[9px] uppercase tracking-widest text-gray-500">
        This Week
      </Text>
      <View className="flex-row justify-around">
        {stats.map((s) => (
          <View key={s.label} className="items-center gap-2">
            <View className="relative">
              <Ring value={s.ringVal} max={s.ringMax} color={s.color} />
              <View className="absolute inset-0 items-center justify-center">
                {s.icon}
              </View>
            </View>
            <View className="items-center">
              <Text className="text-base font-bold text-white">{s.value}</Text>
              <Text className="text-[9px] text-gray-500">{s.sub}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
