import { useState, useRef, useEffect } from "react";
import { View, Text, TouchableOpacity, Alert, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useKeepAwake } from "expo-keep-awake";
import { Timestamp } from "firebase/firestore";
import { Card } from "@/components/Card";
import { StatBadge } from "@/components/StatBadge";
import { RunMapView } from "@/components/RunMapView";
import { RunSummaryModal } from "@/components/RunSummaryModal";
import { ShoeSelector } from "@/components/ShoeSelector";
import { WeatherTip } from "@/components/WeatherTip";
import { GuidedRunPicker } from "@/components/GuidedRunPicker";
import { GuidedRunOverlay } from "@/components/GuidedRunOverlay";
import { useRuns } from "@/hooks/useRuns";
import { useLocation } from "@/hooks/useLocation";
import { useRunAudioCues } from "@/hooks/useRunAudioCues";
import { useNotifications } from "@/hooks/useNotifications";
import { useShoes } from "@/hooks/useShoes";
import { useGuidedRun } from "@/hooks/useGuidedRun";
import type { GuidedRunWorkout } from "@/lib/guidedRun";
import type { Run } from "@/lib/types";
import * as haptics from "@/lib/haptics";
import {
  Play,
  Square,
  Pause,
  Navigation,
  Volume2,
  VolumeX,
  Compass,
} from "lucide-react-native";

type RunState = "idle" | "running" | "paused" | "summary";
type RunMode = "free" | "guided";

