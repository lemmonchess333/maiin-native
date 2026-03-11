import { View, Text, TouchableOpacity } from "react-native";

interface StatCardProps {
  label: string;
  value: string;
  unit?: string;
  delta?: { value: string; positive: boolean } | null;
  accentColor?: string;
  onPress?: () => void;
}

export function StatCard({
  label,
  value,
  unit,
  delta,
  accentColor = "#8b5cf6",
  onPress,
}: StatCardProps) {
  return (
    <TouchableOpacity
      className="flex-1 rounded-2xl border border-[#2A2A3A] bg-[#1A1A24] p-4"
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <Text className="mb-2 text-[9px] uppercase tracking-widest text-gray-500">
        {label}
      </Text>
      <View className="flex-row items-baseline gap-1">
        <Text className="text-2xl font-bold text-white">{value}</Text>
        {unit && <Text className="text-xs text-gray-500">{unit}</Text>}
      </View>
      {delta && (
        <View className="mt-1 flex-row items-center">
          <Text
            className="text-[10px] font-medium"
            style={{ color: delta.positive ? "#34d399" : "#FF6B6B" }}
          >
            {delta.positive ? "↑" : "↓"} {delta.value} vs last
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
