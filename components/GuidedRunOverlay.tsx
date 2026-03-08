import { View, Text } from "react-native";
import { getSegmentColor, type GuidedRunWorkout } from "@/lib/guidedRun";
import type { GuidedRunState } from "@/hooks/useGuidedRun";

interface Props {
  workout: GuidedRunWorkout;
  guidedState: GuidedRunState;
}

export function GuidedRunOverlay({ workout, guidedState }: Props) {
  const { currentSegment, timeRemaining, segmentProgress, totalProgress } =
    guidedState;

  if (!currentSegment) return null;

  const segColor = getSegmentColor(currentSegment.type);
  const mins = Math.floor(timeRemaining / 60);
  const secs = timeRemaining % 60;

  return (
    <View className="mb-4 overflow-hidden rounded-xl bg-[#1A1A24]">
      {/* Segment color bar */}
      <View className="h-1.5" style={{ backgroundColor: segColor }} />

      <View className="px-4 py-3">
        {/* Segment name */}
        <Text className="text-lg font-bold text-white">
          {currentSegment.label}
        </Text>

        {/* Instruction */}
        <Text className="mt-0.5 text-sm text-gray-300">
          {currentSegment.instruction}
        </Text>

        {/* Time remaining */}
        <Text
          className="mt-2 text-2xl font-bold"
          style={{ color: segColor }}
        >
          {mins}:{String(secs).padStart(2, "0")}
        </Text>

        {/* Segment progress bar */}
        <View className="mt-2 h-1.5 rounded-full bg-[#2A2A3A]">
          <View
            className="h-full rounded-full"
            style={{
              width: `${Math.min(segmentProgress * 100, 100)}%`,
              backgroundColor: segColor,
            }}
          />
        </View>

        {/* Total workout progress */}
        <View className="mt-2 flex-row items-center justify-between">
          <Text className="text-[10px] text-gray-500">
            Segment {guidedState.currentSegmentIndex + 1} of{" "}
            {workout.segments.length}
          </Text>
          <Text className="text-[10px] text-gray-500">
            {Math.round(totalProgress * 100)}% complete
          </Text>
        </View>

        {/* Total progress bar */}
        <View className="mt-1 h-1 rounded-full bg-[#2A2A3A]">
          <View
            className="h-full rounded-full bg-brand"
            style={{
              width: `${Math.min(totalProgress * 100, 100)}%`,
            }}
          />
        </View>
      </View>
    </View>
  );
}
