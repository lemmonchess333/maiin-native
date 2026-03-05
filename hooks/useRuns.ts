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
import type { Run, GpsPoint } from "@/lib/types";

const COL = "runs";

export function useRuns(maxResults = 20) {
  const { user } = useAuth();
  const [runs, setRuns] = useState<Run[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setRuns([]);
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
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Run);
      setRuns(items);
      setLoading(false);
    });

    return unsub;
  }, [user, maxResults]);

  const saveRun = useCallback(
    async (
      distanceMiles: number,
      durationSeconds: number,
      calories: number,
      route: GpsPoint[] = [],
    ) => {
      if (!user) return;

      const paceTotal = distanceMiles > 0 ? durationSeconds / distanceMiles : 0;
      const paceMin = Math.floor(paceTotal / 60);
      const paceSec = Math.floor(paceTotal % 60);
      const pacePerMile = `${paceMin}:${String(paceSec).padStart(2, "0")}`;

      const docRef = await addDoc(collection(db, COL), {
        userId: user.uid,
        distanceMiles,
        durationSeconds,
        pacePerMile,
        calories,
        route,
        createdAt: Timestamp.now(),
      });
      // Increment profile stats
      await updateProfileStats(user.uid, {
        totalRuns: increment(1),
        totalMiles: increment(distanceMiles),
      });
      // Publish to social feed
      const mins = Math.floor(durationSeconds / 60);
      const secs = durationSeconds % 60;
      const detail = `Run — ${distanceMiles.toFixed(2)} mi in ${mins}:${String(secs).padStart(2, "0")} (${pacePerMile}/mi)`;
      const displayName = user.displayName || "Athlete";
      publishSocialPost(user.uid, displayName, "run", detail, docRef.id).catch(() => {});
    },
    [user],
  );

  const deleteRun = useCallback(async (runId: string) => {
    await deleteDoc(doc(db, COL, runId));
  }, []);

  return { runs, loading, saveRun, deleteRun };
}
