/**
 * Badge definitions for the achievement system.
 * 24 badges across 5 categories.
 */

export interface Badge {
  id: string;
  name: string;
  description: string;
  category: "consistency" | "lifting" | "running" | "nutrition" | "hybrid";
  icon: string;
  color: string;
}

export const BADGES: Badge[] = [
  // Consistency
  { id: "streak-3", name: "On a Roll", description: "3-day activity streak", category: "consistency", icon: "\u{1F525}", color: "#f59e0b" },
  { id: "streak-7", name: "Week Warrior", description: "7-day activity streak", category: "consistency", icon: "\u{1F4AA}", color: "#f59e0b" },
  { id: "streak-14", name: "Fortnight Force", description: "14-day activity streak", category: "consistency", icon: "\u26A1", color: "#f59e0b" },
  { id: "streak-30", name: "Monthly Machine", description: "30-day activity streak", category: "consistency", icon: "\u{1F3C6}", color: "#f59e0b" },
  { id: "streak-100", name: "Centurion", description: "100-day activity streak", category: "consistency", icon: "\u{1F451}", color: "#f59e0b" },

  // Lifting
  { id: "first-lift", name: "Iron Initiate", description: "Complete your first workout", category: "lifting", icon: "\u{1F3CB}", color: "#8b5cf6" },
  { id: "lifts-10", name: "Getting Strong", description: "Complete 10 workouts", category: "lifting", icon: "\u{1F4AA}", color: "#8b5cf6" },
  { id: "lifts-50", name: "Gym Regular", description: "Complete 50 workouts", category: "lifting", icon: "\u{1F3CB}", color: "#8b5cf6" },
  { id: "lifts-100", name: "Iron Veteran", description: "Complete 100 workouts", category: "lifting", icon: "\u{1F947}", color: "#8b5cf6" },
  { id: "volume-100k", name: "Volume Monster", description: "Lift 100,000 total kg", category: "lifting", icon: "\u{1F4A5}", color: "#8b5cf6" },

  // Running
  { id: "first-run", name: "First Steps", description: "Complete your first run", category: "running", icon: "\u{1F3C3}", color: "#FF6B6B" },
  { id: "runs-10", name: "Road Regular", description: "Complete 10 runs", category: "running", icon: "\u{1F45F}", color: "#FF6B6B" },
  { id: "runs-50", name: "Pavement Pounder", description: "Complete 50 runs", category: "running", icon: "\u{1F3C3}", color: "#FF6B6B" },
  { id: "distance-50", name: "50 Miler", description: "Run 50 total miles", category: "running", icon: "\u{1F6E3}", color: "#FF6B6B" },
  { id: "distance-100", name: "Century Runner", description: "Run 100 total miles", category: "running", icon: "\u{1F3C5}", color: "#FF6B6B" },

  // Nutrition
  { id: "first-meal", name: "Fuel Up", description: "Log your first meal", category: "nutrition", icon: "\u{1F34E}", color: "#22c55e" },
  { id: "meals-7", name: "Week of Tracking", description: "Log meals for 7 consecutive days", category: "nutrition", icon: "\u{1F4CA}", color: "#22c55e" },
  { id: "water-streak-7", name: "Hydration Hero", description: "Hit water goal 7 days in a row", category: "nutrition", icon: "\u{1F4A7}", color: "#22c55e" },
  { id: "macros-hit-5", name: "Macro Master", description: "Hit macro targets 5 days in a row", category: "nutrition", icon: "\u{1F3AF}", color: "#22c55e" },

  // Hybrid
  { id: "hybrid-first", name: "Hybrid Athlete", description: "Log a lift and run in the same week", category: "hybrid", icon: "\u{1F504}", color: "#2dd4bf" },
  { id: "hybrid-week", name: "Balanced Week", description: "3+ lifts and 3+ runs in one week", category: "hybrid", icon: "\u2696\uFE0F", color: "#2dd4bf" },
  { id: "hybrid-month", name: "Dual Threat", description: "Log both lifts and runs for 30 days", category: "hybrid", icon: "\u{1F48E}", color: "#2dd4bf" },
  { id: "all-rounder", name: "All-Rounder", description: "Log a lift, run, and meal in one day", category: "hybrid", icon: "\u{1F31F}", color: "#2dd4bf" },
  { id: "pi-80", name: "Peak Performance", description: "Achieve a Performance Index of 80+", category: "hybrid", icon: "\u{1F680}", color: "#2dd4bf" },
];

export function getBadge(id: string): Badge | undefined {
  return BADGES.find((b) => b.id === id);
}

export function getBadgesByCategory(
  category: Badge["category"],
): Badge[] {
  return BADGES.filter((b) => b.category === category);
}
