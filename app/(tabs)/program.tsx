import { useState, useCallback, useRef, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import {
  ChevronRight,
  CheckCircle,
  Dumbbell,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  RotateCcw,
  Settings2,
} from "lucide-react-native";
import { useProgram } from "@/hooks/useProgram";
import { splitLabel } from "@/lib/programEngine";
import { getProgressionDirection, getProgressionLabel } from "@/lib/programEngine";
import { generateWeekPrescription } from "@/lib/programEngine";
import { CustomDayBuilder } from "@/components/CustomDayBuilder";
import type { WorkoutDay, ProgramExercise, Goal } from "@/lib/programTypes";
import * as haptics from "@/lib/haptics";

const GOALS: { value: Goal; label: string }[] = [
  { value: "recomp", label: "Recomp" },
  { value: "lean bulk", label: "Lean Bulk" },
  { value: "cut", label: "Cut" },
];

function ProgressionIcon({ direction }: { direction: "up" | "down" | "stable" }) {
  if (direction === "up") return <ArrowUpRight size={12} color="#34d399" />;
  if (direction === "down") return <ArrowDownRight size={12} color="#FF6B6B" />;
  return <Minus size={12} color="#6B7280" />;
}

export default function ProgramScreen() {
  const { state, loading, initializeProgram, markDayCompleted, updateWorkouts } =
    useProgram();
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [editingDay, setEditingDay] = useState<number | null>(null);
  const [setupGoal, setSetupGoal] = useState<Goal>("recomp");
  const [setupDays, setSetupDays] = useState(3);
  const detailSheetRef = useRef<BottomSheet>(null);
  const detailSnapPoints = useMemo(() => ["60%", "85%"], []);

  const handleSetup = useCallback(async () => {
    haptics.success();
    await initializeProgram(setupGoal, setupDays);
  }, [setupGoal, setupDays, initializeProgram]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-[#0F0F14]">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#8b5cf6" />
        </View>
      </SafeAreaView>
    );
  }

  // Setup screen — no program yet
  if (!state) {
    return (
      <SafeAreaView className="flex-1 bg-[#0F0F14]">
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          <Text className="mb-2 text-2xl font-bold text-white">
            Build Your Program
          </Text>
          <Text className="mb-8 text-sm text-gray-400">
            We'll generate a periodized lifting program based on your goal and
            available days.
          </Text>

          {/* Goal */}
          <Text className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
            Training Goal
          </Text>
          <View className="mb-6 flex-row gap-2">
            {GOALS.map((g) => (
              <TouchableOpacity
                key={g.value}
                className={`flex-1 rounded-xl py-3 ${
                  setupGoal === g.value ? "bg-brand" : "bg-[#1A1A24]"
                }`}
                onPress={() => setSetupGoal(g.value)}
              >
                <Text
                  className={`text-center text-sm font-semibold ${
                    setupGoal === g.value ? "text-white" : "text-gray-400"
                  }`}
                >
                  {g.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Days */}
          <Text className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
            Lift Days / Week
          </Text>
          <View className="mb-8 flex-row gap-2">
            {[2, 3, 4, 5, 6].map((d) => (
              <TouchableOpacity
                key={d}
                className={`h-12 w-12 items-center justify-center rounded-xl ${
                  setupDays === d ? "bg-brand" : "bg-[#1A1A24]"
                }`}
                onPress={() => setSetupDays(d)}
              >
                <Text
                  className={`text-lg font-bold ${
                    setupDays === d ? "text-white" : "text-gray-400"
                  }`}
                >
                  {d}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            className="rounded-xl bg-brand py-4"
            onPress={handleSetup}
          >
            <Text className="text-center text-base font-bold text-white">
              Generate Program
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const prescription = generateWeekPrescription(state.weekNumber);

  return (
    <SafeAreaView className="flex-1 bg-[#0F0F14]">
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        {/* Header */}
        <View className="mb-4">
          <Text className="text-2xl font-bold text-white">Program</Text>
          <Text className="text-sm text-gray-400">
            Week {state.weekNumber} · {splitLabel(state.splitType)} ·{" "}
            {state.currentPhase === "deload" ? "Deload" : "Progression"}
          </Text>
        </View>

        {/* Phase badge */}
        {prescription.deload && (
          <Animated.View
            entering={FadeInDown.delay(100)}
            className="mb-4 rounded-xl bg-teal/10 px-4 py-3"
          >
            <View className="flex-row items-center">
              <RotateCcw size={14} color="#2dd4bf" />
              <Text className="ml-2 text-sm font-semibold text-teal">
                Deload Week
              </Text>
            </View>
            <Text className="mt-1 text-xs text-gray-400">
              Volume and intensity reduced for recovery.
            </Text>
          </Animated.View>
        )}

        {/* Workout days */}
        {state.workouts.map((day, i) => (
          <Animated.View
            key={`${day.dayName}-${i}`}
            entering={FadeInDown.delay(i * 80)}
          >
            <TouchableOpacity
              className={`mb-3 rounded-xl p-4 ${
                day.completed ? "bg-[#1A1A24]/60" : "bg-[#1A1A24]"
              }`}
              onPress={() => {
                haptics.lightTap();
                setSelectedDay(i);
                detailSheetRef.current?.snapToIndex(0);
              }}
              activeOpacity={0.7}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <View className="flex-row items-center">
                    {day.completed ? (
                      <CheckCircle size={16} color="#34d399" />
                    ) : (
                      <Dumbbell size={16} color="#8b5cf6" />
                    )}
                    <Text
                      className={`ml-2 text-base font-semibold ${
                        day.completed ? "text-gray-500" : "text-white"
                      }`}
                    >
                      {day.dayName}
                    </Text>
                    {day.isCustom && (
                      <View className="ml-2 rounded-full bg-teal/15 px-2 py-0.5">
                        <Text className="text-[10px] font-semibold text-teal">
                          custom
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text className="mt-1 text-xs text-gray-500">
                    {day.exercises.length} exercises ·{" "}
                    {day.exercises.reduce((s, ex) => s + ex.sets, 0)} sets
                  </Text>
                </View>
                <ChevronRight size={18} color="#6B7280" />
              </View>

              {/* Mini exercise preview */}
              <View className="mt-2 flex-row flex-wrap gap-1">
                {day.exercises.slice(0, 4).map((ex, j) => {
                  const dir = getProgressionDirection(ex);
                  return (
                    <View
                      key={`${ex.exerciseId}-${j}`}
                      className="flex-row items-center rounded-md bg-[#0F0F14] px-2 py-1"
                    >
                      <Text className="text-[10px] text-gray-400">
                        {ex.name.length > 15
                          ? ex.name.slice(0, 15) + "…"
                          : ex.name}
                      </Text>
                      <View className="ml-1">
                        <ProgressionIcon direction={dir} />
                      </View>
                    </View>
                  );
                })}
                {day.exercises.length > 4 && (
                  <View className="rounded-md bg-[#0F0F14] px-2 py-1">
                    <Text className="text-[10px] text-gray-400">
                      +{day.exercises.length - 4}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </ScrollView>

      {/* Day detail bottom sheet */}
      {selectedDay !== null && state.workouts[selectedDay] && (
        <BottomSheet
          ref={detailSheetRef}
          index={-1}
          snapPoints={detailSnapPoints}
          enablePanDownToClose
          onClose={() => setSelectedDay(null)}
          backgroundStyle={{ backgroundColor: "#1A1A24" }}
          handleIndicatorStyle={{ backgroundColor: "#6B7280" }}
        >
          <BottomSheetScrollView contentContainerStyle={{ padding: 20 }}>
            <DayDetail
              day={state.workouts[selectedDay]}
              dayIndex={selectedDay}
              onComplete={() => {
                haptics.success();
                markDayCompleted(selectedDay);
                detailSheetRef.current?.close();
              }}
              onEdit={() => {
                setEditingDay(selectedDay);
                detailSheetRef.current?.close();
              }}
            />
          </BottomSheetScrollView>
        </BottomSheet>
      )}

      {/* Custom day builder */}
      {editingDay !== null && state.workouts[editingDay] && (
        <CustomDayBuilder
          dayName={state.workouts[editingDay].dayName}
          initialExercises={state.workouts[editingDay].exercises}
          onSave={(exercises) => {
            const workouts = state.workouts.map((d, i) =>
              i === editingDay
                ? { ...d, exercises, isCustom: true }
                : d,
            );
            updateWorkouts(workouts);
            setEditingDay(null);
          }}
          onClose={() => setEditingDay(null)}
        />
      )}
    </SafeAreaView>
  );
}

function DayDetail({
  day,
  dayIndex,
  onComplete,
  onEdit,
}: {
  day: WorkoutDay;
  dayIndex: number;
  onComplete: () => void;
  onEdit: () => void;
}) {
  return (
    <View>
      <View className="mb-4 flex-row items-center justify-between">
        <View>
          <Text className="text-lg font-bold text-white">{day.dayName}</Text>
          <Text className="text-xs text-gray-500">
            {day.exercises.length} exercises ·{" "}
            {day.exercises.reduce((s, ex) => s + ex.sets, 0)} total sets
          </Text>
        </View>
        <TouchableOpacity
          className="h-8 w-8 items-center justify-center rounded-lg bg-[#0F0F14]"
          onPress={onEdit}
        >
          <Settings2 size={14} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {day.exercises.map((ex, i) => {
        const dir = getProgressionDirection(ex);
        const label = getProgressionLabel(ex);
        return (
          <View key={`${ex.exerciseId}-${i}`} className="mb-3 rounded-xl bg-[#0F0F14] p-3">
            <View className="flex-row items-center justify-between">
              <Text className="flex-1 text-sm font-semibold text-white">
                {ex.name}
              </Text>
              <View className="flex-row items-center">
                <ProgressionIcon direction={dir} />
                <Text className="ml-1 text-xs text-gray-400">{label}</Text>
              </View>
            </View>
            <Text className="mt-1 text-xs text-gray-500">
              {ex.sets} × {ex.reps} · {ex.progressionType}
            </Text>
            {ex.lastPerformance && (
              <Text className="mt-0.5 text-[10px] text-gray-600">
                Last: {ex.lastPerformance.sets}×{ex.lastPerformance.reps} @{" "}
                {ex.lastPerformance.weight}kg
                {ex.lastPerformance.completed ? " ✓" : " ✗"}
              </Text>
            )}
          </View>
        );
      })}

      {!day.completed && (
        <TouchableOpacity
          className="mt-4 rounded-xl bg-brand py-3.5"
          onPress={onComplete}
        >
          <Text className="text-center text-sm font-bold text-white">
            Mark Completed
          </Text>
        </TouchableOpacity>
      )}

      {day.completed && (
        <View className="mt-4 flex-row items-center justify-center rounded-xl bg-success/10 py-3">
          <CheckCircle size={16} color="#34d399" />
          <Text className="ml-2 text-sm font-semibold text-success">
            Completed
          </Text>
        </View>
      )}
    </View>
  );
}
