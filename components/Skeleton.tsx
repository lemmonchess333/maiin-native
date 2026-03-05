import { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  className?: string;
}

export function Skeleton({
  width = "100%",
  height = 16,
  borderRadius = 8,
  className = "",
}: SkeletonProps) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.7, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: "#2A2A3A",
        },
        animatedStyle,
      ]}
      className={className}
    />
  );
}

export function SkeletonCard() {
  return (
    <View className="mb-3 rounded-2xl bg-[#1A1A24] p-4">
      <View className="flex-row items-center">
        <Skeleton width={40} height={40} borderRadius={20} />
        <View className="ml-3 flex-1">
          <Skeleton width="60%" height={14} className="mb-2" />
          <Skeleton width="80%" height={12} />
        </View>
        <Skeleton width={40} height={12} />
      </View>
    </View>
  );
}

export function SkeletonStatRow() {
  return (
    <View className="mb-5 flex-row justify-around rounded-2xl bg-[#1A1A24] p-4">
      <View className="items-center">
        <Skeleton width={40} height={24} className="mb-1" />
        <Skeleton width={60} height={12} />
      </View>
      <View className="items-center">
        <Skeleton width={40} height={24} className="mb-1" />
        <Skeleton width={60} height={12} />
      </View>
      <View className="items-center">
        <Skeleton width={40} height={24} className="mb-1" />
        <Skeleton width={60} height={12} />
      </View>
    </View>
  );
}
