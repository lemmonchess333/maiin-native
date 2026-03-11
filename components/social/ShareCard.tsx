import { View, Text } from "react-native";

export interface ShareCardData {
  type: "run" | "workout" | "badge" | "pr" | "weekly_summary" | "streak";
  userName: string;
  date: string;
  // Run
  distance?: number;
  duration?: number;
  pace?: string;
  elevationGain?: number;
  // Workout
  exerciseCount?: number;
  totalVolume?: number;
  prsHit?: number;
  muscleGroups?: string[];
  // Badge
  badgeIcon?: string;
  badgeName?: string;
  badgeDescription?: string;
  // PR
  exerciseName?: string;
  oldWeight?: number;
  newWeight?: number;
  // Weekly Summary
  weekSessions?: number;
  weekKm?: number;
  weekTonnage?: number;
  weekStreak?: number;
  // Streak
  streakCount?: number;
}

function formatDuration(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export function ShareCard({ data }: { data: ShareCardData }) {
  return (
    <View className="items-center justify-center bg-[#0a0a0a] p-8">
      {/* Brand header */}
      <Text className="mb-1 text-2xl font-bold tracking-tight" style={{ color: "#a78bfa" }}>
        MAIIN
      </Text>
      <Text className="mb-8 text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>
        Adaptive Fitness
      </Text>

      {/* Run card */}
      {data.type === "run" && (
        <View className="items-center">
          <Text className="mb-4 text-5xl">🏃</Text>
          <Text className="text-5xl font-bold text-white">
            {((data.distance || 0) / 1000).toFixed(2)}
          </Text>
          <Text className="mt-1 text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
            kilometres
          </Text>
          <View className="mt-4 flex-row gap-8">
            <View className="items-center">
              <Text className="text-2xl font-bold text-white">
                {data.pace || "--:--"}
              </Text>
              <Text className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                /km pace
              </Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-white">
                {data.duration ? formatDuration(data.duration) : "--"}
              </Text>
              <Text className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                time
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Workout card */}
      {data.type === "workout" && (
        <View className="items-center">
          <Text className="mb-4 text-5xl">🏋️</Text>
          <Text className="text-5xl font-bold text-white">
            {data.totalVolume
              ? `${(data.totalVolume / 1000).toFixed(1)}t`
              : "0"}
          </Text>
          <Text className="mt-1 text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
            total volume
          </Text>
          <View className="mt-4 flex-row gap-8">
            <View className="items-center">
              <Text className="text-2xl font-bold text-white">
                {data.exerciseCount || 0}
              </Text>
              <Text className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                exercises
              </Text>
            </View>
            {(data.prsHit || 0) > 0 && (
              <View className="items-center">
                <Text className="text-2xl font-bold text-yellow-400">
                  🏆 {data.prsHit}
                </Text>
                <Text className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                  PRs
                </Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Badge card */}
      {data.type === "badge" && (
        <View className="items-center">
          <Text className="text-6xl">{data.badgeIcon || "🏅"}</Text>
          <Text className="mt-3 text-2xl font-bold text-white">
            {data.badgeName}
          </Text>
          <Text className="mt-1 text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
            {data.badgeDescription}
          </Text>
          <Text className="mt-3 text-lg font-bold text-yellow-400">
            Badge Earned!
          </Text>
        </View>
      )}

      {/* PR card */}
      {data.type === "pr" && (
        <View className="items-center">
          <Text className="mb-2 text-5xl">🏆</Text>
          <Text className="text-xl font-bold text-white">
            {data.exerciseName}
          </Text>
          <View className="mt-3 flex-row items-center gap-4">
            <View className="items-center">
              <Text className="text-xl font-bold" style={{ color: "rgba(255,255,255,0.4)" }}>
                {data.oldWeight}kg
              </Text>
              <Text className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
                before
              </Text>
            </View>
            <Text className="text-xl" style={{ color: "rgba(255,255,255,0.3)" }}>
              →
            </Text>
            <View className="items-center">
              <Text className="text-3xl font-bold text-yellow-400">
                {data.newWeight}kg
              </Text>
              <Text className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
                NEW PR
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Weekly Summary */}
      {data.type === "weekly_summary" && (
        <View className="items-center">
          <Text className="mb-4 text-xl font-bold text-white">
            Weekly Wrap-Up
          </Text>
          <View className="flex-row flex-wrap gap-6">
            <View className="items-center">
              <Text className="text-3xl font-bold" style={{ color: "#6C7CFF" }}>
                {data.weekSessions || 0}
              </Text>
              <Text className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                sessions
              </Text>
            </View>
            <View className="items-center">
              <Text className="text-3xl font-bold" style={{ color: "#FF6B6B" }}>
                {data.weekKm?.toFixed(1) || "0"}km
              </Text>
              <Text className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                distance
              </Text>
            </View>
            <View className="items-center">
              <Text className="text-3xl font-bold" style={{ color: "#34D399" }}>
                {data.weekTonnage
                  ? (data.weekTonnage / 1000).toFixed(1) + "t"
                  : "0"}
              </Text>
              <Text className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                tonnage
              </Text>
            </View>
            <View className="items-center">
              <Text className="text-3xl font-bold text-orange-400">
                🔥 {data.weekStreak || 0}
              </Text>
              <Text className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                streak
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Streak card */}
      {data.type === "streak" && (
        <View className="items-center">
          <Text className="text-6xl">🔥</Text>
          <Text className="mt-2 text-5xl font-bold text-orange-400">
            {data.streakCount}
          </Text>
          <Text className="mt-1 text-lg" style={{ color: "rgba(255,255,255,0.4)" }}>
            day streak
          </Text>
        </View>
      )}

      {/* Footer */}
      <View className="mt-8 w-full">
        <View
          className="h-1 w-full rounded-full"
          style={{
            backgroundColor: "#8b5cf6",
          }}
        />
        <Text
          className="mt-3 text-center text-sm"
          style={{ color: "rgba(255,255,255,0.2)" }}
        >
          {data.userName} · {data.date}
        </Text>
      </View>
    </View>
  );
}
