import { View, Text, TouchableOpacity } from "react-native";
import * as haptics from "@/lib/haptics";

interface Challenge {
  id: string;
  name: string;
  description: string;
  type: string;
  duration: string;
  target: { value: number; unit: string };
}

interface UserChallenge {
  challengeId: string;
  progress: number;
  completed: boolean;
}

export function ChallengeCard({
  challenge,
  userChallenge,
  color,
  onJoin,
}: {
  challenge: Challenge;
  userChallenge?: UserChallenge;
  color: string;
  onJoin?: () => void;
}) {
  const isActive = userChallenge && !userChallenge.completed;
  const pct = isActive
    ? Math.min((userChallenge.progress / challenge.target.value) * 100, 100)
    : 0;

  return (
    <View className="mb-3 rounded-2xl border border-[#2A2A3A] bg-[#1A1A24] p-4">
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-sm font-bold text-white">{challenge.name}</Text>
          <Text className="text-xs text-gray-400">{challenge.description}</Text>
          <View className="mt-1 flex-row items-center gap-2">
            <View
              className="rounded-full px-2 py-0.5"
              style={{ backgroundColor: color + "20" }}
            >
              <Text
                className="text-[10px] font-semibold"
                style={{ color }}
              >
                {challenge.type}
              </Text>
            </View>
            <Text className="text-[10px] text-gray-500">
              {challenge.duration}
            </Text>
          </View>
        </View>

        {!userChallenge && onJoin && (
          <TouchableOpacity
            className="rounded-xl px-3 py-2"
            style={{ backgroundColor: "#2dd4bf" }}
            onPress={() => {
              haptics.success();
              onJoin();
            }}
          >
            <Text className="text-xs font-semibold text-white">Join</Text>
          </TouchableOpacity>
        )}
      </View>

      {isActive && (
        <View className="mt-2">
          <View className="flex-row justify-between">
            <Text className="text-[10px] text-gray-400">
              {userChallenge.progress} / {challenge.target.value}{" "}
              {challenge.target.unit}
            </Text>
            <Text className="text-[10px] text-gray-400">
              {Math.round(pct)}%
            </Text>
          </View>
          <View className="mt-1 h-2 rounded-full bg-[#2A2A3A]">
            <View
              className="h-full rounded-full"
              style={{
                width: `${pct}%`,
                backgroundColor: color,
              }}
            />
          </View>
        </View>
      )}
    </View>
  );
}
