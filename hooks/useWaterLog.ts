import { useState, useEffect, useCallback } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";

export function useWaterLog() {
  const { user } = useAuth();
  const [glasses, setGlasses] = useState(0);
  const [target, setTarget] = useState(8);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (!user) {
      setGlasses(0);
      setLoading(false);
      return;
    }
    const ref = doc(db, "users", user.uid, "waterLog", today);
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setGlasses(data.glasses ?? 0);
        if (data.target) setTarget(data.target);
      } else {
        setGlasses(0);
      }
      setLoading(false);
    });
    return unsub;
  }, [user, today]);

  const logWater = useCallback(
    async (amount: number = 1) => {
      if (!user) return;
      const newGlasses = glasses + amount;
      await setDoc(
        doc(db, "users", user.uid, "waterLog", today),
        { glasses: newGlasses, target, date: today },
        { merge: true },
      );
    },
    [user, glasses, target, today],
  );

  const setWaterAmount = useCallback(
    async (amount: number) => {
      if (!user) return;
      await setDoc(
        doc(db, "users", user.uid, "waterLog", today),
        { glasses: amount, target, date: today },
        { merge: true },
      );
    },
    [user, target, today],
  );

  const progress = target > 0 ? Math.min(glasses / target, 1) : 0;

  return { glasses, target, loading, logWater, setWaterAmount, progress };
}
