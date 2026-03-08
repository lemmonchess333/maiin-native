import { useCallback, useMemo, useRef } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { GUIDED_WORKOUTS, type GuidedRunWorkout } from "@/lib/guidedRun";
import * as haptics from "@/lib/haptics";

interface Props {
  onSelect: (workout: GuidedRunWorkout) => void;
  onClose: () => void;
}

const DIFFICULTY_COLORS = {
  easy: "#22c55e",
  moderate: "#3b82f6",
  hard: "#ef4444",
};

export function GuidedRunPicker({ onSelect, onClose }: Props) {
  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["55%"], []);

  const handleChange = useCallback(
    (index: number) => {
      if (index === -1) onClose();
    },
    [onClose],
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
      <BottomSheetView style={{ padding: 20 }}>
        <Text className="mb-4 text-lg font-bold text-white">
          Choose a Workout
        </Text>

        {GUIDED_WORKOUTS.map((workout) => (
          <TouchableOpacity
            key={workout.id}
            className="mb-3 rounded-xl border border-[#2A2A3A] p-4"
            style={{ borderLeftWidth: 4, borderLeftColor: workout.color }}
            onPress={() => {
              haptics.selection();
              onSelect(workout);
            }}
          >
            <View className="flex-row items-center justify-between">
              <Text className="text-base font-bold text-white">
                {workout.name}
              </Text>
              <View
                className="rounded-full px-2 py-0.5"
                style={{
                  backgroundColor:
                    DIFFICULTY_COLORS[workout.difficulty] + "20",
                }}
              >
                <Text
                  className="text-[10px] font-semibold"
                  style={{
                    color: DIFFICULTY_COLORS[workout.difficulty],
                  }}
                >
                  {workout.difficulty.toUpperCase()}
                </Text>
              </View>
            </View>
            <Text className="mt-1 text-xs text-gray-400">
              {workout.description}
            </Text>
            <Text className="mt-1 text-xs text-gray-500">
              {workout.totalMinutes} min · {workout.segments.length} segments
            </Text>
          </TouchableOpacity>
        ))}
      </BottomSheetView>
    </BottomSheet>
  );
}
