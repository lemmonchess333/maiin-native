import type { UserProfile } from "./types";
import type { PersonalRecord } from "@/hooks/usePersonalRecords";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: "trophy" | "flame" | "dumbbell" | "route" | "zap" | "crown";
  color: string;
  unlocked: boolean;
}

export function computeAchievements(
  profile: UserProfile | null,
  records: PersonalRecord[],
): Achievement[] {
  const w = profile?.totalWorkouts ?? 0;
  const r = profile?.totalRuns ?? 0;
  const miles = profile?.totalMiles ?? 0;
  const streak = profile?.longestStreak ?? 0;

  return [
    {
      id: "first_workout",
      title: "First Rep",
      description: "Complete your first workout",
      icon: "dumbbell",
      color: "#8b5cf6",
      unlocked: w >= 1,
    },
    {
      id: "ten_workouts",
      title: "Dedicated",
      description: "Complete 10 workouts",
      icon: "flame",
      color: "#FF6B6B",
      unlocked: w >= 10,
    },
    {
      id: "century_club",
      title: "Century Club",
      description: "Complete 100 workouts",
      icon: "crown",
      color: "#f59e0b",
      unlocked: w >= 100,
    },
    {
      id: "first_run",
      title: "Lace Up",
      description: "Complete your first run",
      icon: "route",
      color: "#FF6B6B",
      unlocked: r >= 1,
    },
    {
      id: "ten_miles",
      title: "10 Miler",
      description: "Run a total of 10 miles",
      icon: "route",
      color: "#2dd4bf",
      unlocked: miles >= 10,
    },
    {
      id: "fifty_miles",
      title: "Ultra Runner",
      description: "Run a total of 50 miles",
      icon: "zap",
      color: "#34d399",
      unlocked: miles >= 50,
    },
    {
      id: "week_streak",
      title: "7-Day Streak",
      description: "Train 7 days in a row",
      icon: "flame",
      color: "#f59e0b",
      unlocked: streak >= 7,
    },
    {
      id: "first_pr",
      title: "Record Breaker",
      description: "Set your first personal record",
      icon: "trophy",
      color: "#8b5cf6",
      unlocked: records.length >= 1,
    },
    {
      id: "five_prs",
      title: "PR Machine",
      description: "Set 5 personal records",
      icon: "trophy",
      color: "#f59e0b",
      unlocked: records.length >= 5,
    },
    {
      id: "hybrid",
      title: "Hybrid Athlete",
      description: "Log 10+ workouts and 10+ runs",
      icon: "zap",
      color: "#2dd4bf",
      unlocked: w >= 10 && r >= 10,
    },
  ];
}
