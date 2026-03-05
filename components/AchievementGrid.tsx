import { View, Text } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import {
  Trophy,
  Flame,
  Dumbbell,
  Route,
  Zap,
  Crown,
} from "lucide-react-native";
import type { Achievement } from "@/lib/achievements";

const ICONS = {
  trophy: Trophy,
  flame: Flame,
  dumbbell: Dumbbell,
  route: Route,
  zap: Zap,
  crown: Crown,
} as const;

interface AchievementGridProps {
  achievements: Achievement[];
}

export function AchievementGrid({ achievements }: AchievementGridProps) {
  return (
    <View className="flex-row flex-wrap">
      {achievements.map((a, i) => {
        const Icon = ICONS[a.icon];
        return (
          <Animated.View
            key={a.id}
            entering={FadeInDown.delay(i * 60).duration(350)}
            className="mb-3 w-1/2 px-1"
          >
            <View
              className={`items-center rounded-2xl p-4 ${
                a.unlocked ? "bg-[#1A1A24]" : "bg-[#13131A]"
              }`}
              style={a.unlocked ? undefined : { opacity: 0.4 }}
            >
              <View
                className="mb-2 h-10 w-10 items-center justify-center rounded-full"
                style={{ backgroundColor: `${a.color}20` }}
              >
                <Icon
                  size={20}
                  color={a.unlocked ? a.color : "#6B7280"}
                />
              </View>
              <Text
                className={`text-center text-xs font-bold ${
                  a.unlocked ? "text-white" : "text-gray-600"
                }`}
              >
                {a.title}
              </Text>
              <Text className="mt-0.5 text-center text-[10px] text-gray-500">
                {a.description}
              </Text>
            </View>
          </Animated.View>
        );
      })}
    </View>
  );
}
