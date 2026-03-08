import { useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "@/lib/auth-context";
import { Card } from "@/components/Card";
import { AnimatedCard } from "@/components/AnimatedCard";
import { SectionHeader } from "@/components/SectionHeader";
import { StatBadge } from "@/components/StatBadge";
import { EmptyState } from "@/components/EmptyState";
import { SkeletonCard, SkeletonStatRow } from "@/components/Skeleton";
import { PressableScale } from "@/components/PressableScale";
import { InsightsCard } from "@/components/InsightsCard";
import { useWorkouts } from "@/hooks/useWorkouts";
import { useRuns } from "@/hooks/useRuns";
import { useProfile } from "@/hooks/useProfile";
import { useStreakSync } from "@/hooks/useStreakSync";
import { useStreaks } from "@/hooks/useStreaks";
import { StreakCounter } from "@/components/StreakCounter";
import { BadgeEarnedModal } from "@/components/BadgeEarnedModal";
import { Dumbbell, Route, TrendingUp, Zap } from "lucide-react-native";
import type { Activity } from "@/lib/types";

function timeAgo(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay === 1) return "Yesterday";
  return `${diffDay}d ago`;
}

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { workouts, loading: wLoading } = useWorkouts(10);
  const { runs, loading: rLoading } = useRuns(10);
  const { profile } = useProfile();

  // Recalculate streak whenever activity data changes
  useStreakSync(workouts, runs);

  const { streakData, newBadge, dismissNewBadge, checkStreakBadges } = useStreaks();

  const loading = wLoading || rLoading;

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  // Merge workouts + runs into a single feed sorted by date
  const recentActivity = useMemo<Activity[]>(() => {
    const items: Activity[] = [
      ...workouts.map((w) => ({ type: "workout" as const, data: w })),
      ...runs.map((r) => ({ type: "run" as const, data: r })),
    ];
    items.sort(
      (a, b) => b.data.createdAt.toMillis() - a.data.createdAt.toMillis(),
    );
    return items.slice(0, 5);
  }, [workouts, runs]);

  // Weekly stats (last 7 days)
  const weeklyStats = useMemo(() => {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const weekWorkouts = workouts.filter(
      (w) => w.createdAt.toMillis() > weekAgo,
    );
    const weekRuns = runs.filter((r) => r.createdAt.toMillis() > weekAgo);
    const totalMiles = weekRuns.reduce((s, r) => s + r.distanceMiles, 0);
    return {
      workoutCount: weekWorkouts.length + weekRuns.length,
      miles: totalMiles.toFixed(1),
      liftPct:
        weekWorkouts.length + weekRuns.length > 0
          ? Math.round(
              (weekWorkouts.length /
                (weekWorkouts.length + weekRuns.length)) *
                100,
            )
          : 50,
    };
  }, [workouts, runs]);

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Firestore onSnapshot auto-syncs; brief visual feedback
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#8b5cf6"
            colors={["#8b5cf6"]}
          />
        }
      >
        {/* Header */}
        <View className="mb-6 mt-2">
          <Text className="text-base text-gray-400">{today}</Text>
          <Text className="mt-1 text-2xl font-bold text-white">
            Welcome back
            {profile?.displayName ? `, ${profile.displayName}` : ""}
          </Text>
        </View>

        {/* Weekly Stats */}
        <SectionHeader title="This Week" />
        <Card className="mb-5 flex-row justify-around">
          <StatBadge
            label="Workouts"
            value={String(weeklyStats.workoutCount)}
            color="brand"
          />
          <StatBadge label="Miles" value={weeklyStats.miles} color="running" />
          <StatBadge
            label="Streak"
            value={`${profile?.currentStreak ?? 0}d`}
            color="success"
          />
        </Card>

        {/* Streak Counter */}
        <View className="mb-5">
          <StreakCounter
            currentStreak={streakData.currentStreak}
            longestStreak={streakData.longestStreak}
          />
        </View>

        {/* Quick Actions */}
        <SectionHeader title="Quick Start" />
        <View className="mb-5 flex-row gap-3">
          <PressableScale
            className="flex-1 items-center rounded-2xl bg-brand/20 py-5"
            onPress={() => router.push("/log")}
          >
            <Dumbbell size={28} color="#8b5cf6" />
            <Text className="mt-2 text-sm font-semibold text-brand">
              Log Lift
            </Text>
          </PressableScale>
          <PressableScale
            className="flex-1 items-center rounded-2xl bg-running/20 py-5"
            onPress={() => router.push("/run")}
          >
            <Route size={28} color="#FF6B6B" />
            <Text className="mt-2 text-sm font-semibold text-running">
              Start Run
            </Text>
          </PressableScale>
        </View>

        {/* Recent Activity */}
        <SectionHeader
          title="Recent Activity"
          action="View All"
          onAction={() => router.push("/history")}
        />

        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : recentActivity.length === 0 ? (
          <EmptyState
            icon={<Zap size={28} color="#8b5cf6" />}
            title="No Activity Yet"
            subtitle="Hit the quick start buttons above to log your first workout or run."
          />
        ) : (
          recentActivity.map((item, index) => {
            const isWorkout = item.type === "workout";
            const created = item.data.createdAt.toDate();
            return (
              <AnimatedCard key={item.data.id} index={index} className="mb-3">
                <View className="flex-row items-center">
                  <View
                    className={`mr-3 h-10 w-10 items-center justify-center rounded-full ${
                      isWorkout ? "bg-brand/20" : "bg-running/20"
                    }`}
                  >
                    {isWorkout ? (
                      <Dumbbell size={18} color="#8b5cf6" />
                    ) : (
                      <Route size={18} color="#FF6B6B" />
                    )}
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-white">
                      {isWorkout ? item.data.name : "Run"}
                    </Text>
                    <Text className="text-xs text-gray-400">
                      {isWorkout
                        ? `${item.data.exercises.length} exercises — ${item.data.durationMinutes} min`
                        : `${item.data.distanceMiles.toFixed(1)} mi — ${item.data.pacePerMile}/mi`}
                    </Text>
                  </View>
                  <Text className="text-xs text-gray-500">
                    {timeAgo(created)}
                  </Text>
                </View>
              </AnimatedCard>
            );
          })
        )}

        {/* Insights */}
        <SectionHeader title="Insights" />
        <InsightsCard workouts={workouts} runs={runs} />

        {/* Training Load */}
        <SectionHeader title="Training Load" />
        <Card className="mb-8">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <TrendingUp size={18} color="#34d399" />
              <Text className="ml-2 text-sm font-medium text-white">
                {weeklyStats.liftPct >= 40 && weeklyStats.liftPct <= 60
                  ? "Balanced"
                  : weeklyStats.liftPct > 60
                    ? "Lift-heavy"
                    : "Run-heavy"}
              </Text>
            </View>
            <Text className="text-xs text-gray-400">
              {weeklyStats.liftPct}% lifting · {100 - weeklyStats.liftPct}%
              running
            </Text>
          </View>
          <View className="mt-3 h-2 flex-row overflow-hidden rounded-full">
            <View
              style={{ width: `${weeklyStats.liftPct}%` }}
              className="bg-brand"
            />
            <View
              style={{ width: `${100 - weeklyStats.liftPct}%` }}
              className="bg-running"
            />
          </View>
        </Card>
      </ScrollView>

      <BadgeEarnedModal badge={newBadge} onDismiss={dismissNewBadge} />
    </SafeAreaView>
  );
}
