import { useState, useEffect, useCallback } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  increment,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { updateProfileStats } from "@/lib/profile-stats";
import type { Workout, WorkoutExercise } from "@/lib/types";

const COL = "workouts";

export function useWorkouts(maxResults = 20) {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setWorkouts([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, COL),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc"),
      limit(maxResults),
    );

    const unsub = onSnapshot(q, (snap) => {
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Workout);
      setWorkouts(items);
      setLoading(false);
    });

    return unsub;
  }, [user, maxResults]);

  const saveWorkout = useCallback(
    async (name: string, exercises: WorkoutExercise[], durationMinutes: number) => {
      if (!user) return;
      await addDoc(collection(db, COL), {
        userId: user.uid,
        name,
        exercises,
        durationMinutes,
        createdAt: Timestamp.now(),
      });
      // Increment profile stats
      await updateProfileStats(user.uid, {
        totalWorkouts: increment(1),
      });
    },
    [user],
  );

  const deleteWorkout = useCallback(async (workoutId: string) => {
    await deleteDoc(doc(db, COL, workoutId));
  }, []);

  return { workouts, loading, saveWorkout, deleteWorkout };
}
