import { View, Text, TouchableOpacity } from "react-native";

interface SessionCardProps {
  type: "run" | "lift";
  title: string;
  status: "scheduled" | "completed" | "skipped";
  onStart: () => void;
  onSkip: () => void;
}

export function SessionCard({
  type,
  title,
  status,
  onStart,
  onSkip,
}: SessionCardProps) {
  return (
    <View
      className="mb-1 flex-row items-center gap-3 rounded-lg p-2"
      style={{
        backgroundColor:
          status === "completed"
            ? "rgba(52,211,153,0.08)"
            : status === "skipped"
              ? "rgba(107,114,128,0.08)"
              : "rgba(255,255,255,0.03)",
        opacity: status === "skipped" ? 0.5 : 1,
      }}
    >
      <Text className="text-lg">{type === "run" ? "🏃" : "🏋️"}</Text>
      <View className="flex-1">
        <Text className="text-xs font-medium text-white" numberOfLines={1}>
          {title}
        </Text>
      </View>
      {status === "completed" ? (
        <Text className="text-xs text-green-500">✓</Text>
      ) : (
        <View className="flex-row gap-1">
          <TouchableOpacity
            className="rounded bg-brand px-2 py-1"
            onPress={onStart}
          >
            <Text className="text-[10px] text-white">Start</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="rounded bg-[#2A2A3A] px-2 py-1"
            onPress={onSkip}
          >
            <Text className="text-[10px] text-gray-400">Skip</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
