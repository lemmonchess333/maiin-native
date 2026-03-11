import { useState, useMemo } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInRight, FadeOutLeft } from "react-native-reanimated";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { calculateTDEE } from "@/lib/tdee";
import type { FitnessGoal } from "@/lib/tdee";
import { generateSchedule, DAY_LABELS } from "@/lib/scheduleUtils";
import type { DayType } from "@/lib/scheduleUtils";
import { Button } from "@/components/Button";
import * as haptics from "@/lib/haptics";
import { Dumbbell, Route, ChevronRight, Check, Calendar } from "lucide-react-native";

const DAY_TYPE_STYLES: Record<DayType, { label: string; color: string }> = {
  lift: { label: "Lift", color: "#8b5cf6" },
  run:  { label: "Run",  color: "#FF6B6B" },
  both: { label: "Both", color: "#8b5cf6" },
  rest: { label: "Rest", color: "rgba(255,255,255,0.2)" },
};

function nextType(t: DayType): DayType {
  if (t === "lift") return "run";
  if (t === "run") return "both";
  if (t === "both") return "rest";
  return "lift";
}

type RunMode = "freeform" | "structured" | "race_prep";
type RaceDistance = "5k" | "10k" | "half" | "marathon";

function Stepper({ label, value, onDec, onInc, color, min }: {
  label: string; value: number; onDec: () => void; onInc: () => void; color: string; min?: number;
}) {
  return (
    <View className="flex-row items-center justify-between rounded-xl px-4 py-3" style={{ backgroundColor: color + "15", borderWidth: 1, borderColor: color + "30" }}>
      <Text className="text-xs font-medium text-white">{label}</Text>
      <View className="flex-row items-center gap-3">
        <TouchableOpacity onPress={onDec} className="h-8 w-8 items-center justify-center rounded-full bg-white/10">
          <Text className="text-lg font-bold text-white">−</Text>
        </TouchableOpacity>
        <Text className="w-8 text-center text-xl font-bold" style={{ color }}>{value}</Text>
        <TouchableOpacity onPress={onInc} className="h-8 w-8 items-center justify-center rounded-full bg-white/10">
          <Text className="text-lg font-bold text-white">+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function OnboardingScreen() {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  // Step 0 — Name
  const [name, setName] = useState("");

  // Step 1 — Schedule
  const [liftDays, setLiftDays] = useState(3);
  const [runDays, setRunDays] = useState(2);
  const schedule = useMemo(() => generateSchedule(liftDays, runDays), [liftDays, runDays]);
  const [customSchedule, setCustomSchedule] = useState<ReturnType<typeof generateSchedule> | null>(null);
  const activeSchedule = customSchedule ?? schedule;
  const [mealsTarget, setMealsTarget] = useState(10);

  // Step 2 — Run preferences
  const [runMode, setRunMode] = useState<RunMode>("freeform");
  const [raceDistance, setRaceDistance] = useState<RaceDistance>("10k");
  const [raceDate, setRaceDate] = useState("");

  // Step 3 — Targets
  const [sex, setSex] = useState<"male" | "female">("male");
  const [weightKg, setWeightKg] = useState(75);
  const [heightCm, setHeightCm] = useState(175);
  const [age, setAge] = useState(28);
  const [selectedGoal, setSelectedGoal] = useState<"cut" | "lean bulk" | "recomp">("recomp");

  const tdee = useMemo(
    () => calculateTDEE(weightKg, heightCm, age, "moderate", selectedGoal as FitnessGoal, sex),
    [weightKg, heightCm, age, selectedGoal, sex]
  );

  const showRunStep = runDays > 0;
  const totalSteps = showRunStep ? 4 : 3;
  const runStepIndex = showRunStep ? 2 : -1;
  const targetsStepIndex = showRunStep ? 3 : 2;

  const STEP_TITLES = [
    { title: "What's your name?", subtitle: "You'll see this on your home screen" },
    { title: "Build your week", subtitle: "Tap each day to set your training type" },
    ...(showRunStep ? [{ title: "Run preferences", subtitle: "How do you want to schedule your runs?" }] : []),
    { title: "Your targets", subtitle: "We'll calculate calories and macros from this" },
  ];

  const canAdvance = [
    name.trim().length >= 2,
    true,
    ...(showRunStep ? [runMode !== "race_prep" || raceDate !== ""] : []),
    weightKg > 0 && heightCm > 0 && age > 0,
  ];

  const handleFinish = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const data: Record<string, unknown> = {
        displayName: name.trim(),
        sex,
        age,
        weightKg,
        heightCm,
        weeklyWorkoutsTarget: liftDays,
        weeklyRunsTarget: runDays,
        weeklyMealsTarget: mealsTarget,
        weekSchedule: activeSchedule,
        onboardingComplete: true,
        runMode,
        tdeeBase: tdee.targetCalories,
        aiCalorieAdjustment: 0,
        targetCalories: tdee.targetCalories,
        targetProtein: tdee.protein,
        targetCarbs: tdee.carbs,
        targetFat: tdee.fat,
        macroTargets: {
          calories: tdee.targetCalories,
          protein: tdee.protein,
          carbs: tdee.carbs,
          fat: tdee.fat,
        },
        program: {
          goal: selectedGoal,
          startWeight: weightKg,
          currentPhase: "base",
        },
      };

      if (runMode === "structured") {
        data.weeklyRunDaysTarget = runDays;
      }
      if (runMode === "race_prep" && raceDate) {
        data.raceGoal = { distance: raceDistance, targetDate: raceDate };
        data.weeklyRunDaysTarget = runDays;
      }

      await setDoc(doc(db, "users", user.uid), data, { merge: true });
      haptics.success();
    } catch (err: any) {
      Alert.alert("Error", err.message ?? "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const goNext = () => {
    if (step < totalSteps - 1) {
      haptics.selection();
      setStep((s) => s + 1);
    } else {
      handleFinish();
    }
  };

  const goBack = () => {
    haptics.lightTap();
    setStep((s) => Math.max(0, s - 1));
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {/* Progress bar */}
        <View className="mb-8 mt-6 flex-row gap-1.5">
          {STEP_TITLES.map((_, i) => (
            <View key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-white/10">
              <View
                className="h-full rounded-full bg-teal"
                style={{ width: i <= step ? "100%" : "0%" }}
              />
            </View>
          ))}
        </View>

        {/* Header */}
        <Animated.View key={step} entering={FadeInRight.duration(200)} exiting={FadeOutLeft.duration(200)}>
          <Text className="mb-1 text-[10px] uppercase tracking-widest text-gray-500">
            Step {step + 1} of {totalSteps}
          </Text>
          <Text className="mb-1 text-2xl font-bold text-white">{STEP_TITLES[step].title}</Text>
          <Text className="mb-6 text-sm text-gray-400">{STEP_TITLES[step].subtitle}</Text>
        </Animated.View>

        {/* Step 0: Name */}
        {step === 0 && (
          <TextInput
            autoFocus
            className="h-14 rounded-2xl border border-[#2A2A3A] bg-[#1A1A24] px-5 text-xl font-medium text-white"
            placeholder="Enter your name"
            placeholderTextColor="#6B7280"
            value={name}
            onChangeText={setName}
          />
        )}

        {/* Step 1: Schedule */}
        {step === 1 && (
          <View className="gap-4">
            <View className="flex-row gap-3">
              <View className="flex-1">
                <Stepper
                  label="Lift days"
                  value={liftDays}
                  color="#8b5cf6"
                  onDec={() => setLiftDays((v) => Math.max(0, v - 1))}
                  onInc={() => setLiftDays((v) => Math.min(7 - runDays, v + 1))}
                />
              </View>
              <View className="flex-1">
                <Stepper
                  label="Run days"
                  value={runDays}
                  color="#FF6B6B"
                  onDec={() => setRunDays((v) => Math.max(0, v - 1))}
                  onInc={() => setRunDays((v) => Math.min(7 - liftDays, v + 1))}
                />
              </View>
            </View>

            {/* Meals target */}
            <Stepper
              label="Meals to log / week"
              value={mealsTarget}
              color="#34d399"
              onDec={() => setMealsTarget((v) => Math.max(3, v - 1))}
              onInc={() => setMealsTarget((v) => Math.min(28, v + 1))}
            />

            {/* 7-day schedule */}
            <View>
              <Text className="mb-2 text-[10px] uppercase tracking-widest text-gray-500">
                Tap to change day type
              </Text>
              <View className="flex-row gap-1.5">
                {activeSchedule.map((day, i) => {
                  const style = DAY_TYPE_STYLES[day.type];
                  return (
                    <TouchableOpacity
                      key={i}
                      className="flex-1 items-center gap-1.5 rounded-xl py-3"
                      style={{ backgroundColor: style.color + "18", borderWidth: 1, borderColor: style.color + "35" }}
                      onPress={() => {
                        haptics.selection();
                        const next = nextType(day.type);
                        const updated = (customSchedule ?? schedule).map((d, idx) =>
                          idx === i ? { ...d, type: next } : d
                        );
                        setCustomSchedule(updated);
                      }}
                    >
                      <Text className="text-[9px] uppercase text-gray-500">
                        {DAY_LABELS[i].charAt(0)}
                      </Text>
                      <View className="h-2 w-2 rounded-full" style={{ backgroundColor: style.color }} />
                      <Text className="text-[8px] font-medium" style={{ color: style.color }}>
                        {style.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              {/* Legend */}
              <View className="mt-3 flex-row items-center justify-center gap-4">
                {(["lift", "run", "both", "rest"] as DayType[]).map((t) => (
                  <View key={t} className="flex-row items-center gap-1.5">
                    <View className="h-2 w-2 rounded-full" style={{ backgroundColor: DAY_TYPE_STYLES[t].color }} />
                    <Text className="text-[9px] capitalize text-gray-500">{t}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Step 2: Run Preferences */}
        {step === runStepIndex && (
          <View className="gap-3">
            {([
              { id: "freeform" as RunMode, label: "Freeform", desc: "Pick any run type when you start" },
              { id: "structured" as RunMode, label: "Structured", desc: "Auto-assigns run templates around lift days" },
              { id: "race_prep" as RunMode, label: "Race Prep", desc: "Periodized plan for a goal race" },
            ]).map((m) => (
              <TouchableOpacity
                key={m.id}
                className="flex-row items-center gap-3 rounded-2xl p-4"
                style={{
                  backgroundColor: runMode === m.id ? "#FF6B6B18" : "rgba(255,255,255,0.05)",
                  borderWidth: 1,
                  borderColor: runMode === m.id ? "#FF6B6B50" : "rgba(255,255,255,0.08)",
                }}
                onPress={() => { haptics.selection(); setRunMode(m.id); }}
              >
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-white">{m.label}</Text>
                  <Text className="text-[11px] text-gray-500">{m.desc}</Text>
                </View>
                {runMode === m.id && <Check size={16} color="#FF6B6B" />}
              </TouchableOpacity>
            ))}

            {runMode === "race_prep" && (
              <View className="mt-2 gap-3">
                <Text className="text-[10px] uppercase tracking-widest text-gray-500">Race distance</Text>
                <View className="flex-row gap-2">
                  {([
                    { id: "5k" as RaceDistance, label: "5K" },
                    { id: "10k" as RaceDistance, label: "10K" },
                    { id: "half" as RaceDistance, label: "Half" },
                    { id: "marathon" as RaceDistance, label: "Marathon" },
                  ]).map((d) => (
                    <TouchableOpacity
                      key={d.id}
                      className="flex-1 items-center rounded-xl py-3"
                      style={{
                        backgroundColor: raceDistance === d.id ? "#FF6B6B" : "rgba(255,255,255,0.08)",
                      }}
                      onPress={() => { haptics.selection(); setRaceDistance(d.id); }}
                    >
                      <Text className={`text-sm font-semibold ${raceDistance === d.id ? "text-white" : "text-gray-400"}`}>
                        {d.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text className="text-[10px] uppercase tracking-widest text-gray-500">Race date</Text>
                <TextInput
                  className="h-12 rounded-xl border border-[#2A2A3A] bg-[#1A1A24] px-4 text-sm text-white"
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#6B7280"
                  value={raceDate}
                  onChangeText={setRaceDate}
                />
              </View>
            )}
          </View>
        )}

        {/* Step 3: Targets */}
        {step === targetsStepIndex && (
          <View className="gap-4">
            {/* Sex selector */}
            <View className="flex-row gap-2">
              {([
                { id: "male" as const, label: "Male" },
                { id: "female" as const, label: "Female" },
              ]).map((s) => (
                <TouchableOpacity
                  key={s.id}
                  className="flex-1 items-center rounded-2xl py-3"
                  style={{
                    backgroundColor: sex === s.id ? "#2dd4bf20" : "rgba(255,255,255,0.06)",
                    borderWidth: 1,
                    borderColor: sex === s.id ? "#2dd4bf50" : "rgba(255,255,255,0.1)",
                  }}
                  onPress={() => { haptics.selection(); setSex(s.id); }}
                >
                  <Text className="text-sm font-semibold" style={{ color: sex === s.id ? "#2dd4bf" : "rgba(255,255,255,0.5)" }}>
                    {s.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Body stats */}
            <View className="flex-row gap-3">
              {[
                { label: "Age", value: age, setter: setAge, min: 13, max: 99, unit: "yrs" },
                { label: "Weight", value: weightKg, setter: setWeightKg, min: 30, max: 250, unit: "kg" },
                { label: "Height", value: heightCm, setter: setHeightCm, min: 100, max: 250, unit: "cm" },
              ].map(({ label, value, setter, min, max, unit }) => (
                <View key={label} className="flex-1 items-center rounded-2xl p-3" style={{ backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" }}>
                  <Text className="mb-2 text-[9px] uppercase tracking-widest text-gray-500">{label}</Text>
                  <View className="flex-row items-center gap-2">
                    <TouchableOpacity
                      className="h-7 w-7 items-center justify-center rounded-full bg-white/10"
                      onPress={() => { haptics.lightTap(); setter((v: number) => Math.max(min, v - 1)); }}
                    >
                      <Text className="text-sm font-bold text-white">−</Text>
                    </TouchableOpacity>
                    <Text className="w-10 text-center text-lg font-bold text-white">{value}</Text>
                    <TouchableOpacity
                      className="h-7 w-7 items-center justify-center rounded-full bg-white/10"
                      onPress={() => { haptics.lightTap(); setter((v: number) => Math.min(max, v + 1)); }}
                    >
                      <Text className="text-sm font-bold text-white">+</Text>
                    </TouchableOpacity>
                  </View>
                  <Text className="mt-1 text-[9px] text-gray-600">{unit}</Text>
                </View>
              ))}
            </View>

            {/* Goal selector */}
            <View className="gap-2">
              {[
                { id: "cut" as const, label: "Lose fat", desc: "Calorie deficit, preserve muscle" },
                { id: "lean bulk" as const, label: "Build muscle", desc: "Slight surplus, lean gains" },
                { id: "recomp" as const, label: "Recomp", desc: "Maintain weight, improve fitness" },
              ].map((g) => (
                <TouchableOpacity
                  key={g.id}
                  className="flex-row items-center gap-3 rounded-2xl p-4"
                  style={{
                    backgroundColor: selectedGoal === g.id ? "#2dd4bf18" : "rgba(255,255,255,0.05)",
                    borderWidth: 1,
                    borderColor: selectedGoal === g.id ? "#2dd4bf50" : "rgba(255,255,255,0.08)",
                  }}
                  onPress={() => { haptics.selection(); setSelectedGoal(g.id); }}
                >
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-white">{g.label}</Text>
                    <Text className="text-[11px] text-gray-500">{g.desc}</Text>
                  </View>
                  {selectedGoal === g.id && <Check size={16} color="#2dd4bf" />}
                </TouchableOpacity>
              ))}
            </View>

            {/* TDEE preview */}
            <View className="rounded-2xl p-4" style={{ backgroundColor: "#2dd4bf10", borderWidth: 1, borderColor: "#2dd4bf25" }}>
              <Text className="mb-3 text-[9px] uppercase tracking-widest text-gray-500">
                Your daily targets
              </Text>
              <View className="flex-row justify-between">
                {[
                  { label: "Calories", value: String(tdee.targetCalories), color: "#f59e0b" },
                  { label: "Protein", value: `${tdee.protein}g`, color: "#2dd4bf" },
                  { label: "Carbs", value: `${tdee.carbs}g`, color: "#8b5cf6" },
                  { label: "Fat", value: `${tdee.fat}g`, color: "#f97316" },
                ].map((t) => (
                  <View key={t.label} className="items-center">
                    <Text className="text-base font-bold" style={{ color: t.color }}>{t.value}</Text>
                    <Text className="mt-0.5 text-[8px] text-gray-600">{t.label}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        <View className="h-8" />
      </ScrollView>

      {/* Navigation */}
      <View className="flex-row items-center gap-3 px-5 pb-4">
        {step > 0 && (
          <TouchableOpacity
            className="rounded-2xl bg-white/10 px-5 py-3.5"
            onPress={goBack}
          >
            <Text className="text-sm font-medium text-gray-300">Back</Text>
          </TouchableOpacity>
        )}
        <View className="flex-1">
          <Button
            title={step === totalSteps - 1 ? (saving ? "Setting up..." : `Let's go, ${name.split(" ")[0]}`) : "Continue"}
            onPress={goNext}
            loading={saving}
            disabled={!canAdvance[step]}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
