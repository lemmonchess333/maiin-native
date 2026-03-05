import { View, Text } from "react-native";

interface StatBadgeProps {
  label: string;
  value: string;
  color?: "brand" | "running" | "teal" | "success" | "warning";
}

const colorMap = {
  brand: "text-brand",
  running: "text-running",
  teal: "text-teal",
  success: "text-success",
  warning: "text-warning",
} as const;

export function StatBadge({ label, value, color = "brand" }: StatBadgeProps) {
  return (
    <View className="items-center">
      <Text className={`text-2xl font-bold ${colorMap[color]}`}>{value}</Text>
      <Text className="mt-1 text-xs text-gray-400">{label}</Text>
    </View>
  );
}
