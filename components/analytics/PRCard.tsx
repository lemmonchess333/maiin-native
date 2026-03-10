import { View, Text } from "react-native";

interface PR {
  label: string;
  value: string;
  date: string;
  isNew?: boolean;
}

interface PRCardProps {
  title: string;
  prs: PR[];
  accentColor?: string;
}

export function PRCard({ title, prs, accentColor = "#f59e0b" }: PRCardProps) {
  if (prs.length === 0) return null;

  return (
    <View className="overflow-hidden rounded-2xl border border-[#2A2A3A] bg-[#1A1A24]">
      <View className="flex-row items-center border-b border-[#2A2A3A]/50 px-4 pb-3 pt-4">
        <Text className="text-base">🏆</Text>
        <Text className="ml-2 flex-1 text-sm font-semibold text-white">
          {title}
        </Text>
      </View>
      {prs.map((pr) => (
        <View
          key={pr.label}
          className="flex-row items-center justify-between border-b border-[#2A2A3A]/20 px-4 py-3 last:border-b-0"
        >
          <View className="flex-row items-center gap-2">
            {pr.isNew && (
              <View
                className="rounded-full px-1.5 py-0.5"
                style={{ backgroundColor: `${accentColor}20` }}
              >
                <Text
                  className="text-[9px] font-bold tracking-wider"
                  style={{ color: accentColor }}
                >
                  NEW
                </Text>
              </View>
            )}
            <Text className="text-xs text-gray-400">{pr.label}</Text>
          </View>
          <View className="items-end">
            <Text className="text-sm font-bold text-white">{pr.value}</Text>
            <Text className="text-[9px] text-gray-600">{pr.date}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}
