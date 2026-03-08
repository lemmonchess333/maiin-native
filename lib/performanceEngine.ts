/**
 * Performance Index Engine — client-side computation of 0-100 composite score.
 * Pure TypeScript, no dependencies.
 */

export interface WeeklyAggregates {
  weekKey: string;
  liftTonnage: number;
  liftHardSets: number;
  liftSessions: number;
  runKm: number;
  runLongKm: number;
  runQualityCount: number;
  runSessions: number;
}

export interface Baseline {
  liftTonnage: number;
  liftHardSets: number;
  runKm: number;
  runLongKm: number;
  weeksUsed: number;
}

export interface PerformanceResult {
  performanceIndex: number;
  liftLoadScore: number;
  runLoadScore: number;
  recoveryScore: number;
  adherenceScore: number;
  confidence: "high" | "medium" | "low";
  loadBand: "deload" | "low" | "moderate" | "high" | "overreach";
  insight: string;
}

export const PI_WEIGHTS = {
  load: 0.65,
  recovery: 0.25,
  adherence: 0.1,
  liftInLoad: 0.5,
  runInLoad: 0.5,
} as const;

export function computeBaseline(
  weeks: WeeklyAggregates[],
): Baseline {
  if (weeks.length === 0) {
    return { liftTonnage: 0, liftHardSets: 0, runKm: 0, runLongKm: 0, weeksUsed: 0 };
  }
  const n = weeks.length;
  return {
    liftTonnage: weeks.reduce((s, w) => s + w.liftTonnage, 0) / n,
    liftHardSets: weeks.reduce((s, w) => s + w.liftHardSets, 0) / n,
    runKm: weeks.reduce((s, w) => s + w.runKm, 0) / n,
    runLongKm: weeks.reduce((s, w) => s + w.runLongKm, 0) / n,
    weeksUsed: n,
  };
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

export function computeLiftLoadScore(
  current: WeeklyAggregates,
  baseline: Baseline,
): number {
  if (baseline.liftTonnage === 0) return 50;
  const ratio = current.liftTonnage / baseline.liftTonnage;
  return clamp(ratio * 50, 0, 100);
}

export function computeRunLoadScore(
  current: WeeklyAggregates,
  baseline: Baseline,
): number {
  if (baseline.runKm === 0) return 50;
  const ratio = current.runKm / baseline.runKm;
  return clamp(ratio * 50, 0, 100);
}

export function computeRecoveryScore(
  current: WeeklyAggregates,
  previous: WeeklyAggregates | null,
): number {
  if (!previous) return 70;
  const totalCurrent = current.liftSessions + current.runSessions;
  const totalPrev = previous.liftSessions + previous.runSessions;
  const restDays = Math.max(7 - totalCurrent, 0);
  const jump = totalPrev > 0 ? totalCurrent / totalPrev : 1;
  let score = 70;
  score += restDays * 5;
  if (jump > 1.3) score -= (jump - 1.3) * 50;
  return clamp(score, 0, 100);
}

export function computeAdherenceScore(
  current: WeeklyAggregates,
): number {
  const totalSessions = current.liftSessions + current.runSessions;
  if (totalSessions >= 5) return 100;
  if (totalSessions >= 4) return 85;
  if (totalSessions >= 3) return 70;
  if (totalSessions >= 2) return 50;
  if (totalSessions >= 1) return 30;
  return 0;
}

export function computeConfidence(
  baseline: Baseline,
): "high" | "medium" | "low" {
  if (baseline.weeksUsed >= 6) return "high";
  if (baseline.weeksUsed >= 3) return "medium";
  return "low";
}

export function computeLoadBand(
  pi: number,
): "deload" | "low" | "moderate" | "high" | "overreach" {
  if (pi < 20) return "deload";
  if (pi < 40) return "low";
  if (pi < 65) return "moderate";
  if (pi < 85) return "high";
  return "overreach";
}

export function computePerformanceIndex(
  current: WeeklyAggregates,
  previous: WeeklyAggregates | null,
  baseline: Baseline,
): PerformanceResult {
  const liftLoad = computeLiftLoadScore(current, baseline);
  const runLoad = computeRunLoadScore(current, baseline);
  const loadScore =
    liftLoad * PI_WEIGHTS.liftInLoad + runLoad * PI_WEIGHTS.runInLoad;
  const recovery = computeRecoveryScore(current, previous);
  const adherence = computeAdherenceScore(current);
  const pi = clamp(
    Math.round(
      loadScore * PI_WEIGHTS.load +
        recovery * PI_WEIGHTS.recovery +
        adherence * PI_WEIGHTS.adherence,
    ),
    0,
    100,
  );
  const confidence = computeConfidence(baseline);
  const loadBand = computeLoadBand(pi);

  let insight = "";
  if (pi >= 80) insight = "Strong week \u2014 great balance of load and recovery";
  else if (pi >= 60) insight = "Solid training week \u2014 keep building";
  else if (pi >= 40) insight = "Moderate effort \u2014 room to push harder";
  else if (pi >= 20) insight = "Light week \u2014 consider increasing volume";
  else insight = "Recovery week \u2014 good time to deload";

  return {
    performanceIndex: pi,
    liftLoadScore: Math.round(liftLoad),
    runLoadScore: Math.round(runLoad),
    recoveryScore: Math.round(recovery),
    adherenceScore: Math.round(adherence),
    confidence,
    loadBand,
    insight,
  };
}
