import { useState, useEffect } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";

interface LeaderboardEntry {
  uid: string;
  name: string;
  value: number;
  rank: number;
}

type ChallengeType = "weekly_distance" | "weekly_volume" | "weekly_hybrid";

async function buildLeaderboard(
  currentUid: string,
  challenge: ChallengeType,
): Promise<LeaderboardEntry[]> {
  const followingSnap = await getDocs(
    collection(db, "following", currentUid, "users"),
  );
  const uids = [currentUid, ...followingSnap.docs.map((d) => d.id)];

  const since = new Date();
  since.setDate(since.getDate() - since.getDay());
  since.setHours(0, 0, 0, 0);
  const sinceTs = Timestamp.fromDate(since);

  const entries: { uid: string; value: number }[] = [];

  await Promise.all(
    uids.map(async (uid) => {
      let value = 0;

      if (challenge === "weekly_distance" || challenge === "weekly_hybrid") {
        const runsSnap = await getDocs(
          query(
            collection(db, "users", uid, "runs"),
            where("completedAt", ">=", sinceTs),
            orderBy("completedAt"),
            limit(50),
          ),
        );
        const km = runsSnap.docs.reduce(
          (s, d) => s + (d.data().distance || 0) / 1000,
          0,
        );
        if (challenge === "weekly_distance")
          value = Math.round(km * 10) / 10;
        else value += km * 100;
      }

      if (challenge === "weekly_volume" || challenge === "weekly_hybrid") {
        const workoutsSnap = await getDocs(
          query(
            collection(db, "users", uid, "workouts"),
            where("date", ">=", since.toISOString().split("T")[0]),
            orderBy("date"),
            limit(50),
          ),
        );
        const kg = workoutsSnap.docs.reduce((s, d) => {
          return (
            s +
            (d.data().exercises || []).reduce(
              (es: number, ex: any) =>
                es +
                (ex.sets || []).reduce(
                  (ss: number, set: any) =>
                    ss + (set.weightKg || 0) * (set.reps || 0),
                  0,
                ),
              0,
            )
          );
        }, 0);
        if (challenge === "weekly_volume") value = Math.round(kg);
        else value += kg * 0.1;
      }

      entries.push({ uid, value: Math.round(value * 10) / 10 });
    }),
  );

  return entries
    .sort((a, b) => b.value - a.value)
    .map((e, i) => ({
      uid: e.uid,
      name: "",
      value: e.value,
      rank: i + 1,
    }));
}

const RANK_COLORS: Record<number, { bg: string; text: string }> = {
  1: { bg: "rgba(234,179,8,0.15)", text: "#eab308" },
  2: { bg: "rgba(156,163,175,0.15)", text: "#9ca3af" },
  3: { bg: "rgba(251,146,60,0.15)", text: "#fb923c" },
};

export function LeaderboardCard({
  challenge = "weekly_hybrid",
}: {
  challenge?: ChallengeType;
}) {
  const { user } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const challengeLabels: Record<
    ChallengeType,
    { title: string; unit: string; icon: string }
  > = {
    weekly_distance: { title: "Weekly Distance", unit: "km", icon: "🏃" },
    weekly_volume: { title: "Weekly Volume", unit: "kg", icon: "🏋️" },
    weekly_hybrid: { title: "Hybrid Score", unit: "pts", icon: "⚡" },
  };

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    buildLeaderboard(user.uid, challenge)
      .then(async (raw) => {
        const named = await Promise.all(
          raw.map(async (e) => {
            try {
              const snap = await getDocs(
                query(
                  collection(db, "users"),
                  where("uid", "==", e.uid),
                  limit(1),
                ),
              );
              const name =
                snap.docs[0]?.data()?.displayName || "Athlete";
              return { ...e, name };
            } catch {
              return {
                ...e,
                name: e.uid === user.uid ? "You" : "Athlete",
              };
            }
          }),
        );
        setEntries(named.filter((e) => e.value > 0));
      })
      .finally(() => setLoading(false));
  }, [user, challenge]);

  const { title, unit, icon } = challengeLabels[challenge];

  return (
    <View className="rounded-2xl border border-[#2A2A3A] bg-[#1A1A24] p-4">
      <View className="mb-3 flex-row items-center gap-2">
        <Text>{icon}</Text>
        <Text className="text-sm font-semibold text-white">{title}</Text>
        <Text className="ml-auto text-[10px] text-gray-500">This Week</Text>
      </View>

      {loading && (
        <ActivityIndicator
          size="small"
          color="#2dd4bf"
          style={{ marginVertical: 12 }}
        />
      )}

      {!loading && entries.length === 0 && (
        <Text className="py-4 text-center text-xs text-gray-500">
          Follow users to see the leaderboard. Compete on distance, volume, or
          both!
        </Text>
      )}

      {entries.map((entry) => {
        const rankStyle = RANK_COLORS[entry.rank];
        const isYou = entry.uid === user?.uid;
        return (
          <View
            key={entry.uid}
            className="mb-1.5 flex-row items-center gap-3 rounded-lg p-2"
            style={
              isYou
                ? {
                    backgroundColor: "rgba(139,92,246,0.08)",
                    borderWidth: 1,
                    borderColor: "rgba(139,92,246,0.3)",
                  }
                : undefined
            }
          >
            <View
              className="h-6 w-6 items-center justify-center rounded-full"
              style={{
                backgroundColor: rankStyle?.bg ?? "rgba(107,114,128,0.15)",
              }}
            >
              <Text
                className="text-xs font-bold"
                style={{ color: rankStyle?.text ?? "#6B7280" }}
              >
                {entry.rank}
              </Text>
            </View>
            <Text
              className="flex-1 text-sm font-medium text-white"
              numberOfLines={1}
            >
              {isYou ? "You" : entry.name}
            </Text>
            <Text className="text-sm font-semibold text-white">
              {entry.value.toLocaleString()}{" "}
              <Text className="text-[10px] text-gray-500">{unit}</Text>
            </Text>
          </View>
        );
      })}

      <Text className="mt-3 text-center text-[10px] text-gray-500">
        Hybrid Score = (km x 100) + (volume kg x 0.1)
      </Text>
    </View>
  );
}
