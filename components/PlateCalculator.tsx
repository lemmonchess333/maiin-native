import { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Card } from "@/components/Card";
import { Minus, Plus } from "lucide-react-native";
import * as haptics from "@/lib/haptics";

const PLATES = [
  { weight: 45, color: "#ef4444", label: "45" },
  { weight: 35, color: "#3b82f6", label: "35" },
  { weight: 25, color: "#22c55e", label: "25" },
  { weight: 10, color: "#f59e0b", label: "10" },
  { weight: 5, color: "#8b5cf6", label: "5" },
  { weight: 2.5, color: "#6B7280", label: "2.5" },
];

const BAR_WEIGHT = 45; // lbs

export function PlateCalculator() {
  const [totalWeight, setTotalWeight] = useState(BAR_WEIGHT);

  function calculatePlates(total: number): { weight: number; color: string; count: number }[] {
    let remaining = (total - BAR_WEIGHT) / 2;
    if (remaining <= 0) return [];
    const result: { weight: number; color: string; count: number }[] = [];
    for (const plate of PLATES) {
      const count = Math.floor(remaining / plate.weight);
      if (count > 0) {
        result.push({ weight: plate.weight, color: plate.color, count });
        remaining -= count * plate.weight;
      }
    }
    return result;
  }

  const plates = calculatePlates(totalWeight);

  function adjust(amount: number) {
    haptics.lightTap();
    setTotalWeight((prev) => Math.max(BAR_WEIGHT, prev + amount));
  }

  return (
    <Card>
      <Text className="mb-3 text-sm font-semibold text-white">
        Plate Calculator
      </Text>

      {/* Weight selector */}
      <View className="mb-4 flex-row items-center justify-center gap-4">
        <TouchableOpacity
          className="h-10 w-10 items-center justify-center rounded-full bg-[#2A2A3A]"
          onPress={() => adjust(-5)}
        >
          <Minus size={16} color="#fff" />
        </TouchableOpacity>
        <Text className="text-3xl font-bold text-white">
          {totalWeight}
          <Text className="text-lg text-gray-400"> lbs</Text>
        </Text>
        <TouchableOpacity
          className="h-10 w-10 items-center justify-center rounded-full bg-[#2A2A3A]"
          onPress={() => adjust(5)}
        >
          <Plus size={16} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Plate visualization */}
      <View className="items-center">
        {totalWeight <= BAR_WEIGHT ? (
          <Text className="text-sm text-gray-400">Empty bar ({BAR_WEIGHT} lbs)</Text>
        ) : (
          <>
            <Text className="mb-2 text-xs text-gray-400">
              Each side ({(totalWeight - BAR_WEIGHT) / 2} lbs):
            </Text>
            <View className="flex-row flex-wrap justify-center gap-2">
              {plates.map((plate) =>
                Array.from({ length: plate.count }, (_, i) => (
                  <View
                    key={`${plate.weight}-${i}`}
                    className="items-center justify-center rounded-lg px-3 py-2"
                    style={{ backgroundColor: plate.color + "30", borderWidth: 1, borderColor: plate.color }}
                  >
                    <Text className="text-sm font-bold" style={{ color: plate.color }}>
                      {plate.weight}
                    </Text>
                  </View>
                )),
              )}
            </View>
          </>
        )}
      </View>

      {/* Quick presets */}
      <View className="mt-4 flex-row flex-wrap justify-center gap-2">
        {[135, 185, 225, 275, 315, 405].map((w) => (
          <TouchableOpacity
            key={w}
            className={`rounded-lg px-3 py-1.5 ${totalWeight === w ? "bg-brand" : "bg-[#2A2A3A]"}`}
            onPress={() => {
              haptics.selection();
              setTotalWeight(w);
            }}
          >
            <Text
              className={`text-xs font-semibold ${totalWeight === w ? "text-white" : "text-gray-400"}`}
            >
              {w}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </Card>
  );
}
