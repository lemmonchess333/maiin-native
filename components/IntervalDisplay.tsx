import { View, Text } from "react-native";
import type { IntervalState } from "@/hooks/useIntervalWorkout";

const PHASE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  warmup: { bg: "bg-yellow-500/20", text: "text-yellow-400", border: "border-yellow-500/30" },
  work: { bg: "bg-green-500/20", text: "text-green-400", border: "border-green-500/30" },
  rest: { bg: "bg-blue-500/20", text: "text-blue-400", border: "border-blue-500/30" },
  cooldown: { bg: "bg-yellow-500/20", text: "text-yellow-400", border: "border-yellow-500/30" },
};

function getPhaseLabel(state: IntervalState): string {
  switch (state.phase) {
    case "warmup": return "WARM UP";
    case "work": return `REP ${state.currentRep}/${state.totalReps}`;
    case "rest": return "REST";
    case "cooldown": return "COOL DOWN";
    default: return "";
  }
}

export function IntervalDisplay({ state }: { state: IntervalState }) {
  if (state.phase === "idle" || state.phase === "complete") return null;

  const colors = PHASE_COLORS[state.phase] ?? PHASE_COLORS.warmup;
  const remaining = Math.max(0, Math.ceil(state.phaseTarget - state.phaseElapsed));
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;

  return (
    <View className={`mx-4 rounded-xl border p-3 ${colors.bg} ${colors.border}`}>
      <Text className={`text-xs font-bold tracking-wider ${colors.text}`}>
        {getPhaseLabel(state)}
      </Text>
      {state.phase === "work" && state.isDistanceBased ? (
        <Text className={`mt-1 text-2xl font-bold ${colors.text}`}>
          {Math.max(0, Math.round(state.phaseTarget - state.phaseDistanceCovered))}m left
        </Text>
      ) : (
        <Text className={`mt-1 text-2xl font-bold ${colors.text}`}>
          {mins}:{String(secs).padStart(2, "0")}
        </Text>
      )}
    </View>
  );
}
