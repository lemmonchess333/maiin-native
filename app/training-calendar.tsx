import { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react-native";
import { useAuth } from "@/lib/auth-context";
import { useProfile } from "@/hooks/useProfile";
import { useWorkouts } from "@/hooks/useWorkouts";
import { useRuns } from "@/hooks/useRuns";
import { WeekStrip } from "@/components/calendar/WeekStrip";
import { EmptyState } from "@/components/EmptyState";

function getWeekDays(weekOffset: number) {
  const now = new Date();
  const monday = new Date(now);
  const dayOfWeek = now.getDay();
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  monday.setDate(now.getDate() + diff + weekOffset * 7);
  monday.setHours(0, 0, 0, 0);

  const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const todayStr = now.toISOString().split("T")[0];

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dateStr = d.toISOString().split("T")[0];
    return {
      date: dateStr,
      label: labels[i],
      dayNum: d.getDate(),
      isToday: dateStr === todayStr,
    };
  });
}

function getWeekLabel(weekOffset: number): string {
  if (weekOffset === 0) return "This Week";
  if (weekOffset === 1) return "Next Week";
  if (weekOffset === -1) return "Last Week";
  const days = getWeekDays(weekOffset);
  const start = new Date(days[0].date + "T12:00:00");
  const end = new Date(days[6].date + "T12:00:00");
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${fmt(start)} – ${fmt(end)}`;
}

interface TrainingSession {
  id: string;
  date: string;
  type: "run" | "lift";
  status: "scheduled" | "completed" | "skipped";
  runTemplateName?: string;
  liftProgramDay?: string;
}

export default function TrainingCalendarScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { profile } = useProfile();
  const { workouts } = useWorkouts(50);
  const { runs } = useRuns(50);
  const [weekOffset, setWeekOffset] = useState(0);

  const weekDays = useMemo(() => getWeekDays(weekOffset), [weekOffset]);
  const weekLabel = useMemo(() => getWeekLabel(weekOffset), [weekOffset]);

  // Build sessions from actual workout/run data
  const sessions = useMemo<TrainingSession[]>(() => {
    const dateRange = new Set(weekDays.map((d) => d.date));
    const items: TrainingSession[] = [];

    for (const w of workouts) {
      const d = w.createdAt.toDate().toISOString().split("T")[0];
      if (dateRange.has(d)) {
        items.push({
          id: w.id,
          date: d,
          type: "lift",
          status: "completed",
          liftProgramDay: w.name,
        });
      }
    }

    for (const r of runs) {
      const d = r.createdAt.toDate().toISOString().split("T")[0];
      if (dateRange.has(d)) {
        items.push({
          id: r.id,
          date: d,
          type: "run",
          status: "completed",
          runTemplateName: `${r.distanceMiles.toFixed(1)} mi`,
        });
      }
    }

    return items;
  }, [weekDays, workouts, runs]);

  // Weekly summary
  const summary = useMemo(() => {
    const liftCount = sessions.filter((s) => s.type === "lift").length;
    const runCount = sessions.filter((s) => s.type === "run").length;
    return { liftCount, runCount, total: liftCount + runCount };
  }, [sessions]);

  const handleAdd = useCallback(
    (date: string) => {
      Alert.alert("Add Session", `Add a session for ${date}?`, [
        { text: "Cancel", style: "cancel" },
        { text: "Log Lift", onPress: () => router.push("/log") },
        { text: "Start Run", onPress: () => router.push("/run") },
      ]);
    },
    [router],
  );

  const handleStart = useCallback(
    (session: TrainingSession) => {
      if (session.type === "lift") {
        router.push("/log");
      } else {
        router.push("/run");
      }
    },
    [router],
  );

  const handleSkip = useCallback((_sessionId: string) => {
    // Skipping is a no-op for already completed sessions
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="mb-4 mt-2 flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-3 p-1">
            <ChevronLeft size={24} color="#fff" />
          </TouchableOpacity>
          <Text className="flex-1 text-xl font-bold text-white">
            Training Calendar
          </Text>
        </View>

        {/* Week Navigator */}
        <View className="mb-4 flex-row items-center justify-between rounded-xl bg-[#1A1A24] px-4 py-3">
          <TouchableOpacity
            onPress={() => setWeekOffset((o) => o - 1)}
            className="p-1"
          >
            <ChevronLeft size={20} color="#8b5cf6" />
          </TouchableOpacity>
          <Text className="text-sm font-semibold text-white">{weekLabel}</Text>
          <TouchableOpacity
            onPress={() => setWeekOffset((o) => o + 1)}
            className="p-1"
          >
            <ChevronRight size={20} color="#8b5cf6" />
          </TouchableOpacity>
        </View>

        {/* Today button */}
        {weekOffset !== 0 && (
          <TouchableOpacity
            onPress={() => setWeekOffset(0)}
            className="mb-4 self-center rounded-full bg-brand/20 px-4 py-1.5"
          >
            <Text className="text-xs font-semibold text-brand">
              Jump to Today
            </Text>
          </TouchableOpacity>
        )}

        {/* Weekly Summary */}
        <View className="mb-4 flex-row gap-3">
          <View className="flex-1 items-center rounded-xl bg-[#1A1A24] py-3">
            <Text className="text-lg font-bold text-white">
              {summary.total}
            </Text>
            <Text className="text-[10px] text-gray-500">Sessions</Text>
          </View>
          <View className="flex-1 items-center rounded-xl bg-[#1A1A24] py-3">
            <Text className="text-lg font-bold text-brand">
              {summary.liftCount}
            </Text>
            <Text className="text-[10px] text-gray-500">Lifts</Text>
          </View>
          <View className="flex-1 items-center rounded-xl bg-[#1A1A24] py-3">
            <Text className="text-lg font-bold text-running">
              {summary.runCount}
            </Text>
            <Text className="text-[10px] text-gray-500">Runs</Text>
          </View>
        </View>

        {/* Week Strip */}
        {sessions.length === 0 && weekOffset === 0 ? (
          <View className="mt-4">
            <WeekStrip
              weekDays={weekDays}
              sessions={[]}
              weekSchedule={profile?.schedule}
              onAdd={handleAdd}
              onStart={handleStart}
              onSkip={handleSkip}
            />
            {!profile?.schedule && (
              <EmptyState
                icon={<Calendar size={28} color="#8b5cf6" />}
                title="No Schedule Set"
                subtitle="Complete onboarding to set up your weekly training schedule."
              />
            )}
          </View>
        ) : (
          <WeekStrip
            weekDays={weekDays}
            sessions={sessions}
            weekSchedule={profile?.schedule}
            onAdd={handleAdd}
            onStart={handleStart}
            onSkip={handleSkip}
          />
        )}

        {/* Bottom spacer */}
        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
