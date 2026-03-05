import { useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Card } from "@/components/Card";
import { SectionHeader } from "@/components/SectionHeader";
import { useWorkouts } from "@/hooks/useWorkouts";
import { useRuns } from "@/hooks/useRuns";
import * as haptics from "@/lib/haptics";
import {
  Dumbbell,
  Route,
  ArrowLeft,
  Trash2,
} from "lucide-react-native";
import type { Activity } from "@/lib/types";

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatDuration(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function HistoryScreen() {
  const router = useRouter();
  const { workouts, loading: wLoad, deleteWorkout } = useWorkouts(50);
  const { runs, loading: rLoad, deleteRun } = useRuns(50);

  const loading = wLoad || rLoad;

  const allActivity = useMemo<Activity[]>(() => {
    const items: Activity[] = [
      ...workouts.map((w) => ({ type: "workout" as const, data: w })),
      ...runs.map((r) => ({ type: "run" as const, data: r })),
    ];
    items.sort(
      (a, b) => b.data.createdAt.toMillis() - a.data.createdAt.toMillis(),
    );
    return items;
  }, [workouts, runs]);

  async function handleDelete(item: Activity) {
    haptics.warning();
    if (item.type === "workout") {
      await deleteWorkout(item.data.id);
    } else {
      await deleteRun(item.data.id);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="mb-4 mt-2 flex-row items-center">
          <TouchableOpacity
            className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-[#1A1A24]"
            onPress={() => router.back()}
          >
            <ArrowLeft size={20} color="#fff" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-white">History</Text>
        </View>

        <SectionHeader title={`${allActivity.length} Activities`} />

        {loading ? (
          <ActivityIndicator color="#8b5cf6" className="my-12" />
        ) : allActivity.length === 0 ? (
          <Card className="items-center py-8">
            <Text className="text-sm text-gray-400">
              No activity recorded yet
            </Text>
          </Card>
        ) : (
          allActivity.map((item) => {
            const isWorkout = item.type === "workout";
            const date = item.data.createdAt.toDate();

            return (
              <Card key={item.data.id} className="mb-3">
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
                        ? `${item.data.exercises.length} exercises · ${item.data.durationMinutes} min`
                        : `${item.data.distanceMiles.toFixed(2)} mi · ${formatDuration(item.data.durationSeconds)} · ${item.data.pacePerMile}/mi`}
                    </Text>
                    <Text className="mt-1 text-[10px] text-gray-500">
                      {formatDate(date)}
                    </Text>
                  </View>
                  <TouchableOpacity
                    className="h-8 w-8 items-center justify-center"
                    onPress={() => handleDelete(item)}
                  >
                    <Trash2 size={16} color="#6B7280" />
                  </TouchableOpacity>
                </View>
              </Card>
            );
          })
        )}

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
