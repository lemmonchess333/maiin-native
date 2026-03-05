import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { useBodyWeight } from "@/hooks/useBodyWeight";
import * as haptics from "@/lib/haptics";
import { Scale, Plus } from "lucide-react-native";

export function BodyWeightChart() {
  const { entries, logWeight } = useBodyWeight();
  const [input, setInput] = useState("");
  const [adding, setAdding] = useState(false);

  async function handleAdd() {
    const val = parseFloat(input);
    if (!val || val <= 0) {
      Alert.alert("Invalid", "Enter a valid weight.");
      return;
    }
    setAdding(true);
    try {
      await logWeight(val);
      haptics.success();
      setInput("");
    } catch {
      Alert.alert("Error", "Failed to save weight.");
    } finally {
      setAdding(false);
    }
  }

  // Reverse so oldest is first for the chart
  const sorted = [...entries].reverse();
  const chartData = sorted.map((e) => ({
    value: e.weight,
    label: e.date
      .toDate()
      .toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  }));

  const latest = entries[0]?.weight;
  const previous = entries[1]?.weight;
  const diff = latest && previous ? latest - previous : null;

  return (
    <View>
      {/* Quick log */}
      <View className="mb-4 flex-row items-center">
        <TextInput
          className="mr-2 h-10 flex-1 rounded-lg border border-[#2A2A3A] bg-[#0F0F14] px-3 text-white"
          placeholder="Weight (lbs)"
          placeholderTextColor="#6B7280"
          keyboardType="numeric"
          value={input}
          onChangeText={setInput}
        />
        <TouchableOpacity
          className="h-10 w-10 items-center justify-center rounded-lg bg-brand"
          onPress={handleAdd}
          disabled={adding}
        >
          <Plus size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Current weight */}
      {latest && (
        <View className="mb-3 flex-row items-baseline">
          <Text className="text-2xl font-bold text-white">{latest}</Text>
          <Text className="ml-1 text-sm text-gray-400">lbs</Text>
          {diff !== null && diff !== 0 && (
            <Text
              className={`ml-2 text-sm font-medium ${
                diff > 0 ? "text-running" : "text-success"
              }`}
            >
              {diff > 0 ? "+" : ""}
              {diff.toFixed(1)}
            </Text>
          )}
        </View>
      )}

      {/* Chart */}
      {chartData.length >= 2 ? (
        <View className="items-center">
          <LineChart
            data={chartData}
            width={280}
            height={100}
            spacing={chartData.length > 10 ? 28 : 40}
            color="#8b5cf6"
            thickness={2}
            dataPointsColor="#8b5cf6"
            dataPointsRadius={3}
            yAxisThickness={0}
            xAxisThickness={0}
            hideRules
            hideYAxisText
            xAxisLabelTextStyle={{ color: "#6B7280", fontSize: 8 }}
            curved
            isAnimated
            animationDuration={500}
            areaChart
            startFillColor="rgba(139,92,246,0.2)"
            endFillColor="rgba(139,92,246,0)"
          />
        </View>
      ) : (
        <View className="items-center py-4">
          <Scale size={24} color="#6B7280" />
          <Text className="mt-2 text-xs text-gray-500">
            Log at least 2 entries to see a trend
          </Text>
        </View>
      )}
    </View>
  );
}
