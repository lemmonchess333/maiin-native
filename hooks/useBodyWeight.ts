import { useState, useEffect, useCallback } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  addDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";

export interface BodyWeightEntry {
  id: string;
  userId: string;
  weight: number;
  date: Timestamp;
}

const COL = "bodyWeight";

export function useBodyWeight(maxResults = 30) {
  const { user } = useAuth();
  const [entries, setEntries] = useState<BodyWeightEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setEntries([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, COL),
      where("userId", "==", user.uid),
      orderBy("date", "desc"),
      limit(maxResults),
    );

    const unsub = onSnapshot(q, (snap) => {
      const items = snap.docs.map(
        (d) => ({ id: d.id, ...d.data() }) as BodyWeightEntry,
      );
      setEntries(items);
      setLoading(false);
    });

    return unsub;
  }, [user, maxResults]);

  const logWeight = useCallback(
    async (weight: number) => {
      if (!user) return;
      await addDoc(collection(db, COL), {
        userId: user.uid,
        weight,
        date: Timestamp.now(),
      });
    },
    [user],
  );

  return { entries, loading, logWeight };
}
