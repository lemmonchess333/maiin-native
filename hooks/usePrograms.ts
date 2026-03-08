import { useState, useEffect } from "react";
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  getDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import type { ProgramExercise, WorkoutDay } from "@/lib/programTypes";

export interface Program {
  id: string;
  name: string;
  days: WorkoutDay[];
  createdAt: Date;
}

export function usePrograms() {
  const { user } = useAuth();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setPrograms([]);
      setLoading(false);
      return;
    }
    const ref = collection(db, "users", user.uid, "programs");
    const unsub = onSnapshot(ref, (snap) => {
      const list: Program[] = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          name: data.name ?? "Program",
          days: data.days ?? [],
          createdAt: data.createdAt?.toDate?.() ?? new Date(),
        };
      });
      setPrograms(list);
      setLoading(false);
    });
    return unsub;
  }, [user]);

  const saveCustomDay = async (
    programId: string,
    dayIndex: number,
    exercises: ProgramExercise[],
  ) => {
    if (!user) return;
    const dayRef = doc(
      db,
      "users",
      user.uid,
      "programs",
      programId,
      "days",
      String(dayIndex),
    );
    await setDoc(dayRef, {
      exercises,
      isCustom: true,
      updatedAt: Timestamp.now(),
    });
  };

  const getCustomDay = async (
    programId: string,
    dayIndex: number,
  ): Promise<ProgramExercise[] | null> => {
    if (!user) return null;
    const dayRef = doc(
      db,
      "users",
      user.uid,
      "programs",
      programId,
      "days",
      String(dayIndex),
    );
    const snap = await getDoc(dayRef);
    if (!snap.exists()) return null;
    return snap.data().exercises ?? null;
  };

  return { programs, loading, saveCustomDay, getCustomDay };
}
