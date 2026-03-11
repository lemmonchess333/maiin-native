import { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
} from "react-native";
import Animated, { FadeIn, FadeInDown, SlideInUp } from "react-native-reanimated";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  X,
  Check,
  Play,
  RotateCcw,
  Dumbbell,
  Trophy,
  Plus,
  ChevronRight,
} from "lucide-react-native";
import { useProgram } from "@/hooks/useProgram";
import { applyProgression } from "@/lib/programEngine";
import { WorkoutTimer } from "@/components/WorkoutTimer";
import { WorkoutSummaryModal, type WorkoutSummary } from "@/components/WorkoutSummaryModal";
import { PRCelebration } from "@/components/PRCelebration";
import * as haptics from "@/lib/haptics";
import type { ProgramExercise, Goal } from "@/lib/programTypes";

type SetType = "working" | "warmup" | "dropset" | "failure";

const SET_TYPE_ORDER: SetType[] = ["working", "warmup", "dropset", "failure"];
const SET_TYPE_LABELS: Record<SetType, string> = {
  working: "W",
  warmup: "W",
  dropset: "D",
  failure: "F",
};
const SET_TYPE_COLORS: Record<SetType, string> = {
  working: "#FFFFFF",
  warmup: "#f59e0b",
  dropset: "#8b5cf6",
  failure: "#FF6B6B",
};

interface SetLog {
  reps: number;
  weight: number;
  completed: boolean;
  type: SetType;
  rpe?: number;
}

