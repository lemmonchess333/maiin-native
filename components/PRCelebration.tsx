import { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withDelay,
  withSpring,
  runOnJS,
} from "react-native-reanimated";
import { Trophy } from "lucide-react-native";

interface PRCelebrationProps {
  exercise: string;
  weight: number;
  visible: boolean;
  onDone: () => void;
}

export function PRCelebration({
  exercise,
  weight,
  visible,
  onDone,
}: PRCelebrationProps) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.5);
  const translateY = useSharedValue(20);

  useEffect(() => {
    if (visible) {
      opacity.value = withSequence(
        withTiming(1, { duration: 300 }),
        withDelay(2000, withTiming(0, { duration: 400 })),
      );
      scale.value = withSequence(
        withSpring(1.1, { damping: 8, stiffness: 200 }),
        withDelay(100, withSpring(1, { damping: 12 })),
        withDelay(1900, withTiming(0.8, { duration: 400 })),
      );
      translateY.value = withSequence(
        withSpring(0, { damping: 12 }),
        withDelay(
          2200,
          withTiming(-20, { duration: 300 }, () => {
            runOnJS(onDone)();
          }),
        ),
      );
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { scale: scale.value },
      { translateY: translateY.value },
    ],
  }));

  if (!visible) return null;

  return (
    <View style={styles.overlay} pointerEvents="none">
      <Animated.View style={[styles.badge, animatedStyle]}>
        <View className="mb-2 h-12 w-12 items-center justify-center rounded-full bg-warning/30">
          <Trophy size={24} color="#f59e0b" />
        </View>
        <Text className="text-lg font-bold text-white">New PR!</Text>
        <Text className="text-sm text-warning">{exercise}</Text>
        <Text className="text-xs text-gray-400">{weight} lbs</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },
  badge: {
    backgroundColor: "#1A1A24",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#f59e0b",
    shadowColor: "#f59e0b",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
});
