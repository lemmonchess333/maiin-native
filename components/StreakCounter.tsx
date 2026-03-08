import { View, Text } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Flame } from "lucide-react-native";

interface Props {
  currentStreak: number;
  longestStreak: number;
}

export function StreakCounter({ currentStreak, longestStreak }: Props) {
  return (
    <Animated.View entering={FadeInDown.delay(100).duration(400)}>
      <View className="flex-row items-center gap-3 rounded-xl bg-[#1A1A24] px-4 py-3">
        <View className="h-10 w-10 items-center justify-center rounded-full bg-warning/15">
          <Flame size={20} color="#f59e0b" />
        </View>
        <View className="flex-1">
          <View className="flex-row items-baseline gap-1">
            <Text className="text-2xl font-bold text-warning">
              {currentStreak}
            </Text>
            <Text className="text-sm text-gray-400">day streak</Text>
          </View>
          <Text className="text-xs text-gray-500">
            Best: {longestStreak} days
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}
