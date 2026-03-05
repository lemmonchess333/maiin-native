import { useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth-context";
import { refreshStreak } from "@/lib/profile-stats";
import type { Workout, Run } from "@/lib/types";

/**
 * Watches workouts + runs and recalculates streak whenever data changes.
 * Should be called once in the Home screen (or a shared provider).
 */
export function useStreakSync(workouts: Workout[], runs: Run[]) {
  const { user } = useAuth();
  const prevCount = useRef(0);

  useEffect(() => {
    if (!user) return;

    const totalCount = workouts.length + runs.length;
    // Only recalculate when the count changes (new activity added/removed)
    if (totalCount === prevCount.current) return;
    prevCount.current = totalCount;

    const allDates: Date[] = [
      ...workouts.map((w) => w.createdAt.toDate()),
      ...runs.map((r) => r.createdAt.toDate()),
    ];

    refreshStreak(user.uid, allDates);
  }, [user, workouts, runs]);
}