export default function WorkoutSessionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ dayIndex: string }>();
  const dayIndex = Number(params.dayIndex ?? 0);
  const { state, saveProgramState, markDayCompleted } = useProgram();

  const day = state?.workouts[dayIndex];

  const [currentExIndex, setCurrentExIndex] = useState(0);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [setLogs, setSetLogs] = useState<SetLog[][]>([]);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [showPR, setShowPR] = useState(false);
  const [prInfo, setPrInfo] = useState<{ exercise: string; weight: number }>({ exercise: "", weight: 0 });
  const [showSummary, setShowSummary] = useState(false);
  const startTimeRef = useRef(Date.now());

  // Rest timer state
  const [restSeconds, setRestSeconds] = useState(0);
  const [restTarget, setRestTarget] = useState(90);
  const [isResting, setIsResting] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const chimeFiredRef = useRef(false);

  // Undo
  const [lastCompleted, setLastCompleted] = useState<{ exIdx: number; setIdx: number } | null>(null);
  const undoTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialize set logs
  useEffect(() => {
    if (day) {
      setSetLogs(
        day.exercises.map((ex) =>
          Array.from({ length: ex.sets }, () => ({
            reps: ex.reps,
            weight: ex.weight,
            completed: false,
            type: "working" as SetType,
          })),
        ),
      );
    }
  }, [day?.dayName]);

  if (!state || !day || setLogs.length === 0) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-[#0F0F14]">
        <Text className="text-gray-400">No workout data</Text>
      </SafeAreaView>
    );
  }

  const currentExercise = day.exercises[currentExIndex];
  const currentSets = setLogs[currentExIndex] ?? [];
  const completedSetsInExercise = currentSets.filter((s) => s.completed).length;
  const totalSetsCompleted = setLogs.flat().filter((s) => s.completed).length;
  const totalSetsTotal = setLogs.flat().length;
  const progressPct = totalSetsTotal > 0 ? (totalSetsCompleted / totalSetsTotal) * 100 : 0;

  // Rest timer
  const startRest = () => {
    setRestSeconds(0);
    setIsResting(true);
    chimeFiredRef.current = false;
    haptics.lightTap();
  };

  const stopRest = () => {
    setIsResting(false);
    setRestSeconds(0);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // Timer tick
  useEffect(() => {
    if (isResting) {
      timerRef.current = setInterval(() => {
        setRestSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isResting]);

  // Timer done notification
  useEffect(() => {
    if (isResting && restSeconds >= restTarget && !chimeFiredRef.current) {
      chimeFiredRef.current = true;
      haptics.success();
    }
  }, [isResting, restSeconds, restTarget]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, "0")}`;
  };

  const updateSetLog = (exIdx: number, setIdx: number, field: "reps" | "weight", value: number) => {
    setSetLogs((prev) => {
      const updated = prev.map((sets) => sets.map((s) => ({ ...s })));
      updated[exIdx][setIdx][field] = value;
      return updated;
    });
  };

  const cycleSetType = (exIdx: number, setIdx: number) => {
    setSetLogs((prev) => {
      const updated = prev.map((sets) => sets.map((s) => ({ ...s })));
      const current = updated[exIdx][setIdx].type;
      const idx = SET_TYPE_ORDER.indexOf(current);
      updated[exIdx][setIdx].type = SET_TYPE_ORDER[(idx + 1) % SET_TYPE_ORDER.length];
      return updated;
    });
  };

  const addSet = (exIdx: number) => {
    setSetLogs((prev) => {
      const updated = prev.map((sets) => sets.map((s) => ({ ...s })));
      const last = updated[exIdx][updated[exIdx].length - 1];
      updated[exIdx].push({
        reps: last?.reps ?? day.exercises[exIdx].reps,
        weight: last?.weight ?? day.exercises[exIdx].weight,
        completed: false,
        type: "working",
      });
      return updated;
    });
  };

  const completeSet = async () => {
    const set = currentSets[currentSetIndex];
    if (!set) return;

    setSetLogs((prev) => {
      const updated = prev.map((sets) => sets.map((s) => ({ ...s })));
      updated[currentExIndex][currentSetIndex].completed = true;
      return updated;
    });

    haptics.mediumTap();

    // Track for undo
    if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
    setLastCompleted({ exIdx: currentExIndex, setIdx: currentSetIndex });
    undoTimeoutRef.current = setTimeout(() => setLastCompleted(null), 4000);

    // Check for PR
    const ex = day.exercises[currentExIndex];
    if (set.weight > (ex.lastSuccessfulWeight ?? 0) && set.reps >= ex.reps) {
      setPrInfo({ exercise: ex.name, weight: set.weight });
      setShowPR(true);
    }

    const isLastSet = currentSetIndex >= currentSets.length - 1;
    const isLastExercise = currentExIndex >= day.exercises.length - 1;

    if (isLastSet) {
      // Apply progression for this exercise
      if (state.settings?.autoProgression !== false) {
        const updatedEx = applyProgression(
          ex,
          set.reps,
          set.weight,
          state.goal,
          state.settings?.microloading ?? true,
        );
        const workouts = state.workouts.map((d, di) =>
          di === dayIndex
            ? {
                ...d,
                exercises: d.exercises.map((e, ei) =>
                  ei === currentExIndex ? updatedEx : e,
                ),
              }
            : d,
        );
        await saveProgramState({ ...state, workouts, updatedAt: Date.now() });
      }

      if (isLastExercise) {
        setSessionComplete(true);
      } else {
        setCurrentExIndex((prev) => prev + 1);
        setCurrentSetIndex(0);
        startRest();
      }
    } else {
      setCurrentSetIndex((prev) => prev + 1);
      startRest();
    }
  };

  const handleUndo = () => {
    if (!lastCompleted) return;
    const { exIdx, setIdx } = lastCompleted;
    setSetLogs((prev) => {
      const updated = prev.map((sets) => sets.map((s) => ({ ...s })));
      updated[exIdx][setIdx].completed = false;
      return updated;
    });
    setCurrentExIndex(exIdx);
    setCurrentSetIndex(setIdx);
    stopRest();
    if (sessionComplete) setSessionComplete(false);
    setLastCompleted(null);
    if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
  };

  const handleFinish = async () => {
    setCompleting(true);
    await markDayCompleted(dayIndex);
    setCompleting(false);

    const durationMinutes = Math.round((Date.now() - startTimeRef.current) / 60000);
    const totalVolume = setLogs.flat()
      .filter((s) => s.completed)
      .reduce((sum, s) => sum + s.weight * s.reps, 0);

    setShowSummary(true);
  };

  const getSummary = (): WorkoutSummary => {
    const durationMinutes = Math.round((Date.now() - startTimeRef.current) / 60000);
    const totalVolume = setLogs.flat()
      .filter((s) => s.completed)
      .reduce((sum, s) => sum + s.weight * s.reps, 0);
    return {
      name: day.dayName,
      exerciseCount: day.exercises.length,
      totalSets: totalSetsCompleted,
      totalVolume,
      durationMinutes,
      newPRs: 0,
    };
  };

  // Session complete view
  if (sessionComplete && !showSummary) {
    return (
      <SafeAreaView className="flex-1 bg-[#0F0F14]">
        <Animated.View
          entering={FadeIn.duration(300)}
          className="flex-1 items-center justify-center px-6"
        >
          <Trophy size={64} color="#f59e0b" />
          <Text className="mt-4 text-2xl font-bold text-white">
            Workout Complete!
          </Text>
          <Text className="mt-1 text-sm text-gray-400">{day.dayName}</Text>
          <Text className="mt-1 text-sm text-gray-500">
            {totalSetsCompleted} sets across {day.exercises.length} exercises
          </Text>

          <TouchableOpacity
            className="mt-8 w-full rounded-xl bg-brand py-4"
            onPress={handleFinish}
            disabled={completing}
          >
            <Text className="text-center text-base font-bold text-white">
              {completing ? "Saving..." : "Mark Day Complete"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="mt-3 py-2"
            onPress={() => router.back()}
          >
            <Text className="text-sm text-gray-500">Close without saving</Text>
          </TouchableOpacity>
        </Animated.View>

        <WorkoutSummaryModal
          visible={showSummary}
          summary={getSummary()}
          onClose={() => {
            setShowSummary(false);
            router.back();
          }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#0F0F14]">
      {/* Top bar */}
      <View className="flex-row items-center justify-between border-b border-[#2A2A3A] px-4 py-3">
        <View>
          <Text className="text-sm font-semibold text-white">{day.dayName}</Text>
          <Text className="text-[11px] text-gray-500">
            {totalSetsCompleted}/{totalSetsTotal} sets
          </Text>
        </View>
        <View className="flex-row items-center gap-3">
          <WorkoutTimer active />
          <TouchableOpacity className="p-2" onPress={() => router.back()}>
            <X size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Progress bar */}
      <View className="h-1 bg-[#1A1A24]">
        <View
          className="h-full bg-brand"
          style={{ width: `${progressPct}%` }}
        />
      </View>

      {/* Exercise nav pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12, gap: 6 }}
      >
        {day.exercises.map((ex, i) => {
          const setsForEx = setLogs[i] ?? [];
          const done = setsForEx.every((s) => s.completed);
          const active = i === currentExIndex;
          return (
            <TouchableOpacity
              key={i}
              className={`rounded-lg px-3 py-1.5 ${
                done
                  ? "bg-success/20"
                  : active
                    ? "bg-brand"
                    : "bg-[#1A1A24]"
              }`}
              onPress={() => {
                setCurrentExIndex(i);
                const nextIncomplete = setsForEx.findIndex((s) => !s.completed);
                setCurrentSetIndex(nextIncomplete >= 0 ? nextIncomplete : 0);
              }}
            >
              <Text
                className={`text-[11px] font-medium ${
                  done ? "text-success" : active ? "text-white" : "text-gray-400"
                }`}
              >
                {ex.name.length > 15 ? ex.name.slice(0, 15) + "…" : ex.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Current exercise header */}
        <View className="items-center py-3">
          <View className="flex-row items-center">
            <Dumbbell size={18} color="#8b5cf6" />
            <Text className="ml-2 text-lg font-bold text-white">
              {currentExercise?.name}
            </Text>
          </View>
          <Text className="mt-1 text-xs text-gray-500">
            Set {currentSetIndex + 1} of {currentSets.length} · {completedSetsInExercise} done
          </Text>
          {currentExercise?.lastPerformance && (
            <View className="mt-2 flex-row items-center rounded-full bg-brand/15 px-3 py-1">
              <ChevronRight size={12} color="#8b5cf6" />
              <Text className="ml-1 text-[11px] font-medium text-brand">
                Last: {currentExercise.lastPerformance.sets}×
                {currentExercise.lastPerformance.reps}
                {currentExercise.lastPerformance.weight > 0 &&
                  ` @ ${currentExercise.lastPerformance.weight}kg`}
              </Text>
            </View>
          )}
        </View>

        {/* Rest timer */}
        {isResting && (
          <Animated.View
            entering={FadeInDown.duration(200)}
            className="mb-4 items-center rounded-2xl bg-[#1A1A24] p-4"
          >
            <Text
              className={`text-4xl font-bold ${
                restSeconds >= restTarget ? "text-success" : "text-white"
              }`}
            >
              {restSeconds >= restTarget ? "GO!" : formatTime(restSeconds)}
            </Text>
            <Text className="mt-1 text-xs text-gray-500">
              / {formatTime(restTarget)}
            </Text>
            <View className="mt-3 flex-row items-center gap-2">
              <TouchableOpacity
                className="flex-row items-center rounded-lg bg-[#0F0F14] px-3 py-1.5"
                onPress={stopRest}
              >
                <RotateCcw size={12} color="#FFFFFF" />
                <Text className="ml-1 text-xs font-medium text-white">Skip</Text>
              </TouchableOpacity>
              {[60, 90, 120, 180].map((t) => (
                <TouchableOpacity
                  key={t}
                  className={`rounded px-2 py-1 ${
                    restTarget === t ? "bg-teal" : "bg-[#0F0F14]"
                  }`}
                  onPress={() => setRestTarget(t)}
                >
                  <Text
                    className={`text-[10px] font-medium ${
                      restTarget === t ? "text-white" : "text-gray-400"
                    }`}
                  >
                    {t}s
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        )}

        {/* Set logging */}
        <View className="rounded-2xl bg-[#1A1A24] overflow-hidden">
          {/* Header */}
          <View className="flex-row border-b border-[#2A2A3A] px-4 py-2.5">
            <Text className="w-12 text-[10px] font-medium uppercase text-gray-500">Set</Text>
            <Text className="flex-1 text-center text-[10px] font-medium uppercase text-gray-500">
              Weight (kg)
            </Text>
            <Text className="flex-1 text-center text-[10px] font-medium uppercase text-gray-500">
              Reps
            </Text>
            <Text className="w-12 text-center text-[10px] font-medium uppercase text-gray-500">
              Done
            </Text>
          </View>

          {currentSets.map((set, setIdx) => (
            <View
              key={setIdx}
              className={`flex-row items-center border-b border-[#2A2A3A]/50 px-4 py-2.5 ${
                setIdx === currentSetIndex && !set.completed ? "bg-brand/5" : ""
              } ${set.completed ? "opacity-50" : ""}`}
            >
              <TouchableOpacity
                className="h-7 w-7 items-center justify-center rounded-full"
                onPress={() => cycleSetType(currentExIndex, setIdx)}
                disabled={set.completed}
                style={
                  set.type !== "working"
                    ? { borderWidth: 1, borderColor: SET_TYPE_COLORS[set.type] }
                    : undefined
                }
              >
                <Text
                  className="text-xs font-bold"
                  style={{ color: SET_TYPE_COLORS[set.type] }}
                >
                  {set.type === "working" ? setIdx + 1 : SET_TYPE_LABELS[set.type]}
                </Text>
              </TouchableOpacity>

              <View className="flex-1 px-2">
                <TextInput
                  className="h-9 rounded-lg bg-[#0F0F14] text-center text-sm text-white"
                  keyboardType="numeric"
                  value={set.weight ? String(set.weight) : ""}
                  onChangeText={(v) =>
                    updateSetLog(currentExIndex, setIdx, "weight", Number(v) || 0)
                  }
                  editable={!set.completed}
                />
              </View>

              <View className="flex-1 px-2">
                <TextInput
                  className="h-9 rounded-lg bg-[#0F0F14] text-center text-sm text-white"
                  keyboardType="numeric"
                  value={set.reps ? String(set.reps) : ""}
                  onChangeText={(v) =>
                    updateSetLog(currentExIndex, setIdx, "reps", Number(v) || 0)
                  }
                  editable={!set.completed}
                />
              </View>

              <View className="w-12 items-center">
                {set.completed ? (
                  <Check size={18} color="#34d399" />
                ) : (
                  <View className="h-5 w-5 rounded-full border-2 border-[#2A2A3A]" />
                )}
              </View>
            </View>
          ))}

          {/* Add Set */}
          <TouchableOpacity
            className="border-t border-[#2A2A3A]/50 py-2.5"
            onPress={() => addSet(currentExIndex)}
          >
            <View className="flex-row items-center justify-center">
              <Plus size={12} color="#6B7280" />
              <Text className="ml-1 text-xs text-gray-500">Add Set</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Undo */}
        {lastCompleted && (
          <Animated.View entering={FadeInDown.duration(200)}>
            <TouchableOpacity
              className="mt-3 flex-row items-center justify-center rounded-xl bg-warning/15 py-2.5"
              onPress={handleUndo}
            >
              <RotateCcw size={14} color="#f59e0b" />
              <Text className="ml-2 text-xs font-medium text-warning">
                Undo last set
              </Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Prescription hint */}
        {currentExercise && (
          <Text className="mt-3 text-center text-xs text-gray-500">
            Target: {currentExercise.sets}×{currentExercise.reps} @{" "}
            {currentExercise.weight > 0 ? `${currentExercise.weight}kg` : "bodyweight"}
          </Text>
        )}
      </ScrollView>

      {/* Bottom action */}
      <View className="border-t border-[#2A2A3A] bg-[#0F0F14] px-4 py-3">
        {isResting ? (
          <TouchableOpacity
            className="flex-row items-center justify-center rounded-xl bg-brand py-3.5"
            onPress={stopRest}
          >
            <Play size={16} color="#FFFFFF" />
            <Text className="ml-2 text-sm font-bold text-white">
              Ready — Start Next Set
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            className="flex-row items-center justify-center rounded-xl bg-brand py-3.5"
            onPress={completeSet}
            disabled={!currentSets[currentSetIndex] || currentSets[currentSetIndex]?.completed}
          >
            <Check size={16} color="#FFFFFF" />
            <Text className="ml-2 text-sm font-bold text-white">
              {currentSetIndex >= currentSets.length - 1 &&
              currentExIndex >= day.exercises.length - 1
                ? "Finish Last Set"
                : currentSetIndex >= currentSets.length - 1
                  ? "Complete Exercise"
                  : `Complete Set ${currentSetIndex + 1}`}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* PR Celebration */}
      <PRCelebration
        visible={showPR}
        exercise={prInfo.exercise}
        weight={prInfo.weight}
        onDone={() => setShowPR(false)}
      />

      {/* Summary modal */}
      <WorkoutSummaryModal
        visible={showSummary}
        summary={getSummary()}
        onClose={() => {
          setShowSummary(false);
          router.back();
        }}
      />
    </SafeAreaView>
  );
}
