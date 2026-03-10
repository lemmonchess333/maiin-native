import { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { ArrowLeft } from "lucide-react-native";
import { SplitsBarChart } from "@/components/analytics/SplitsBarChart";

const ACTIVITY_LABELS: Record<string, string> = {
  freerun: "Free Run",
  easy: "Easy Run",
  tempo: "Tempo Run",
  intervals: "Intervals",
  longrun: "Long Run",
  race: "Race",
  treadmill: "Treadmill",
};

function StatPill({
  value,
  label,
  color,
}: {
  value: string;
  label: string;
  color?: string;
}) {
  return (
    <View className="flex-1 items-center py-3">
      <Text className="text-2xl font-bold" style={{ color: color ?? "#FFFFFF" }}>
        {value}
      </Text>
      <Text className="mt-1 text-[9px] uppercase tracking-widest text-gray-500">
        {label}
      </Text>
    </View>
  );
}

export default function RunDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ runId: string }>();
  const { user } = useAuth();
  const [run, setRun] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !params.runId) return;
    getDoc(doc(db, "users", user.uid, "runs", params.runId)).then((snap) => {
      if (snap.exists()) setRun({ id: snap.id, ...snap.data() });
      setLoading(false);
    });
  }, [user, params.runId]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-[#0F0F14]">
        <ActivityIndicator size="large" color="#FF6B6B" />
      </SafeAreaView>
    );
  }

  if (!run) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-[#0F0F14]">
        <Text className="text-gray-400">Run not found</Text>
      </SafeAreaView>
    );
  }

  const avgPace =
    run.duration > 0 && run.distance > 0
      ? (run.duration / run.distance) * 1000
      : 0;
  const avgPaceStr =
    avgPace > 0
      ? `${Math.floor(avgPace / 60)}:${(Math.floor(avgPace) % 60).toString().padStart(2, "0")}`
      : "--:--";

  const formatTime = (secs: number): string => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = Math.floor(secs % 60);
    if (h > 0)
      return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  const date = run.completedAt?.toDate?.();
  const dateStr =
    date?.toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }) ?? "";

  return (
    <SafeAreaView className="flex-1 bg-[#0F0F14]">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header */}
        <View className="flex-row items-center px-4 py-3">
          <TouchableOpacity
            className="mr-3 h-9 w-9 items-center justify-center rounded-full bg-[#1A1A24]"
            onPress={() => router.back()}
          >
            <ArrowLeft size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        <View className="px-4">
          {/* Title */}
          <Text className="text-[10px] uppercase tracking-widest text-gray-500">
            {ACTIVITY_LABELS[run.activityType] ?? "Run"}
          </Text>
          <Text className="text-xl font-bold text-white">
            {(run.distance / 1000).toFixed(2)} km
          </Text>
          <Text className="mt-1 text-xs text-gray-500">{dateStr}</Text>

          {/* Primary stats */}
          <View className="mt-4 flex-row rounded-2xl border border-[#2A2A3A] bg-[#1A1A24]">
            <StatPill value={formatTime(run.duration)} label="Time" />
            <View className="w-px bg-[#2A2A3A]" />
            <StatPill value={avgPaceStr} label="/km Pace" color="#2dd4bf" />
            <View className="w-px bg-[#2A2A3A]" />
            <StatPill
              value={`${run.calories ?? 0}`}
              label="Cal"
              color="#f59e0b"
            />
          </View>

          {/* Secondary stats */}
          <View className="mt-3 flex-row gap-3">
            <View className="flex-1 items-center rounded-2xl border border-[#2A2A3A] bg-[#1A1A24] p-3">
              <Text className="text-lg font-bold text-white">
                {run.elevationGain ?? 0}m
              </Text>
              <Text className="mt-0.5 text-[9px] uppercase tracking-widest text-gray-500">
                Elevation Gain
              </Text>
            </View>
            <View className="flex-1 items-center rounded-2xl border border-[#2A2A3A] bg-[#1A1A24] p-3">
              <Text className="text-lg font-bold text-white">
                {run.splits?.length ?? 0}
              </Text>
              <Text className="mt-0.5 text-[9px] uppercase tracking-widest text-gray-500">
                Splits
              </Text>
            </View>
          </View>

          {/* Splits chart */}
          {run.splits?.length > 0 && (
            <View className="mt-4">
              <SplitsBarChart
                splits={run.splits}
                avgPaceSeconds={avgPace}
                accentColor="#2dd4bf"
              />
            </View>
          )}

          {/* Notes */}
          {run.notes && (
            <View className="mt-4 rounded-2xl border border-[#2A2A3A] bg-[#1A1A24] p-4">
              <Text className="text-sm font-semibold text-white">Notes</Text>
              <Text className="mt-1 text-sm text-gray-400">{run.notes}</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
