import { useState, useCallback, useMemo, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import {
  Plus,
  Trash2,
  GripVertical,
} from "lucide-react-native";
import { normalizeExercise, type ProgramExercise } from "@/lib/programTypes";
import * as haptics from "@/lib/haptics";

interface Props {
  dayName: string;
  initialExercises: ProgramExercise[];
  onSave: (exercises: ProgramExercise[]) => void;
  onClose: () => void;
}

export function CustomDayBuilder({
  dayName,
  initialExercises,
  onSave,
  onClose,
}: Props) {
  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["70%", "90%"], []);
  const [exercises, setExercises] = useState<ProgramExercise[]>(initialExercises);
  const [showPicker, setShowPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const COMMON_EXERCISES = [
    "Bench Press",
    "Squat",
    "Deadlift",
    "Overhead Press",
    "Barbell Row",
    "Pull-ups",
    "Romanian Deadlift",
    "Incline DB Press",
    "Lateral Raise",
    "Bicep Curl",
    "Tricep Pushdown",
    "Leg Press",
    "Leg Curl",
    "Calf Raise",
    "Face Pull",
    "Cable Fly",
    "Dumbbell Row",
    "Plank",
  ];

  function addExercise(name: string) {
    haptics.selection();
    const ex = normalizeExercise({
      name,
      exerciseId: name.toLowerCase().replace(/\s+/g, "-"),
    });
    setExercises((prev) => [...prev, ex]);
    setShowPicker(false);
    setSearchQuery("");
  }

  function removeExercise(index: number) {
    haptics.lightTap();
    setExercises((prev) => prev.filter((_, i) => i !== index));
  }

  function moveExercise(index: number, direction: "up" | "down") {
    haptics.lightTap();
    setExercises((prev) => {
      const target = direction === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function updateExercise(
    index: number,
    field: "sets" | "reps" | "weight",
    value: string,
  ) {
    setExercises((prev) =>
      prev.map((ex, i) =>
        i === index ? { ...ex, [field]: Number(value) || 0 } : ex,
      ),
    );
  }

  function handleSave() {
    haptics.success();
    onSave(exercises);
  }

  const handleChange = useCallback(
    (index: number) => {
      if (index === -1) onClose();
    },
    [onClose],
  );

  const filtered = COMMON_EXERCISES.filter((n) =>
    n.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <BottomSheet
      ref={sheetRef}
      index={0}
      snapPoints={snapPoints}
      onChange={handleChange}
      enablePanDownToClose
      backgroundStyle={{ backgroundColor: "#1A1A24" }}
      handleIndicatorStyle={{ backgroundColor: "#6B7280" }}
    >
      <BottomSheetScrollView contentContainerStyle={{ padding: 20 }}>
        <View className="mb-4 flex-row items-center justify-between">
          <View>
            <Text className="text-lg font-bold text-white">{dayName}</Text>
            <View className="mt-1 flex-row items-center">
              <View className="rounded-full bg-teal/15 px-2 py-0.5">
                <Text className="text-[10px] font-semibold text-teal">
                  custom
                </Text>
              </View>
            </View>
          </View>
          <TouchableOpacity
            className="rounded-xl bg-brand px-4 py-2"
            onPress={handleSave}
          >
            <Text className="text-sm font-semibold text-white">Save</Text>
          </TouchableOpacity>
        </View>

        {/* Exercise List */}
        {exercises.map((ex, i) => (
          <View
            key={`${ex.exerciseId}-${i}`}
            className="mb-3 rounded-xl bg-[#0F0F14] p-3"
          >
            <View className="flex-row items-center justify-between">
              <View className="mr-2">
                <TouchableOpacity
                  className="h-6 w-6 items-center justify-center"
                  onPress={() => moveExercise(i, "up")}
                  disabled={i === 0}
                >
                  <GripVertical
                    size={14}
                    color={i === 0 ? "#2A2A3A" : "#6B7280"}
                  />
                </TouchableOpacity>
              </View>
              <View className="flex-1">
                <Text className="text-sm font-semibold text-white">
                  {ex.name}
                </Text>
                {ex.lastPerformance && (
                  <Text className="text-[10px] text-gray-500">
                    last logged: {ex.lastPerformance.sets}x
                    {ex.lastPerformance.reps} @ {ex.lastPerformance.weight}
                    kg
                  </Text>
                )}
              </View>
              <TouchableOpacity
                className="h-8 w-8 items-center justify-center"
                onPress={() => removeExercise(i)}
              >
                <Trash2 size={14} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Sets x Reps x Weight */}
            <View className="mt-2 flex-row gap-2">
              <View className="flex-1">
                <Text className="mb-1 text-[10px] text-gray-500">SETS</Text>
                <TextInput
                  className="h-8 rounded-lg bg-[#1A1A24] px-2 text-center text-sm text-white"
                  keyboardType="numeric"
                  value={String(ex.sets)}
                  onChangeText={(v) => updateExercise(i, "sets", v)}
                />
              </View>
              <View className="flex-1">
                <Text className="mb-1 text-[10px] text-gray-500">REPS</Text>
                <TextInput
                  className="h-8 rounded-lg bg-[#1A1A24] px-2 text-center text-sm text-white"
                  keyboardType="numeric"
                  value={String(ex.reps)}
                  onChangeText={(v) => updateExercise(i, "reps", v)}
                />
              </View>
              <View className="flex-1">
                <Text className="mb-1 text-[10px] text-gray-500">KG</Text>
                <TextInput
                  className="h-8 rounded-lg bg-[#1A1A24] px-2 text-center text-sm text-white"
                  keyboardType="numeric"
                  value={String(ex.weight)}
                  onChangeText={(v) => updateExercise(i, "weight", v)}
                />
              </View>
            </View>
          </View>
        ))}

        {/* Add Exercise */}
        {showPicker ? (
          <View className="rounded-xl bg-[#0F0F14] p-3">
            <TextInput
              className="mb-2 h-9 rounded-lg bg-[#1A1A24] px-3 text-sm text-white"
              placeholder="Search exercises..."
              placeholderTextColor="#6B7280"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            {filtered.map((name) => (
              <TouchableOpacity
                key={name}
                className="border-b border-[#1A1A24] py-2.5"
                onPress={() => addExercise(name)}
              >
                <Text className="text-sm text-gray-300">{name}</Text>
              </TouchableOpacity>
            ))}
            {searchQuery.trim() &&
              !filtered.some(
                (n) => n.toLowerCase() === searchQuery.toLowerCase(),
              ) && (
                <TouchableOpacity
                  className="mt-2 flex-row items-center py-2"
                  onPress={() => addExercise(searchQuery.trim())}
                >
                  <Plus size={14} color="#8b5cf6" />
                  <Text className="ml-1 text-sm text-brand">
                    Add "{searchQuery.trim()}"
                  </Text>
                </TouchableOpacity>
              )}
            <TouchableOpacity
              className="mt-2 py-2"
              onPress={() => {
                setShowPicker(false);
                setSearchQuery("");
              }}
            >
              <Text className="text-center text-sm text-gray-500">
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            className="flex-row items-center justify-center rounded-xl bg-brand/10 py-3"
            onPress={() => setShowPicker(true)}
          >
            <Plus size={14} color="#8b5cf6" />
            <Text className="ml-1 text-sm font-medium text-brand">
              Add Exercise
            </Text>
          </TouchableOpacity>
        )}
      </BottomSheetScrollView>
    </BottomSheet>
  );
}
