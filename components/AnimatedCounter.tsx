import { useEffect } from "react";
import { Text } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  useDerivedValue,
} from "react-native-reanimated";

const AnimatedText = Animated.createAnimatedComponent(Text);

interface AnimatedCounterProps {
  value: number;
  suffix?: string;
  decimals?: number;
  className?: string;
}

export function AnimatedCounter({
  value,
  suffix = "",
  decimals = 0,
  className = "",
}: AnimatedCounterProps) {
  const animValue = useSharedValue(0);

  useEffect(() => {
    animValue.value = withTiming(value, { duration: 800 });
  }, [value]);

  // Since animatedProps on Text is limited in RN, we use a simpler approach:
  // render the final value directly — the visual pop comes from the parent
  // FadeInDown animation on the card
  return (
    <Text className={className}>
      {decimals > 0 ? value.toFixed(decimals) : Math.round(value)}
      {suffix}
    </Text>
  );
}
