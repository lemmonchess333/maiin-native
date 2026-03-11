import { View, Text, TouchableOpacity } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { Droplets, Plus } from "lucide-react-native";
import { useWaterLog } from "@/hooks/useWaterLog";
import * as haptics from "@/lib/haptics";

export function WaterTracker() {
  const { glasses, target, logWater, progress } = useWaterLog();

  const handleLog = async () => {
    haptics.lightTap();
    await logWater(1);
  };

  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.min(progress, 1));

  return (
    <View className="rounded-2xl border border-[#2A2A3A] bg-[#1A1A24] p-4">
      <View className="flex-row items-center gap-4">
        {/* Progress ring */}
        <View className="relative h-12 w-12">
          <Svg
            width={48}
            height={48}
            viewBox="0 0 48 48"
            style={{ transform: [{ rotate: "-90deg" }] }}
          >
            <Circle
              cx={24}
              cy={24}
              r={radius}
              fill="none"
              stroke="#2A2A3A"
              strokeWidth={3}
            />
            <Circle
              cx={24}
              cy={24}
              r={radius}
              fill="none"
              stroke="#3b82f6"
              strokeWidth={3}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
            />
          </Svg>
          <View className="absolute inset-0 items-center justify-center">
            <Droplets size={16} color="#3b82f6" />
          </View>
        </View>

        {/* Info */}
        <View className="flex-1">
          <Text className="text-[10px] uppercase tracking-wider text-gray-500">
            Water
          </Text>
          <Text className="text-sm font-semibold text-white">
            {glasses} / {target} glasses
          </Text>
          <Text className="text-[10px] text-gray-500">
            {Math.round(glasses * 250)}ml ({Math.round(glasses * 8.45)} fl oz)
          </Text>
        </View>

        {/* Log button */}
        <TouchableOpacity
          className="h-10 w-10 items-center justify-center rounded-full border border-blue-500/20"
          style={{ backgroundColor: "rgba(59,130,246,0.1)" }}
          onPress={handleLog}
        >
          <Plus size={16} color="#3b82f6" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
