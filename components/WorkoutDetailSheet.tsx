import { useCallback, useMemo, forwardRef } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { Share2 } from "lucide-react-native";
import { shareActivity } from "@/lib/share";
import { computeSplits } from "@/lib/splits";
import { RunMapView } from "@/components/RunMapView";
import type { Workout, Run } from "@/lib/types";
import type { Activity } from "@/lib/types";

interface WorkoutDetailSheetProps {
  activity: Activity | null;
  onClose: () => void;
}

export const WorkoutDetailSheet = forwardRef<BottomSheet, WorkoutDetailSheetProps>(
  function WorkoutDetailSheet({ activity, onClose }, ref) {
    const snapPoints = useMemo(() => ["50%", "80%"], []);

    const handleSheetChanges = useCallback(
      (index: number) => {
        if (index === -1) onClose();
      },
      [onClose],
    );

    if (!activity) return null;

    const isWorkout = activity.type === "workout";
    const date = activity.data.createdAt.toDate().toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });

    return (
      <BottomSheet
        ref={ref}
        index={-1}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        enablePanDownToClose
        backgroundStyle={{ backgroundColor: "#1A1A24" }}
        handleIndicatorStyle={{ backgroundColor: "#6B7280" }}
      >
        <BottomSheetScrollView
          contentContainerStyle={{ padding: 20 }}
        >
          {/* Header */}
          <View className="flex-row items-start justify-between">
            <View className="flex-1">
              <Text className="text-xl font-bold text-white">
                {isWorkout ? activity.data.name : "Run"}
              </Text>
              <Text className="mt-1 text-sm text-gray-400">{date}</Text>
            </View>
            <TouchableOpacity
              className="h-9 w-9 items-center justify-center rounded-full bg-[#0F0F14]"
              onPress={() => shareActivity(activity.type, activity.data)}
            >
              <Share2 size={16} color="#8b5cf6" />
            </TouchableOpacity>
          </View>

          {isWorkout ? (
            <WorkoutDetail workout={activity.data} />
          ) : (
            <RunDetail run={activity.data} />
          )}
        </BottomSheetScrollView>
      </BottomSheet>
    );
  },
);

function WorkoutDetail({ workout }: { workout: Workout }) {
  const totalSets = workout.exercises.reduce(
    (sum, ex) => sum + ex.sets.length,
    0,
  );
  const totalVolume = workout.exercises.reduce(
    (sum, ex) =>
      sum + ex.sets.reduce((s, set) => s + set.weight * set.reps, 0),
    0,
  );

  return (
    <View className="mt-4">
      {/* Notes */}
      {workout.notes ? (
        <View className="mb-4 rounded-xl bg-[#0F0F14] p-3">
          <Text className="mb-1 text-xs font-semibold text-gray-500">
            NOTES
          </Text>
          <Text className="text-sm text-gray-300">{workout.notes}</Text>
        </View>
      ) : null}

      {/* Summary */}
      <View className="mb-4 flex-row justify-around rounded-xl bg-[#0F0F14] py-3">
        <View className="items-center">
          <Text className="text-lg font-bold text-brand">
            {workout.exercises.length}
          </Text>
          <Text className="text-xs text-gray-400">Exercises</Text>
        </View>
        <View className="items-center">
          <Text className="text-lg font-bold text-brand">{totalSets}</Text>
          <Text className="text-xs text-gray-400">Sets</Text>
        </View>
        <View className="items-center">
          <Text className="text-lg font-bold text-brand">
            {workout.durationMinutes}
          </Text>
          <Text className="text-xs text-gray-400">Minutes</Text>
        </View>
        <View className="items-center">
          <Text className="text-lg font-bold text-warning">
            {totalVolume.toLocaleString()}
          </Text>
          <Text className="text-xs text-gray-400">Volume (lbs)</Text>
        </View>
      </View>

      {/* Exercises */}
      {workout.exercises.map((ex, i) => (
        <View key={i} className="mb-4">
          <Text className="mb-2 text-base font-semibold text-brand">
            {ex.name}
          </Text>
          {/* Header row */}
          <View className="mb-1 flex-row">
            <Text className="w-10 text-xs text-gray-500">SET</Text>
            <Text className="flex-1 text-center text-xs text-gray-500">
              LBS
            </Text>
            <Text className="flex-1 text-center text-xs text-gray-500">
              REPS
            </Text>
          </View>
          {ex.sets.map((set, si) => (
            <View key={si} className="flex-row py-1">
              <Text className="w-10 text-sm text-gray-400">{si + 1}</Text>
              <Text className="flex-1 text-center text-sm text-white">
                {set.weight}
              </Text>
              <Text className="flex-1 text-center text-sm text-white">
                {set.reps}
              </Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

function RunDetail({ run }: { run: Run }) {
  const minutes = Math.floor(run.durationSeconds / 60);
  const secs = run.durationSeconds % 60;
  const duration = `${minutes}:${String(secs).padStart(2, "0")}`;
  const splits = computeSplits(run.route);

  return (
    <View className="mt-4">
      <View className="mb-4 flex-row justify-around rounded-xl bg-[#0F0F14] py-3">
        <View className="items-center">
          <Text className="text-lg font-bold text-running">
            {run.distanceMiles.toFixed(2)}
          </Text>
          <Text className="text-xs text-gray-400">Miles</Text>
        </View>
        <View className="items-center">
          <Text className="text-lg font-bold text-teal">
            {run.pacePerMile}
          </Text>
          <Text className="text-xs text-gray-400">Pace /mi</Text>
        </View>
        <View className="items-center">
          <Text className="text-lg font-bold text-white">{duration}</Text>
          <Text className="text-xs text-gray-400">Duration</Text>
        </View>
        <View className="items-center">
          <Text className="text-lg font-bold text-warning">
            {run.calories}
          </Text>
          <Text className="text-xs text-gray-400">Calories</Text>
        </View>
      </View>

      {/* Splits */}
      {splits.length > 0 && (
        <View className="mb-4">
          <Text className="mb-2 text-sm font-semibold text-white">
            Mile Splits
          </Text>
          <View className="mb-1 flex-row">
            <Text className="w-16 text-xs text-gray-500">MILE</Text>
            <Text className="flex-1 text-center text-xs text-gray-500">
              TIME
            </Text>
            <Text className="flex-1 text-center text-xs text-gray-500">
              PACE
            </Text>
          </View>
          {splits.map((split) => {
            const m = Math.floor(split.timeSeconds / 60);
            const s = split.timeSeconds % 60;
            return (
              <View key={split.mile} className="flex-row py-1.5">
                <Text className="w-16 text-sm text-gray-400">
                  {split.mile}
                </Text>
                <Text className="flex-1 text-center text-sm text-white">
                  {m}:{String(s).padStart(2, "0")}
                </Text>
                <Text className="flex-1 text-center text-sm text-teal">
                  {split.pace}/mi
                </Text>
              </View>
            );
          })}
        </View>
      )}

      {run.route.length > 1 && (
        <View className="mb-4">
          <Text className="mb-2 text-sm font-semibold text-white">
            Route Map
          </Text>
          <RunMapView route={run.route} height={200} />
        </View>
      )}
    </View>
  );
}
