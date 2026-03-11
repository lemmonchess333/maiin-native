/**
 * Calculate rollover calories based on weekly budget.
 * Unused calories from previous days carry forward (only positive, no debt).
 *
 * Rewritten without date-fns dependency — uses plain Date math.
 */

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function getMonday(d: Date): Date {
  const date = new Date(d);
  const dayOfWeek = date.getDay(); // 0=Sun, 1=Mon...6=Sat
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function addDays(d: Date, n: number): Date {
  const result = new Date(d);
  result.setDate(result.getDate() + n);
  return result;
}

export function calculateRollover(
  targetDailyCalories: number,
  dailyCalories: Record<string, number> // date string → consumed calories
): {
  adjustedTarget: number;
  rolloverAmount: number;
  weeklyBudget: number;
  weeklyConsumed: number;
  weeklyRemaining: number;
} {
  const today = new Date();
  const weekStart = getMonday(today);
  const todayStr = formatDate(today);

  const weeklyBudget = targetDailyCalories * 7;

  // Calculate consumed Mon-yesterday
  let weeklyConsumed = 0;
  let daysElapsed = 0;

  for (let i = 0; i < 7; i++) {
    const d = formatDate(addDays(weekStart, i));
    if (d === todayStr) break;
    daysElapsed++;
    weeklyConsumed += dailyCalories[d] || 0;
  }

  // Add today's consumption
  weeklyConsumed += dailyCalories[todayStr] || 0;

  // Expected consumption through yesterday
  const expectedThroughYesterday = targetDailyCalories * daysElapsed;

  // Rollover = expected - actual (positive only)
  const rolloverAmount = Math.max(0, expectedThroughYesterday - (weeklyConsumed - (dailyCalories[todayStr] || 0)));

  const adjustedTarget = targetDailyCalories + rolloverAmount;
  const weeklyRemaining = weeklyBudget - weeklyConsumed;

  return {
    adjustedTarget,
    rolloverAmount: Math.round(rolloverAmount),
    weeklyBudget,
    weeklyConsumed: Math.round(weeklyConsumed),
    weeklyRemaining: Math.round(weeklyRemaining),
  };
}
