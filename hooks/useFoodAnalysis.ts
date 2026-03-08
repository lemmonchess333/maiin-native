import { useState, useCallback } from "react";
import type { MealItem } from "@/hooks/useMeals";

interface FoodAnalysisResult {
  foodName: string;
  items: MealItem[];
  confidence: string;
}

const CLOUD_FUNCTION_URL =
  "https://us-central1-YOUR_PROJECT.cloudfunctions.net/analyzeFood";

export function useFoodAnalysis() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<FoodAnalysisResult | null>(null);

  const analyzeFood = useCallback(async (imageBase64: string) => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(CLOUD_FUNCTION_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageBase64 }),
      });
      if (!res.ok) throw new Error("Analysis failed");
      const data = await res.json();
      const analysisResult: FoodAnalysisResult = {
        foodName: data.foodName ?? "Unknown food",
        items: (data.items ?? []).map((item: any) => ({
          name: item.name ?? "",
          portionSize: item.portionSize ?? "",
          calories: item.calories ?? 0,
          protein: item.protein ?? 0,
          carbs: item.carbs ?? 0,
          fat: item.fat ?? 0,
          fiber: item.fiber,
          sugar: item.sugar,
          sodium: item.sodium,
        })),
        confidence: data.confidence ?? "medium",
      };
      setResult(analysisResult);
      return analysisResult;
    } catch (err: any) {
      setError(err.message ?? "Failed to analyze food");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return { analyzeFood, loading, error, result, reset };
}
