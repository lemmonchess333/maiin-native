import { useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { useWorkouts } from "@/hooks/useWorkouts";
import { useTemplates } from "@/hooks/useTemplates";
import * as haptics from "@/lib/haptics";
import { Plus, Trash2, Dumbbell, Check, Bookmark, BookmarkPlus } from "lucide-react-native";

interface LocalSet {
  weight: string;
  reps: string;
  done: boolean;
}

interface LocalExercise {
  id: string;
  name: string;
  sets: LocalSet[];
}

const TEMPLATES = [
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
];

export default function LogScreen() {
  const { saveWorkout } = useWorkouts();
  const { templates: savedTemplates, saveTemplate } = useTemplates();
  const [exercises, setExercises] = useState<LocalExercise[]>([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [workoutName, setWorkoutName] = useState("");
  const [saving, setSaving] = useState(false);
  const startTime = useRef(Date.now());

  function loadTemplate(template: { name: string; exercises: { name: string; defaultSets: number }[] }) {
    haptics.mediumTap();
    setWorkoutName(template.name);
    setExercises(
      template.exercises.map((ex, i) => ({
        id: `${Date.now()}-${i}`,
        name: ex.name,
        sets: Array.from({ length: ex.defaultSets }, () => ({
          weight: "",
          reps: "",
          done: false,
        })),
      })),
    );
  }

  async function handleSaveAsTemplate() {
    if (exercises.length === 0) return;
    haptics.lightTap();
    const templateExercises = exercises.map((ex) => ({
      name: ex.name,
      defaultSets: ex.sets.length,
    }));
    await saveTemplate(workoutName || "My Template", templateExercises);
    Alert.alert("Template Saved", `"${workoutName || "My Template"}" saved for quick access.`);
  }

  function addExercise(name: string) {
    haptics.selection();
    if (exercises.length === 0) startTime.current = Date.now();
    setExercises((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        name,
        sets: [{ weight: "", reps: "", done: false }],
      },
    ]);
    setShowTemplates(false);
  }

  function addSet(exerciseId: string) {
    setExercises((prev) =>
      prev.map((ex) =>
        ex.id === exerciseId
          ? { ...ex, sets: [...ex.sets, { weight: "", reps: "", done: false }] }
          : ex,
      ),
    );
  }

  function removeExercise(exerciseId: string) {
    setExercises((prev) => prev.filter((ex) => ex.id !== exerciseId));
  }

  function updateSet(
    exerciseId: string,
    setIndex: number,
    field: keyof LocalSet,
    value: string | boolean,
  ) {
    setExercises((prev) =>
      prev.map((ex) =>
        ex.id === exerciseId
          ? {
              ...ex,
              sets: ex.sets.map((s, i) =>
                i === setIndex ? { ...s, [field]: value } : s,
              ),
            }
          : ex,
      ),
    );
  }

  async function handleFinish() {
    setSaving(true);
    try {
      const durationMinutes = Math.round(
        (Date.now() - startTime.current) / 60000,
      );
      const firestoreExercises = exercises.map((ex) => ({
        name: ex.name,
        sets: ex.sets
          .filter((s) => s.done)
          .map((s) => ({
            weight: Number(s.weight) || 0,
            reps: Number(s.reps) || 0,
            done: true,
          })),
      }));

      await saveWorkout(
        workoutName || "Untitled Workout",
        firestoreExercises,
        durationMinutes,
      );

      const totalSets = firestoreExercises.reduce(
        (sum, ex) => sum + ex.sets.length,
        0,
      );
      haptics.success();
      Alert.alert(
        "Workout Saved",
        `${exercises.length} exercises, ${totalSets} sets logged!`,
      );
      setExercises([]);
      setWorkoutName("");
    } catch (err: any) {
      Alert.alert("Error", err.message ?? "Failed to save workout");
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="mb-4 mt-2 flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-bold text-white">Log Workout</Text>
            <Text className="text-sm text-gray-400">
              Track your lifts set by set
            </Text>
          </View>
          <Dumbbell size={24} color="#8b5cf6" />
        </View>

        {/* Saved Templates */}
        {exercises.length === 0 && savedTemplates.length > 0 && (
          <>
            <View className="mb-3 flex-row items-center">
              <Bookmark size={14} color="#8b5cf6" />
              <Text className="ml-1 text-sm font-semibold text-brand">
                My Templates
              </Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-4"
            >
              {savedTemplates.map((t) => (
                <TouchableOpacity
                  key={t.id}
                  className="mr-3 rounded-xl bg-[#1A1A24] px-4 py-3"
                  onPress={() => loadTemplate(t)}
                >
                  <Text className="text-sm font-semibold text-white">
                    {t.name}
                  </Text>
                  <Text className="text-xs text-gray-500">
                    {t.exercises.length} exercises
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}

        {/* Workout Name */}
        <TextInput
          className="mb-4 h-12 rounded-xl border border-[#2A2A3A] bg-[#1A1A24] px-4 text-white"
          placeholder="Workout name (e.g., Upper Body Push)"
          placeholderTextColor="#6B7280"
          value={workoutName}
          onChangeText={setWorkoutName}
        />

        {/* Exercises */}
        {exercises.map((exercise) => (
          <Card key={exercise.id} className="mb-4">
            <View className="mb-3 flex-row items-center justify-between">
              <Text className="text-base font-bold text-brand">
                {exercise.name}
              </Text>
              <TouchableOpacity onPress={() => removeExercise(exercise.id)}>
                <Trash2 size={18} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Set headers */}
            <View className="mb-2 flex-row items-center">
              <Text className="w-10 text-xs font-semibold text-gray-500">
                SET
              </Text>
              <Text className="flex-1 text-center text-xs font-semibold text-gray-500">
                LBS
              </Text>
              <Text className="flex-1 text-center text-xs font-semibold text-gray-500">
                REPS
              </Text>
              <View className="w-10" />
            </View>

            {/* Sets */}
            {exercise.sets.map((set, index) => (
              <View key={index} className="mb-2 flex-row items-center">
                <Text className="w-10 text-sm text-gray-400">{index + 1}</Text>
                <TextInput
                  className="mx-1 flex-1 h-9 rounded-lg bg-background px-2 text-center text-white"
                  keyboardType="numeric"
                  placeholder="—"
                  placeholderTextColor="#6B7280"
                  value={set.weight}
                  onChangeText={(v) =>
                    updateSet(exercise.id, index, "weight", v)
                  }
                />
                <TextInput
                  className="mx-1 flex-1 h-9 rounded-lg bg-background px-2 text-center text-white"
                  keyboardType="numeric"
                  placeholder="—"
                  placeholderTextColor="#6B7280"
                  value={set.reps}
                  onChangeText={(v) => updateSet(exercise.id, index, "reps", v)}
                />
                <TouchableOpacity
                  className={`h-9 w-10 items-center justify-center rounded-lg ${set.done ? "bg-success" : "bg-background"}`}
                  onPress={() => {
                    if (!set.done) haptics.lightTap();
                    updateSet(exercise.id, index, "done", !set.done);
                  }}
                >
                  <Check size={16} color={set.done ? "#fff" : "#6B7280"} />
                </TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity
              className="mt-2 flex-row items-center justify-center py-2"
              onPress={() => addSet(exercise.id)}
            >
              <Plus size={14} color="#8b5cf6" />
              <Text className="ml-1 text-sm text-brand">Add Set</Text>
            </TouchableOpacity>
          </Card>
        ))}

        {/* Add Exercise */}
        {showTemplates ? (
          <Card className="mb-4">
            <Text className="mb-3 text-sm font-semibold text-white">
              Choose Exercise
            </Text>
            {TEMPLATES.map((name) => (
              <TouchableOpacity
                key={name}
                className="border-b border-[#2A2A3A] py-3"
                onPress={() => addExercise(name)}
              >
                <Text className="text-sm text-gray-300">{name}</Text>
              </TouchableOpacity>
            ))}
          </Card>
        ) : (
          <Button
            title="Add Exercise"
            variant="outline"
            className="mb-4"
            onPress={() => setShowTemplates(true)}
          />
        )}

        {/* Actions */}
        {exercises.length > 0 && (
          <View className="mb-8">
            <Button
              title="Finish Workout"
              loading={saving}
              onPress={handleFinish}
            />
            <TouchableOpacity
              className="mt-3 flex-row items-center justify-center py-2"
              onPress={handleSaveAsTemplate}
            >
              <BookmarkPlus size={16} color="#8b5cf6" />
              <Text className="ml-2 text-sm text-brand">
                Save as Template
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View className="h-4" />
      </ScrollView>
    </SafeAreaView>
  );
}
