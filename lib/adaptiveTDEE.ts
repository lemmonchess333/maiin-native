/**
 * Adaptive TDEE calculator — adjusts calorie target based on weight trend.
 * Pure math, no dependencies.
 */

export interface TDEECalculation {
  estimatedTDEE: number;
  adjustedTarget: number;
  weeklyWeightChange: number;
  confidence: "high" | "medium" | "low";
}

export function calculateAdaptiveTDEE(
  weightLogs: { date: string; weight: number }[],
  calorieLogs: { date: string; calories: number }[],
  goal: "cut" | "lean bulk" | "recomp",
  currentTarget: number,
  weightKg: number,
): TDEECalculation {
  if (weightLogs.length < 7 || calorieLogs.length < 7) {
    return {
      estimatedTDEE: currentTarget,
      adjustedTarget: currentTarget,
      weeklyWeightChange: 0,
      confidence: "low",
    };
  }

  // Average daily calories over last 14 days
  const recentCals = calorieLogs.slice(-14);
  const avgCalories =
    recentCals.reduce((s, c) => s + c.calories, 0) / recentCals.length;

  // Weight trend over 2 weeks
  const sorted = [...weightLogs].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );
  const recent = sorted.slice(-14);
  if (recent.length < 7) {
    return {
      estimatedTDEE: currentTarget,
      adjustedTarget: currentTarget,
      weeklyWeightChange: 0,
      confidence: "low",
    };
  }

  const firstHalf = recent.slice(0, Math.floor(recent.length / 2));
  const secondHalf = recent.slice(Math.floor(recent.length / 2));
  const avgFirst =
    firstHalf.reduce((s, w) => s + w.weight, 0) / firstHalf.length;
  const avgSecond =
    secondHalf.reduce((s, w) => s + w.weight, 0) / secondHalf.length;
  const weeklyChange = (avgSecond - avgFirst) * (7 / (recent.length / 2));

  // 1kg body weight change ≈ 7700 kcal
  const dailySurplus = (weeklyChange * 7700) / 7;
  const estimatedTDEE = Math.round(avgCalories - dailySurplus);

  let adjustedTarget = estimatedTDEE;
  if (goal === "cut") {
    adjustedTarget = estimatedTDEE - 500;
  } else if (goal === "lean bulk") {
    adjustedTarget = estimatedTDEE + 300;
  }
  // recomp = maintenance

  const confidence =
    weightLogs.length >= 28 && calorieLogs.length >= 28
      ? "high"
      : weightLogs.length >= 14
        ? "medium"
        : "low";

  return {
    estimatedTDEE,
    adjustedTarget: Math.round(adjustedTarget),
    weeklyWeightChange: Math.round(weeklyChange * 100) / 100,
    confidence,
  };
}
