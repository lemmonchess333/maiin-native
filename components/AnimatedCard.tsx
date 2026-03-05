import { View, type ViewProps } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

interface AnimatedCardProps extends ViewProps {
  className?: string;
  children: React.ReactNode;
  index?: number;
}

export function AnimatedCard({
  className = "",
  children,
  index = 0,
  ...props
}: AnimatedCardProps) {
  return (
    <Animated.View
      entering={FadeInDown.delay(index * 80)
        .duration(400)
        .springify()
        .damping(18)}
      className={`rounded-2xl bg-[#1A1A24] p-4 ${className}`}
      {...props}
    >
      {children}
    </Animated.View>
  );
}
