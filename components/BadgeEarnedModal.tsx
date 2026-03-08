import { useEffect } from "react";
import { View, Text, Modal, TouchableOpacity } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import type { Badge } from "@/lib/badges";

interface Props {
  badge: Badge | null;
  onDismiss: () => void;
}

export function BadgeEarnedModal({ badge, onDismiss }: Props) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (badge) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      opacity.value = withTiming(1, { duration: 200 });
      scale.value = withSequence(
        withSpring(1.2, { damping: 8, stiffness: 150 }),
        withDelay(100, withSpring(1, { damping: 12 })),
      );
      // Auto-dismiss after 3.5s
      const timer = setTimeout(onDismiss, 3500);
      return () => clearTimeout(timer);
    } else {
      scale.value = 0;
      opacity.value = 0;
    }
  }, [badge]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  if (!badge) return null;

  return (
    <Modal visible transparent animationType="fade">
      <TouchableOpacity
        className="flex-1 items-center justify-center bg-black/60"
        activeOpacity={1}
        onPress={onDismiss}
      >
        <Animated.View style={animStyle}>
          <View className="items-center rounded-3xl bg-[#1A1A24] px-10 py-8">
            <Text className="text-5xl">{badge.icon}</Text>
            <Text className="mt-3 text-lg font-bold text-white">
              {badge.name}
            </Text>
            <Text className="mt-1 text-sm text-gray-400">
              {badge.description}
            </Text>
            <View
              className="mt-3 rounded-full px-3 py-1"
              style={{ backgroundColor: badge.color + "20" }}
            >
              <Text
                className="text-xs font-semibold"
                style={{ color: badge.color }}
              >
                Badge Earned!
              </Text>
            </View>
          </View>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
}
