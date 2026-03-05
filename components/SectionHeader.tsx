import { View, Text, TouchableOpacity } from "react-native";

interface SectionHeaderProps {
  title: string;
  action?: string;
  onAction?: () => void;
}

export function SectionHeader({ title, action, onAction }: SectionHeaderProps) {
  return (
    <View className="mb-3 flex-row items-center justify-between">
      <Text className="text-lg font-bold text-white">{title}</Text>
      {action && (
        <TouchableOpacity onPress={onAction}>
          <Text className="text-sm text-brand">{action}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
