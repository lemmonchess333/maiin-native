import { useState, useEffect, useCallback } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import type { ProgramState, WorkoutDay } from "@/lib/programTypes";
import { normalizeProgramState } from "@/lib/programTypes";
import { generateProgram } from "@/lib/programEngine";
import { advanceWeek, shouldAdvanceWeek } from "@/lib/programEngine";
import type { Goal } from "@/lib/programTypes";

export function useProgram() {
  const { user } = useAuth();
  const [state, setState] = useState<ProgramState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setState(null);
      setLoading(false);
      return;
    }
    const ref = doc(db, "users", user.uid, "program", "current");
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        setState(normalizeProgramState(snap.data() as ProgramState));
      } else {
        setState(null);
      }
      setLoading(false);
    });
    return unsub;
  }, [user]);

  const saveProgramState = useCallback(
    async (newState: ProgramState) => {
      if (!user) return;
      const ref = doc(db, "users", user.uid, "program", "current");
      await setDoc(ref, { ...newState, updatedAt: Date.now() });
    },
    [user],
  );

  const initializeProgram = useCallback(
    async (goal: Goal, weeklyLiftDays: number) => {
      const { splitType, workouts } = generateProgram(goal, weeklyLiftDays);
      const newState: ProgramState = {
        goal,
        currentPhase: "progression",
        weekNumber: 1,
        splitType,
        workouts,
        fatigueScore: 0,
        updatedAt: Date.now(),
        settings: { autoProgression: true, microloading: true },
        weekHistory: [],
      };
      await saveProgramState(newState);
      return newState;
    },
    [saveProgramState],
  );

  const markDayCompleted = useCallback(
    async (dayIndex: number) => {
      if (!state) return;
      const workouts = state.workouts.map((day, i) =>
        i === dayIndex ? { ...day, completed: true } : day,
      );
      const updated = { ...state, workouts, updatedAt: Date.now() };

      if (shouldAdvanceWeek(workouts) && state.settings?.autoProgression !== false) {
        const advanced = advanceWeek(updated);
        await saveProgramState(advanced);
      } else {
        await saveProgramState(updated);
      }
    },
    [state, saveProgramState],
  );

  const updateWorkouts = useCallback(
    async (workouts: WorkoutDay[]) => {
      if (!state) return;
      await saveProgramState({ ...state, workouts, updatedAt: Date.now() });
    },
    [state, saveProgramState],
  );

  return {
    state,
    loading,
    initializeProgram,
    saveProgramState,
    markDayCompleted,
    updateWorkouts,
  };
}
