import { useState } from "react";
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
import { Plus, Trash2, Dumbbell, Check } from "lucide-react-native";

interface WorkoutSet {
  weight: string;
  reps: string;
  done: boolean;
}

interface Exercise {
  id: string;
  name: string;
  sets: WorkoutSet[];
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
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [workoutName, setWorkoutName] = useState("");

  function addExercise(name: string) {
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
    field: keyof WorkoutSet,
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

  function handleFinish() {
    const totalSets = exercises.reduce(
      (sum, ex) => sum + ex.sets.filter((s) => s.done).length,
      0,
    );
    Alert.alert(
      "Workout Complete",
      `${exercises.length} exercises, ${totalSets} sets logged!`,
    );
    setExercises([]);
    setWorkoutName("");
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
                  onPress={() =>
                    updateSet(exercise.id, index, "done", !set.done)
                  }
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

        {/* Finish Button */}
        {exercises.length > 0 && (
          <Button
            title="Finish Workout"
            className="mb-8"
            onPress={handleFinish}
          />
        )}

        <View className="h-4" />
      </ScrollView>
    </SafeAreaView>
  );
}
