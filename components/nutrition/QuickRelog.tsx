import { useMemo } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Star, ChevronRight } from "lucide-react-native";
import {
  useFoodFavourites,
  type FoodFavourite,
} from "@/hooks/useFoodFavourites";

interface QuickRelogProps {
  onSelect: (food: FoodFavourite) => void;
  onViewAll?: () => void;
}

const FOOD_EMOJI: Record<string, string> = {
  egg: "🥚",
  chicken: "🍗",
  rice: "🍚",
  bread: "🍞",
  banana: "🍌",
  oats: "🥣",
  protein: "🥛",
  salad: "🥗",
  fish: "🐟",
  beef: "🥩",
  pasta: "🍝",
  yogurt: "🥛",
  apple: "🍎",
  coffee: "☕",
  sandwich: "🥪",
};

function getFoodEmoji(name: string): string {
  const lower = name.toLowerCase();
  for (const [key, emoji] of Object.entries(FOOD_EMOJI)) {
    if (lower.includes(key)) return emoji;
  }
  return "🍽️";
}

export function QuickRelog({ onSelect, onViewAll }: QuickRelogProps) {
  const { favourites, getTimeRelevant } = useFoodFavourites();

  const relevant = useMemo(
    () => getTimeRelevant(new Date().getHours()),
    [getTimeRelevant],
  );

  if (relevant.length === 0) return null;

  return (
    <View>
      <View className="mb-2 flex-row items-center justify-between">
        <View className="flex-row items-center gap-1.5">
          <Star size={14} color="#f59e0b" />
          <Text className="text-sm font-medium text-gray-400">Quick Add</Text>
        </View>
        {favourites.length > 5 && onViewAll && (
          <TouchableOpacity
            className="flex-row items-center gap-0.5"
            onPress={onViewAll}
          >
            <Text className="text-[11px] font-medium text-brand">See all</Text>
            <ChevronRight size={12} color="#8b5cf6" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, paddingBottom: 4 }}
      >
        {relevant.map((fav) => (
          <TouchableOpacity
            key={fav.id}
            className="flex-row items-center gap-1.5 rounded-full border border-yellow-500/20 px-3 py-2"
            style={{ backgroundColor: "rgba(245,158,11,0.06)" }}
            onPress={() => onSelect(fav)}
          >
            <Text>{getFoodEmoji(fav.name)}</Text>
            <Text className="text-xs font-medium text-white" numberOfLines={1}>
              {fav.name}
            </Text>
            <Text className="text-xs text-gray-500">{fav.calories}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
