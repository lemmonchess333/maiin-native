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
import { publishSocialPost } from "@/lib/social-publish";
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
    async (name: string, exercises: WorkoutExercise[], durationMinutes: number, notes?: string) => {
      if (!user) return;
      const docRef = await addDoc(collection(db, COL), {
        userId: user.uid,
        name,
        exercises,
        durationMinutes,
        ...(notes ? { notes } : {}),
        createdAt: Timestamp.now(),
      });
      // Increment profile stats
      await updateProfileStats(user.uid, {
        totalWorkouts: increment(1),
      });
      // Publish to social feed
      const totalSets = exercises.reduce((s, ex) => s + ex.sets.length, 0);
      const detail = `${name} — ${exercises.length} exercises, ${totalSets} sets, ${durationMinutes} min`;
      const displayName = user.displayName || "Athlete";
      publishSocialPost(user.uid, displayName, "workout", detail, docRef.id).catch(() => {});
    },
    [user],
  );

  const deleteWorkout = useCallback(async (workoutId: string) => {
    await deleteDoc(doc(db, COL, workoutId));
  }, []);

  return { workouts, loading, saveWorkout, deleteWorkout };
}
