import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

/**
 * Merge-update profile stats (supports Firestore FieldValue like increment).
 */
export async function updateProfileStats(
  userId: string,
  updates: Record<string, unknown>,
) {
  const ref = doc(db, "userProfiles", userId);
  await setDoc(ref, updates, { merge: true });
}

/**
 * Recalculate current and longest streak from activity timestamps.
 * Call after saving a workout or run.
 */
export async function refreshStreak(
  userId: string,
  activityDates: Date[],
) {
  if (activityDates.length === 0) {
    await updateProfileStats(userId, { currentStreak: 0 });
    return;
  }

  // Deduplicate to unique calendar days (local timezone)
  const daySet = new Set(
    activityDates.map((d) => {
      const y = d.getFullYear();
      const m = d.getMonth();
      const day = d.getDate();
      return `${y}-${m}-${day}`;
    }),
  );

  const sortedDays = Array.from(daySet)
    .map((s) => {
      const [y, m, d] = s.split("-").map(Number);
      return new Date(y, m, d);
    })
    .sort((a, b) => b.getTime() - a.getTime());

  // Calculate current streak (consecutive days ending today or yesterday)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  let currentStreak = 0;
  const firstDay = sortedDays[0];
  firstDay.setHours(0, 0, 0, 0);

  if (firstDay.getTime() >= yesterday.getTime()) {
    currentStreak = 1;
    for (let i = 1; i < sortedDays.length; i++) {
      const prev = sortedDays[i - 1];
      const curr = sortedDays[i];
      const diffDays = Math.round(
        (prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24),
      );
      if (diffDays === 1) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  // Calculate longest streak
  let longestStreak = 1;
  let streak = 1;
  for (let i = 1; i < sortedDays.length; i++) {
    const prev = sortedDays[i - 1];
    const curr = sortedDays[i];
    const diffDays = Math.round(
      (prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (diffDays === 1) {
      streak++;
      longestStreak = Math.max(longestStreak, streak);
    } else {
      streak = 1;
    }
  }

  // Read existing longestStreak to keep the max
  const ref = doc(db, "userProfiles", userId);
  const snap = await getDoc(ref);
  const existing = snap.exists() ? (snap.data().longestStreak as number) ?? 0 : 0;

  await updateProfileStats(userId, {
    currentStreak,
    longestStreak: Math.max(longestStreak, existing),
  });
}
