import { View, Text, Modal } from "react-native";
import Animated, { FadeIn, SlideInDown } from "react-native-reanimated";
import { Button } from "@/components/Button";
import { Trophy, Flame, Dumbbell, Clock } from "lucide-react-native";

export interface WorkoutSummary {
  name: string;
  exerciseCount: number;
  totalSets: number;
  totalVolume: number;
  durationMinutes: number;
  newPRs: number;
}

interface WorkoutSummaryModalProps {
  visible: boolean;
  summary: WorkoutSummary | null;
  onClose: () => void;
}

export function WorkoutSummaryModal({
  visible,
  summary,
  onClose,
}: WorkoutSummaryModalProps) {
  if (!summary) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View
        entering={FadeIn.duration(200)}
        className="flex-1 items-center justify-center bg-black/60 px-6"
      >
        <Animated.View
          entering={SlideInDown.delay(100).duration(400).springify().damping(18)}
          className="w-full rounded-3xl bg-[#1A1A24] p-6"
        >
          {/* Header */}
          <View className="mb-4 items-center">
            <View className="mb-3 h-16 w-16 items-center justify-center rounded-full bg-brand/20">
              <Flame size={32} color="#8b5cf6" />
            </View>
            <Text className="text-xl font-bold text-white">
              Workout Complete!
            </Text>
            <Text className="mt-1 text-sm text-gray-400">
              {summary.name}
            </Text>
          </View>

          {/* Stats grid */}
          <View className="mb-5 flex-row flex-wrap">
            <StatItem
              icon={<Dumbbell size={16} color="#8b5cf6" />}
              value={`${summary.exerciseCount}`}
              label="Exercises"
            />
            <StatItem
              icon={<Flame size={16} color="#FF6B6B" />}
              value={`${summary.totalSets}`}
              label="Sets"
            />
            <StatItem
              icon={<Clock size={16} color="#2dd4bf" />}
              value={`${summary.durationMinutes}m`}
              label="Duration"
            />
            <StatItem
              icon={<Trophy size={16} color="#f59e0b" />}
              value={summary.totalVolume.toLocaleString()}
              label="Volume (lbs)"
            />
          </View>

          {/* PR callout */}
          {summary.newPRs > 0 && (
            <View className="mb-4 flex-row items-center justify-center rounded-xl bg-warning/10 py-2">
              <Trophy size={14} color="#f59e0b" />
              <Text className="ml-2 text-sm font-semibold text-warning">
                {summary.newPRs} New PR{summary.newPRs > 1 ? "s" : ""}!
              </Text>
            </View>
          )}

          <Button title="Done" onPress={onClose} />
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

function StatItem({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <View className="w-1/2 items-center py-2">
      {icon}
      <Text className="mt-1 text-lg font-bold text-white">{value}</Text>
      <Text className="text-xs text-gray-400">{label}</Text>
    </View>
  );
}
