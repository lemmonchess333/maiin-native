import { useCallback } from "react";
import { TouchableOpacity, type TouchableOpacityProps } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface PressableScaleProps extends TouchableOpacityProps {
  children: React.ReactNode;
  className?: string;
}

export function PressableScale({
  children,
  onPressIn,
  onPressOut,
  ...props
}: PressableScaleProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(
    (e: any) => {
      scale.value = withSpring(0.96, { damping: 15, stiffness: 300 });
      onPressIn?.(e);
    },
    [onPressIn],
  );

  const handlePressOut = useCallback(
    (e: any) => {
      scale.value = withSpring(1, { damping: 15, stiffness: 300 });
      onPressOut?.(e);
    },
    [onPressOut],
  );

  return (
    <AnimatedTouchable
      style={animatedStyle}
      activeOpacity={0.9}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      {...props}
    >
      {children}
    </AnimatedTouchable>
  );
}
