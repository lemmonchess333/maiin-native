import { View, Text, TouchableOpacity } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon,
  title,
  subtitle,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <Animated.View
      entering={FadeIn.duration(500)}
      className="items-center rounded-2xl bg-[#1A1A24] px-6 py-10"
    >
      <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-[#0F0F14]">
        {icon}
      </View>
      <Text className="mb-1 text-base font-bold text-white">{title}</Text>
      <Text className="mb-4 text-center text-sm text-gray-400">
        {subtitle}
      </Text>
      {actionLabel && onAction && (
        <TouchableOpacity
          className="rounded-xl bg-brand px-6 py-3"
          onPress={onAction}
          activeOpacity={0.8}
        >
          <Text className="text-sm font-semibold text-white">
            {actionLabel}
          </Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}
