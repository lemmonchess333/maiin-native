import { useState, useEffect, useCallback } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";

export interface PersonalRecord {
  id: string;
  userId: string;
  exercise: string;
  weight: number;
  reps: number;
  date: Timestamp;
}

const COL = "personalRecords";

export function usePersonalRecords() {
  const { user } = useAuth();
  const [records, setRecords] = useState<PersonalRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setRecords([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, COL),
      where("userId", "==", user.uid),
    );

    const unsub = onSnapshot(q, (snap) => {
      const items = snap.docs.map(
        (d) => ({ id: d.id, ...d.data() }) as PersonalRecord,
      );
      setRecords(items);
      setLoading(false);
    });

    return unsub;
  }, [user]);

  const getPR = useCallback(
    (exercise: string): PersonalRecord | undefined => {
      return records.find(
        (r) => r.exercise.toLowerCase() === exercise.toLowerCase(),
      );
    },
    [records],
  );

  /** Check if weight beats current PR. If so, save and return true. */
  const checkAndSavePR = useCallback(
    async (
      exercise: string,
      weight: number,
      reps: number,
    ): Promise<boolean> => {
      if (!user || weight <= 0) return false;

      const current = records.find(
        (r) => r.exercise.toLowerCase() === exercise.toLowerCase(),
      );

      if (current && current.weight >= weight) return false;

      // New PR! Use exercise name as doc ID for upsert
      const docId = `${user.uid}_${exercise.toLowerCase().replace(/\s+/g, "_")}`;
      await setDoc(doc(db, COL, docId), {
        userId: user.uid,
        exercise,
        weight,
        reps,
        date: Timestamp.now(),
      });

      return true;
    },
    [user, records],
  );

  return { records, loading, getPR, checkAndSavePR };
}
