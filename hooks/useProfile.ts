import { useState, useEffect, useCallback } from "react";
import {
  doc,
  onSnapshot,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import type { UserProfile } from "@/lib/types";

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const unsub = onSnapshot(doc(db, "userProfiles", user.uid), (snap) => {
      if (snap.exists()) {
        setProfile(snap.data() as UserProfile);
      } else {
        // Auto-create profile on first login
        const initial: UserProfile = {
          userId: user.uid,
          displayName: user.displayName ?? "",
          totalWorkouts: 0,
          totalRuns: 0,
          totalMiles: 0,
          currentStreak: 0,
          longestStreak: 0,
          createdAt: Timestamp.now(),
        };
        setDoc(doc(db, "userProfiles", user.uid), initial);
        setProfile(initial);
      }
      setLoading(false);
    });

    return unsub;
  }, [user]);

  const updateProfile = useCallback(
    async (updates: Partial<UserProfile>) => {
      if (!user) return;
      await setDoc(doc(db, "userProfiles", user.uid), updates, { merge: true });
    },
    [user],
  );

  return { profile, loading, updateProfile };
}
