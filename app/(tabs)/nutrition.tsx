import { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { SectionHeader } from "@/components/SectionHeader";
import { useMeals, type MealItem } from "@/hooks/useMeals";
import { useWaterLog } from "@/hooks/useWaterLog";
import { useFoodAnalysis } from "@/hooks/useFoodAnalysis";
import { useFoodFavourites } from "@/hooks/useFoodFavourites";
import { parseFoodText } from "@/lib/nlFoodParser";
import * as haptics from "@/lib/haptics";
import { WaterTracker } from "@/components/nutrition/WaterTracker";
import { HealthScoreCard } from "@/components/nutrition/HealthScoreCard";
import { QuickRelog } from "@/components/nutrition/QuickRelog";
import { VoiceLogger } from "@/components/nutrition/VoiceLogger";
import { BarcodeScanner } from "@/components/nutrition/BarcodeScanner";
import {
  Camera,
  Plus,
  Droplets,
  Trash2,
  Search,
  Flame,
  ScanLine,
  Mic,
} from "lucide-react-native";

export default function NutritionScreen() {
  const today = new Date().toISOString().split("T")[0];
  const { meals, addMeal, deleteMeal, getDailyTotals } = useMeals();
  const { glasses, target, logWater, progress } = useWaterLog();
  const { analyzeFood, loading: analyzing, result, reset } = useFoodAnalysis();
  const { addFavourite } = useFoodFavourites();
  const [showManualAdd, setShowManualAdd] = useState(false);
  const [showBarcode, setShowBarcode] = useState(false);
  const [showVoice, setShowVoice] = useState(false);
  const [manualName, setManualName] = useState("");
  const [manualCals, setManualCals] = useState("");
  const [manualProtein, setManualProtein] = useState("");
  const [manualCarbs, setManualCarbs] = useState("");
  const [manualFat, setManualFat] = useState("");

  const todayTotals = getDailyTotals(today);
  const todayMeals = meals.filter((m) => m.date === today);

  async function handleCameraCapture() {
    haptics.lightTap();
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Camera access is required to scan food.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      base64: true,
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0].base64) {
      const analysis = await analyzeFood(result.assets[0].base64);
      if (analysis) {
        haptics.success();
        await addMeal(today, analysis.foodName, analysis.items, analysis.confidence);
        reset();
      }
    }
  }

  async function handleManualAdd() {
    if (!manualName.trim()) return;
    haptics.success();
    const item: MealItem = {
      name: manualName.trim(),
      portionSize: "1 serving",
      calories: Number(manualCals) || 0,
      protein: Number(manualProtein) || 0,
      carbs: Number(manualCarbs) || 0,
      fat: Number(manualFat) || 0,
    };
    await addMeal(today, manualName.trim(), [item]);
    setManualName("");
    setManualCals("");
    setManualProtein("");
    setManualCarbs("");
    setManualFat("");
    setShowManualAdd(false);
  }

  async function handleBarcodeLog(food: any) {
    haptics.success();
    const item: MealItem = {
      name: food.name,
      portionSize: food.servingSize,
      calories: Math.round(food.calories * food.servings),
      protein: Math.round(food.protein * food.servings),
      carbs: Math.round(food.carbs * food.servings),
      fat: Math.round(food.fat * food.servings),
    };
    await addMeal(today, food.name, [item]);
    await addFavourite({
      name: food.name,
      calories: item.calories,
      protein: item.protein,
      carbs: item.carbs,
      fat: item.fat,
      servingSize: food.servingSize,
      source: "barcode",
    });
    setShowBarcode(false);
  }

  async function handleVoiceResult(text: string) {
    const parsed = parseFoodText(text);
    if (parsed.length === 0) {
      Alert.alert("Could not parse", "Try describing your food differently.");
      return;
    }
    haptics.success();
    const items: MealItem[] = parsed.map((p) => ({
      name: p.name,
      portionSize: "1 serving",
      calories: p.calories,
      protein: p.protein,
      carbs: p.carbs,
      fat: p.fat,
    }));
    const name = parsed.map((p) => p.name).join(", ");
    await addMeal(today, name, items);
    setShowVoice(false);
  }

  async function handleQuickRelog(fav: any) {
    haptics.success();
    const item: MealItem = {
      name: fav.name,
      portionSize: fav.servingSize,
      calories: fav.calories,
      protein: fav.protein,
      carbs: fav.carbs,
      fat: fav.fat,
    };
    await addMeal(today, fav.name, [item]);
    await addFavourite({
      name: fav.name,
      calories: fav.calories,
      protein: fav.protein,
      carbs: fav.carbs,
      fat: fav.fat,
      servingSize: fav.servingSize,
    });
  }

  // Macro bar
  const totalMacroGrams =
    todayTotals.protein + todayTotals.carbs + todayTotals.fat;
  const proteinPct =
    totalMacroGrams > 0
      ? Math.round((todayTotals.protein / totalMacroGrams) * 100)
      : 0;
  const carbsPct =
    totalMacroGrams > 0
      ? Math.round((todayTotals.carbs / totalMacroGrams) * 100)
      : 0;
  const fatPct = totalMacroGrams > 0 ? 100 - proteinPct - carbsPct : 0;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="mb-4 mt-2 flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-bold text-white">Nutrition</Text>
            <Text className="text-sm text-gray-400">
              Track your daily intake
            </Text>
          </View>
          <Flame size={24} color="#f59e0b" />
        </View>

        {/* Daily Summary */}
        <Card className="mb-4">
          <View className="flex-row justify-around">
            <View className="items-center">
              <Text className="text-2xl font-bold text-warning">
                {todayTotals.calories}
              </Text>
              <Text className="text-xs text-gray-400">Calories</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-brand">
                {todayTotals.protein}g
              </Text>
              <Text className="text-xs text-gray-400">Protein</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-teal">
                {todayTotals.carbs}g
              </Text>
              <Text className="text-xs text-gray-400">Carbs</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-running">
                {todayTotals.fat}g
              </Text>
              <Text className="text-xs text-gray-400">Fat</Text>
            </View>
          </View>

          {/* Macro bar */}
          {totalMacroGrams > 0 && (
            <View className="mt-3 h-3 flex-row overflow-hidden rounded-full">
              <View
                className="h-full bg-brand"
                style={{ width: `${proteinPct}%` }}
              />
              <View
                className="h-full bg-teal"
                style={{ width: `${carbsPct}%` }}
              />
              <View
                className="h-full bg-running"
                style={{ width: `${fatPct}%` }}
              />
            </View>
          )}
        </Card>

        {/* Quick Actions */}
        <View className="mb-3 flex-row gap-2">
          <TouchableOpacity
            className="flex-1 flex-row items-center justify-center gap-1.5 rounded-xl bg-brand py-3"
            onPress={handleCameraCapture}
            disabled={analyzing}
          >
            <Camera size={14} color="#fff" />
            <Text className="text-xs font-semibold text-white">
              {analyzing ? "..." : "Photo"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 flex-row items-center justify-center gap-1.5 rounded-xl bg-[#1A1A24] py-3"
            onPress={() => {
              setShowBarcode(!showBarcode);
              setShowManualAdd(false);
              setShowVoice(false);
            }}
          >
            <ScanLine size={14} color="#8b5cf6" />
            <Text className="text-xs font-semibold text-brand">Barcode</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 flex-row items-center justify-center gap-1.5 rounded-xl bg-[#1A1A24] py-3"
            onPress={() => {
              setShowVoice(!showVoice);
              setShowManualAdd(false);
              setShowBarcode(false);
            }}
          >
            <Mic size={14} color="#2dd4bf" />
            <Text className="text-xs font-semibold text-teal">Voice</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 flex-row items-center justify-center gap-1.5 rounded-xl bg-[#1A1A24] py-3"
            onPress={() => {
              setShowManualAdd(!showManualAdd);
              setShowBarcode(false);
              setShowVoice(false);
            }}
          >
            <Plus size={14} color="#f59e0b" />
            <Text className="text-xs font-semibold text-warning">Manual</Text>
          </TouchableOpacity>
        </View>

        {/* Barcode Scanner */}
        {showBarcode && (
          <Card className="mb-4">
            <BarcodeScanner
              onLog={handleBarcodeLog}
              onClose={() => setShowBarcode(false)}
            />
          </Card>
        )}

        {/* Voice Logger */}
        {showVoice && (
          <Card className="mb-4">
            <VoiceLogger
              onResult={handleVoiceResult}
              onClose={() => setShowVoice(false)}
            />
          </Card>
        )}

        {/* Manual Add Form */}
        {showManualAdd && (
          <Card className="mb-4">
            <TextInput
              className="mb-2 h-10 rounded-lg bg-background px-3 text-white"
              placeholder="Food name"
              placeholderTextColor="#6B7280"
              value={manualName}
              onChangeText={setManualName}
            />
            <View className="mb-2 flex-row gap-2">
              <TextInput
                className="flex-1 h-10 rounded-lg bg-background px-3 text-center text-white"
                placeholder="Cal"
                placeholderTextColor="#6B7280"
                keyboardType="numeric"
                value={manualCals}
                onChangeText={setManualCals}
              />
              <TextInput
                className="flex-1 h-10 rounded-lg bg-background px-3 text-center text-white"
                placeholder="Pro"
                placeholderTextColor="#6B7280"
                keyboardType="numeric"
                value={manualProtein}
                onChangeText={setManualProtein}
              />
              <TextInput
                className="flex-1 h-10 rounded-lg bg-background px-3 text-center text-white"
                placeholder="Carb"
                placeholderTextColor="#6B7280"
                keyboardType="numeric"
                value={manualCarbs}
                onChangeText={setManualCarbs}
              />
              <TextInput
                className="flex-1 h-10 rounded-lg bg-background px-3 text-center text-white"
                placeholder="Fat"
                placeholderTextColor="#6B7280"
                keyboardType="numeric"
                value={manualFat}
                onChangeText={setManualFat}
              />
            </View>
            <Button title="Add" onPress={handleManualAdd} />
          </Card>
        )}

        {/* Quick Relog */}
        <View className="mb-4">
          <QuickRelog onSelect={handleQuickRelog} />
        </View>

        {/* Health Score */}
        <View className="mb-4">
          <HealthScoreCard />
        </View>

        {/* Water Tracking */}
        <View className="mb-4">
          <WaterTracker />
        </View>

        {/* Today's Meals */}
        <SectionHeader title="Today's Meals" />
        {todayMeals.length === 0 ? (
          <Card className="mb-4">
            <Text className="text-center text-sm text-gray-400">
              No meals logged yet today
            </Text>
          </Card>
        ) : (
          todayMeals.map((meal) => (
            <Card key={meal.id} className="mb-3">
              <View className="flex-row items-start justify-between">
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-white">
                    {meal.foodName}
                  </Text>
                  <View className="mt-1 flex-row gap-3">
                    <Text className="text-xs text-warning">
                      {meal.totalCalories} cal
                    </Text>
                    <Text className="text-xs text-brand">
                      {meal.totalProtein}g P
                    </Text>
                    <Text className="text-xs text-teal">
                      {meal.totalCarbs}g C
                    </Text>
                    <Text className="text-xs text-running">
                      {meal.totalFat}g F
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    haptics.lightTap();
                    deleteMeal(meal.id);
                  }}
                >
                  <Trash2 size={14} color="#6B7280" />
                </TouchableOpacity>
              </View>
            </Card>
          ))
        )}

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
