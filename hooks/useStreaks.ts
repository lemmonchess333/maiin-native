import { useState, useEffect, useCallback } from "react";
import {
  doc,
  onSnapshot,
  updateDoc,
  arrayUnion,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { BADGES, type Badge } from "@/lib/badges";

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  totalActiveDays: number;
  lastActiveDate: string | null;
  earnedBadgeIds: string[];
}

export function useStreaks() {
  const { user } = useAuth();
  const [streakData, setStreakData] = useState<StreakData>({
    currentStreak: 0,
    longestStreak: 0,
    totalActiveDays: 0,
    lastActiveDate: null,
    earnedBadgeIds: [],
  });
  const [loading, setLoading] = useState(true);
  const [newBadge, setNewBadge] = useState<Badge | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    const ref = doc(db, "userProfiles", user.uid);
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setStreakData({
          currentStreak: data.currentStreak ?? 0,
          longestStreak: data.longestStreak ?? 0,
          totalActiveDays: data.totalActiveDays ?? 0,
          lastActiveDate: data.lastActiveDate ?? null,
          earnedBadgeIds: data.earnedBadgeIds ?? [],
        });
      }
      setLoading(false);
    });
    return unsub;
  }, [user]);

  const recordActivity = useCallback(async () => {
    if (!user) return;
    const today = new Date().toISOString().split("T")[0];
    if (streakData.lastActiveDate === today) return;

    const ref = doc(db, "userProfiles", user.uid);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    const isConsecutive = streakData.lastActiveDate === yesterdayStr;
    const newStreak = isConsecutive ? streakData.currentStreak + 1 : 1;
    const newLongest = Math.max(newStreak, streakData.longestStreak);

    await updateDoc(ref, {
      currentStreak: newStreak,
      longestStreak: newLongest,
      totalActiveDays: (streakData.totalActiveDays || 0) + 1,
      lastActiveDate: today,
    });
  }, [user, streakData]);

  const awardBadge = useCallback(
    async (badgeId: string) => {
      if (!user) return;
      if (streakData.earnedBadgeIds.includes(badgeId)) return;
      const ref = doc(db, "userProfiles", user.uid);
      await updateDoc(ref, {
        earnedBadgeIds: arrayUnion(badgeId),
      });
      const badge = BADGES.find((b) => b.id === badgeId);
      if (badge) setNewBadge(badge);
    },
    [user, streakData.earnedBadgeIds],
  );

  const checkStreakBadges = useCallback(async () => {
    const streak = streakData.currentStreak;
    if (streak >= 3) await awardBadge("streak-3");
    if (streak >= 7) await awardBadge("streak-7");
    if (streak >= 14) await awardBadge("streak-14");
    if (streak >= 30) await awardBadge("streak-30");
    if (streak >= 100) await awardBadge("streak-100");
  }, [streakData.currentStreak, awardBadge]);

  const dismissNewBadge = useCallback(() => setNewBadge(null), []);

  const earnedBadges = BADGES.filter((b) =>
    streakData.earnedBadgeIds.includes(b.id),
  );
  const lockedBadges = BADGES.filter(
    (b) => !streakData.earnedBadgeIds.includes(b.id),
  );

  return {
    streakData,
    loading,
    recordActivity,
    awardBadge,
    checkStreakBadges,
    newBadge,
    dismissNewBadge,
    earnedBadges,
    lockedBadges,
  };
}
