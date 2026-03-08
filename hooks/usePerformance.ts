import { useState, useEffect } from "react";
import { collection, onSnapshot, orderBy, query, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";

export interface PerformanceWeek {
  weekKey: string;
  performanceIndex: number;
  liftLoadScore: number;
  runLoadScore: number;
  recoveryScore: number;
  adherenceScore: number;
  loadBand: string;
  insight: string;
}

export function usePerformanceWeeks(maxWeeks: number = 12) {
  const { user } = useAuth();
  const [weeks, setWeeks] = useState<PerformanceWeek[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setWeeks([]);
      setLoading(false);
      return;
    }
    const ref = collection(db, "users", user.uid, "performance");
    const q = query(ref, orderBy("weekKey", "desc"), limit(maxWeeks));
    const unsub = onSnapshot(q, (snap) => {
      const list: PerformanceWeek[] = snap.docs.map((d) => {
        const data = d.data();
        return {
          weekKey: data.weekKey ?? d.id,
          performanceIndex: data.performanceIndex ?? 0,
          liftLoadScore: data.liftLoadScore ?? 0,
          runLoadScore: data.runLoadScore ?? 0,
          recoveryScore: data.recoveryScore ?? 0,
          adherenceScore: data.adherenceScore ?? 0,
          loadBand: data.loadBand ?? "moderate",
          insight: data.insight?.title ?? "",
        };
      });
      setWeeks(list.reverse());
      setLoading(false);
    });
    return unsub;
  }, [user, maxWeeks]);

  const currentWeek = weeks.length > 0 ? weeks[weeks.length - 1] : null;

  return { weeks, currentWeek, loading };
}