export default function RunScreen() {
  const { runs, saveRun } = useRuns();
  const location = useLocation();
  const { scheduleRunComplete } = useNotifications();
  const { activeShoes, defaultShoe, updateMileage } = useShoes();

  const [state, setState] = useState<RunState>("idle");
  const [runMode, setRunMode] = useState<RunMode>("free");
  const [audioCues, setAudioCues] = useState(true);
  const [autoPost, setAutoPost] = useState(true);
  const [selectedShoeId, setSelectedShoeId] = useState<string | null>(null);
  const [selectedWorkout, setSelectedWorkout] =
    useState<GuidedRunWorkout | null>(null);
  const [showGuidedPicker, setShowGuidedPicker] = useState(false);

  // Guided run engine
  const guidedState = useGuidedRun(
    runMode === "guided" ? selectedWorkout : null,
    state === "running",
  );

  useKeepAwake(state !== "idle" && state !== "summary" ? "run-tracking" : undefined);
  const [seconds, setSeconds] = useState(0);
  const [saving, setSaving] = useState(false);

  // Summary data for the modal
  const [summaryData, setSummaryData] = useState<{
    distanceMiles: number;
    durationSeconds: number;
    pacePerMile: string;
    calories: number;
  } | null>(null);
  const [summaryRun, setSummaryRun] = useState<Run | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTime = useRef(Date.now());

  const distance = location.distanceMiles;

  useRunAudioCues({
    active: state === "running",
    distanceMiles: distance,
    elapsedSeconds: seconds,
    enabled: audioCues,
  });

  // Auto-select default shoe
  useEffect(() => {
    if (!selectedShoeId && defaultShoe) {
      setSelectedShoeId(defaultShoe.id);
    }
  }, [defaultShoe, selectedShoeId]);

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

  // Auto-stop guided run when complete
  useEffect(() => {
    if (guidedState.isComplete && state === "running") {
      handleStop();
    }
  }, [guidedState.isComplete]);

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

  function getPaceString(dist: number, dur: number) {
    if (dist <= 0) return "--:--";
    const paceSeconds = dur / dist;
    const m = Math.floor(paceSeconds / 60);
    const s = Math.floor(paceSeconds % 60);
    return `${m}:${String(s).padStart(2, "0")}`;
  }

  async function handleStart() {
    haptics.heavyTap();
    startTime.current = Date.now();
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
      const calories = Math.floor(distance * 100);
      const pacePerMile = getPaceString(distance, seconds);
      setSummaryData({
        distanceMiles: distance,
        durationSeconds: seconds,
        pacePerMile,
        calories,
      });
      // Create a temporary Run object for pace trend calculation
      setSummaryRun({
        id: "temp",
        userId: "",
        distanceMiles: distance,
        durationSeconds: seconds,
        pacePerMile,
        calories,
        route: location.route,
        createdAt: Timestamp.now(),
      });
      setState("summary");
    } else {
      setState("idle");
      setSeconds(0);
      location.reset();
    }
  }

  async function handleSaveRun(notes: string) {
    if (!summaryData) return;
    setSaving(true);
    try {
      await saveRun(
        summaryData.distanceMiles,
        summaryData.durationSeconds,
        summaryData.calories,
        location.route,
      );

      // Update shoe mileage
      if (selectedShoeId) {
        const distKm = summaryData.distanceMiles * 1.60934;
        const result = await updateMileage(selectedShoeId, distKm);
        if (result === "warning") {
          Alert.alert(
            "Shoe Alert",
            "Your shoes are 85% worn — consider replacing soon.",
          );
        } else if (result === "replace") {
          Alert.alert(
            "Shoe Alert",
            "Your shoes have hit their limit — time for a new pair!",
          );
        }
      }

      haptics.success();
      scheduleRunComplete(
        summaryData.distanceMiles.toFixed(2),
        formatTime(summaryData.durationSeconds),
      );
    } catch (err: any) {
      haptics.warning();
      Alert.alert("Error", err.message ?? "Failed to save run");
    } finally {
      setSaving(false);
      resetRun();
    }
  }

  function handleDiscardRun() {
    resetRun();
  }

  function resetRun() {
    setState("idle");
    setSeconds(0);
    location.reset();
    setSummaryData(null);
    setSummaryRun(null);
    setSelectedWorkout(null);
    setRunMode("free");
  }

  // Idle state — run setup
  if (state === "idle") {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View className="mb-4 mt-2 flex-row items-center justify-between">
            <View>
              <Text className="text-2xl font-bold text-white">Run</Text>
              <Text className="text-sm text-gray-400">
                {location.error ?? "Ready to go"}
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

          {/* Run Mode Selector */}
          <View className="mb-4 flex-row gap-3">
            <TouchableOpacity
              className={`flex-1 rounded-xl py-3 ${runMode === "free" ? "bg-running" : "bg-[#1A1A24]"}`}
              onPress={() => {
                haptics.selection();
                setRunMode("free");
                setSelectedWorkout(null);
              }}
            >
              <Text
                className={`text-center text-sm font-semibold ${runMode === "free" ? "text-white" : "text-gray-400"}`}
              >
                Free Run
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 rounded-xl py-3 ${runMode === "guided" ? "bg-running" : "bg-[#1A1A24]"}`}
              onPress={() => {
                haptics.selection();
                setRunMode("guided");
                setShowGuidedPicker(true);
              }}
            >
              <View className="flex-row items-center justify-center gap-1">
                <Compass size={14} color={runMode === "guided" ? "#fff" : "#6B7280"} />
                <Text
                  className={`text-sm font-semibold ${runMode === "guided" ? "text-white" : "text-gray-400"}`}
                >
                  Guided
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Selected Guided Workout */}
          {runMode === "guided" && selectedWorkout && (
            <Card className="mb-4">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-base font-bold text-white">
                    {selectedWorkout.name}
                  </Text>
                  <Text className="text-xs text-gray-400">
                    {selectedWorkout.totalMinutes} min ·{" "}
                    {selectedWorkout.difficulty}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setShowGuidedPicker(true)}
                >
                  <Text className="text-sm text-brand">Change</Text>
                </TouchableOpacity>
              </View>
            </Card>
          )}

          {/* Weather Tip */}
          <WeatherTip />

          {/* Shoe Selector */}
          {activeShoes.length > 0 && (
            <ShoeSelector
              selectedShoeId={selectedShoeId}
              onSelect={setSelectedShoeId}
            />
          )}

          {/* Map placeholder */}
          <Card className="mb-4 mt-4 h-44 items-center justify-center">
            <Navigation size={32} color="#FF6B6B" />
            <Text className="mt-2 text-sm text-gray-400">
              Tap play to start GPS tracking
            </Text>
          </Card>

          <View className="h-4" />
        </ScrollView>

        {/* Start Button */}
        <View className="mb-8 items-center px-5">
          <TouchableOpacity
            className="h-20 w-20 items-center justify-center rounded-full bg-running"
            onPress={handleStart}
          >
            <Play size={32} color="#fff" fill="#fff" />
          </TouchableOpacity>
        </View>

        {/* Guided Run Picker */}
        {showGuidedPicker && (
          <GuidedRunPicker
            onSelect={(workout) => {
              setSelectedWorkout(workout);
              setShowGuidedPicker(false);
            }}
            onClose={() => setShowGuidedPicker(false)}
          />
        )}
      </SafeAreaView>
    );
  }

  // Summary state
  if (state === "summary") {
    return (
      <RunSummaryModal
        visible={true}
        data={summaryData}
        run={summaryRun}
        allRuns={runs}
        autoPost={autoPost}
        onAutoPostChange={setAutoPost}
        onSave={handleSaveRun}
        onDiscard={handleDiscardRun}
      />
    );
  }

  // Running / Paused state
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

        {/* Guided Run Overlay */}
        {runMode === "guided" && selectedWorkout && (
          <GuidedRunOverlay
            workout={selectedWorkout}
            guidedState={guidedState}
          />
        )}

        {/* Live Map */}
        {location.route.length > 1 ? (
          <View className="mb-4">
            <RunMapView route={location.route} height={180} />
          </View>
        ) : (
          <Card className="mb-4 h-44 items-center justify-center">
            <Navigation size={32} color="#FF6B6B" />
            <Text className="mt-2 text-sm text-gray-400">
              {`Tracking · ${location.route.length} GPS points`}
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
