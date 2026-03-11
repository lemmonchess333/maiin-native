import { useState, useMemo } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Heart, ChevronDown, ChevronUp } from "lucide-react-native";
import {
  calculateHealthScore,
  getScoreColor,
  getScoreLabel,
} from "@/lib/healthScore";
import { useMeals } from "@/hooks/useMeals";

interface HealthScoreCardProps {
  targetCalories?: number;
  targetProtein?: number;
  targetFiber?: number;
  targetSugar?: number;
  targetSodium?: number;
}

export function HealthScoreCard({
  targetCalories = 2200,
  targetProtein = 160,
  targetFiber = 30,
  targetSugar = 30,
  targetSodium = 2300,
}: HealthScoreCardProps) {
  const { meals, getDailyTotals } = useMeals();
  const [expanded, setExpanded] = useState(false);

  const today = new Date().toISOString().split("T")[0];
  const totals = getDailyTotals(today);
  const todayMeals = meals.filter((m) => m.date === today);

  const { score, breakdown } = useMemo(() => {
    return calculateHealthScore(
      {
        calories: totals.calories,
        protein: totals.protein,
        fiber: 0,
        sugar: 0,
        sodium: 0,
        mealCount: todayMeals.length,
      },
      {
        calories: targetCalories,
        protein: targetProtein,
        fiber: targetFiber,
        sugar: targetSugar,
        sodium: targetSodium,
      },
    );
  }, [
    totals,
    todayMeals.length,
    targetCalories,
    targetProtein,
    targetFiber,
    targetSugar,
    targetSodium,
  ]);

  const scoreColor = score != null ? getScoreColor(score) : undefined;

  const breakdownItems = [
    { label: "Calories", pts: breakdown.calories, max: 25 },
    { label: "Protein", pts: breakdown.protein, max: 25 },
    { label: "Fiber", pts: breakdown.fiber, max: 15 },
    { label: "Sugar", pts: breakdown.sugar, max: 10 },
    { label: "Sodium", pts: breakdown.sodium, max: 10 },
    { label: "Meal Timing", pts: breakdown.distribution, max: 15 },
  ];

  return (
    <View className="rounded-2xl border border-[#2A2A3A] bg-[#1A1A24] p-4">
      <TouchableOpacity
        className="flex-row items-center gap-3"
        onPress={() => score != null && setExpanded(!expanded)}
        activeOpacity={score != null ? 0.7 : 1}
      >
        <View
          className="h-10 w-10 items-center justify-center rounded-xl"
          style={{ backgroundColor: "rgba(236,72,153,0.1)" }}
        >
          <Heart size={20} color="#ec4899" />
        </View>

        <View className="flex-1">
          <Text className="text-[10px] uppercase tracking-wider text-gray-500">
            Health Score
          </Text>
          {score != null ? (
            <View className="flex-row items-center gap-2">
              <Text
                className="text-lg font-bold"
                style={{ color: scoreColor }}
              >
                {score}
              </Text>
              <Text className="text-xs text-gray-400">
                {getScoreLabel(score)}
              </Text>
            </View>
          ) : (
            <Text className="text-xs text-gray-400">
              Log 2+ meals to see score
            </Text>
          )}
        </View>

        {score != null && (
          <>
            {/* Mini progress bar */}
            <View className="h-1.5 w-16 overflow-hidden rounded-full bg-[#2A2A3A]">
              <View
                className="h-full rounded-full"
                style={{
                  width: `${score}%`,
                  backgroundColor: scoreColor,
                }}
              />
            </View>
            {expanded ? (
              <ChevronUp size={16} color="#6B7280" />
            ) : (
              <ChevronDown size={16} color="#6B7280" />
            )}
          </>
        )}
      </TouchableOpacity>

      {expanded && score != null && (
        <View className="mt-3 border-t border-[#2A2A3A]/30 pt-3">
          {breakdownItems.map((item) => (
            <View key={item.label} className="mb-2 flex-row items-center gap-2">
              <Text className="w-20 text-[11px] text-gray-500">
                {item.label}
              </Text>
              <View className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#2A2A3A]">
                <View
                  className="h-full rounded-full"
                  style={{
                    width: `${(item.pts / item.max) * 100}%`,
                    backgroundColor: scoreColor,
                  }}
                />
              </View>
              <Text className="w-8 text-right text-[10px] text-gray-500">
                {item.pts}/{item.max}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
