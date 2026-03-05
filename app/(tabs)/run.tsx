import { useState, useRef, useEffect } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useKeepAwake } from "expo-keep-awake";
import { Card } from "@/components/Card";
import { StatBadge } from "@/components/StatBadge";
import { RunMapView } from "@/components/RunMapView";
import { useRuns } from "@/hooks/useRuns";
import { useLocation } from "@/hooks/useLocation";
import { useRunAudioCues } from "@/hooks/useRunAudioCues";
import { useNotifications } from "@/hooks/useNotifications";
import * as haptics from "@/lib/haptics";
import {
  Play,
  Square,
  Pause,
  Navigation,
  Volume2,
  VolumeX,
} from "lucide-react-native";

type RunState = "idle" | "running" | "paused";

export default function RunScreen() {
  const { saveRun } = useRuns();
  const location = useLocation();
  const { scheduleRunComplete } = useNotifications();
  const [state, setState] = useState<RunState>("idle");
  const [audioCues, setAudioCues] = useState(true);
  // Keep screen awake during active run
  useKeepAwake(state !== "idle" ? "run-tracking" : undefined);
  const [seconds, setSeconds] = useState(0);
  const [saving, setSaving] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Use real GPS distance when tracking, otherwise 0
  const distance = location.distanceMiles;

  // Audio cues for mile markers and time updates
  useRunAudioCues({
    active: state === "running",
    distanceMiles: distance,
    elapsedSeconds: seconds,
    enabled: audioCues,
  });

  useEffect(() => {
    if (state === "running") {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [state]);

  function formatTime(secs: number) {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0)
      return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  function getPace() {
    if (distance <= 0) return "--:--";
    const paceSeconds = seconds / distance;
    const m = Math.floor(paceSeconds / 60);
    const s = Math.floor(paceSeconds % 60);
    return `${m}:${String(s).padStart(2, "0")}`;
  }

  async function handleStart() {
    haptics.heavyTap();
    await location.startTracking();
    setState("running");
  }

  function handlePause() {
    haptics.mediumTap();
    location.stopTracking();
    setState("paused");
  }

  async function handleResume() {
    haptics.mediumTap();
    await location.startTracking();
    setState("running");
  }

  async function handleStop() {
    haptics.heavyTap();
    location.stopTracking();

    if (distance > 0.01) {
      setSaving(true);
      try {
        const calories = Math.floor(distance * 100);
        await saveRun(distance, seconds, calories, location.route);
        haptics.success();

        // Send completion notification
        scheduleRunComplete(distance.toFixed(2), formatTime(seconds));

        Alert.alert(
          "Run Saved",
          `${distance.toFixed(2)} mi in ${formatTime(seconds)}`,
        );
      } catch (err: any) {
        haptics.warning();
        Alert.alert("Error", err.message ?? "Failed to save run");
      } finally {
        setSaving(false);
      }
    }
    setState("idle");
    setSeconds(0);
    location.reset();
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-5">
        {/* Header */}
        <View className="mb-4 mt-2 flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-bold text-white">Run</Text>
            <Text className="text-sm text-gray-400">
              {location.error ?? "GPS tracking"}
            </Text>
          </View>
          <View className="flex-row items-center gap-3">
            <TouchableOpacity
              onPress={() => {
                haptics.selection();
                setAudioCues((v) => !v);
              }}
            >
              {audioCues ? (
                <Volume2 size={22} color="#2dd4bf" />
              ) : (
                <VolumeX size={22} color="#6B7280" />
              )}
            </TouchableOpacity>
            <Navigation size={24} color="#FF6B6B" />
          </View>
        </View>

        {/* Live Map */}
        {state !== "idle" && location.route.length > 1 ? (
          <View className="mb-4">
            <RunMapView route={location.route} height={180} />
          </View>
        ) : (
          <Card className="mb-4 h-44 items-center justify-center">
            <Navigation size={32} color="#FF6B6B" />
            <Text className="mt-2 text-sm text-gray-400">
              {state === "idle"
                ? "Tap play to start GPS tracking"
                : `Tracking · ${location.route.length} GPS points`}
            </Text>
            {location.currentSpeed != null && state === "running" && (
              <Text className="mt-1 text-xs text-running">
                {location.currentSpeed.toFixed(1)} mph
              </Text>
            )}
          </Card>
        )}

        {/* Timer */}
        <View className="mb-5 items-center">
          <Text className="text-6xl font-bold text-white">
            {formatTime(seconds)}
          </Text>
        </View>

        {/* Stats */}
        <Card className="mb-6 flex-row justify-around">
          <StatBadge
            label="Distance (mi)"
            value={distance.toFixed(2)}
            color="running"
          />
          <StatBadge label="Pace (/mi)" value={getPace()} color="teal" />
          <StatBadge
            label="Calories"
            value={Math.floor(distance * 100).toString()}
            color="warning"
          />
        </Card>

        {/* Controls */}
        <View className="mt-auto mb-8 flex-row items-center justify-center gap-4">
          {state === "idle" && (
            <TouchableOpacity
              className="h-20 w-20 items-center justify-center rounded-full bg-running"
              onPress={handleStart}
            >
              <Play size={32} color="#fff" fill="#fff" />
            </TouchableOpacity>
          )}

          {state === "running" && (
            <>
              <TouchableOpacity
                className="h-16 w-16 items-center justify-center rounded-full bg-[#2A2A3A]"
                onPress={handleStop}
                disabled={saving}
              >
                <Square size={24} color="#FF6B6B" fill="#FF6B6B" />
              </TouchableOpacity>
              <TouchableOpacity
                className="h-20 w-20 items-center justify-center rounded-full bg-warning"
                onPress={handlePause}
              >
                <Pause size={32} color="#fff" fill="#fff" />
              </TouchableOpacity>
            </>
          )}

          {state === "paused" && (
            <>
              <TouchableOpacity
                className="h-16 w-16 items-center justify-center rounded-full bg-[#2A2A3A]"
                onPress={handleStop}
                disabled={saving}
              >
                <Square size={24} color="#FF6B6B" fill="#FF6B6B" />
              </TouchableOpacity>
              <TouchableOpacity
                className="h-20 w-20 items-center justify-center rounded-full bg-success"
                onPress={handleResume}
              >
                <Play size={32} color="#fff" fill="#fff" />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
