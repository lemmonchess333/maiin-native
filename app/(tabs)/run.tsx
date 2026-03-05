import { useState, useRef, useEffect } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "@/components/Card";
import { StatBadge } from "@/components/StatBadge";
import { useRuns } from "@/hooks/useRuns";
import {
  Play,
  Square,
  Pause,
  MapPin,
  Navigation,
} from "lucide-react-native";

type RunState = "idle" | "running" | "paused";

export default function RunScreen() {
  const { saveRun } = useRuns();
  const [state, setState] = useState<RunState>("idle");
  const [seconds, setSeconds] = useState(0);
  const [distance, setDistance] = useState(0);
  const [saving, setSaving] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (state === "running") {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => s + 1);
        setDistance((d) => d + 0.002);
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

  function handleStart() {
    setState("running");
  }
  function handlePause() {
    setState("paused");
  }
  function handleResume() {
    setState("running");
  }

  async function handleStop() {
    if (distance > 0.01) {
      setSaving(true);
      try {
        const calories = Math.floor(distance * 100);
        await saveRun(distance, seconds, calories);
        Alert.alert(
          "Run Saved",
          `${distance.toFixed(2)} mi in ${formatTime(seconds)}`,
        );
      } catch (err: any) {
        Alert.alert("Error", err.message ?? "Failed to save run");
      } finally {
        setSaving(false);
      }
    }
    setState("idle");
    setSeconds(0);
    setDistance(0);
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-5">
        {/* Header */}
        <View className="mb-6 mt-2 flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-bold text-white">Run</Text>
            <Text className="text-sm text-gray-400">GPS tracking</Text>
          </View>
          <Navigation size={24} color="#FF6B6B" />
        </View>

        {/* Map placeholder */}
        <Card className="mb-5 h-48 items-center justify-center">
          <MapPin size={32} color="#FF6B6B" />
          <Text className="mt-2 text-sm text-gray-400">
            {state === "idle"
              ? "Map will appear when you start"
              : "GPS tracking active"}
          </Text>
        </Card>

        {/* Timer */}
        <View className="mb-6 items-center">
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
