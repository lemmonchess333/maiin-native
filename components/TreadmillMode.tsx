import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";

interface TreadmillModeProps {
  elapsed: number;
  formatTime: (s: number) => string;
  onSave: (distanceMeters: number) => void;
  onDiscard: () => void;
}

export function TreadmillMode({
  elapsed,
  formatTime,
  onSave,
  onDiscard,
}: TreadmillModeProps) {
  const [distance, setDistance] = useState("");

  return (
    <View className="px-6">
      <View className="items-center">
        <Text className="text-[10px] uppercase tracking-widest text-white/30">
          Treadmill Run
        </Text>
        <Text className="mt-2 text-6xl font-bold text-white">
          {formatTime(elapsed)}
        </Text>
      </View>

      <View className="mt-6">
        <Text className="mb-2 text-sm text-white/50">Distance covered</Text>
        <View className="flex-row items-center gap-2">
          <TextInput
            className="flex-1 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-center text-2xl text-white"
            keyboardType="decimal-pad"
            placeholder="0.00"
            placeholderTextColor="rgba(255,255,255,0.3)"
            value={distance}
            onChangeText={setDistance}
          />
          <Text className="text-sm text-white/50">km</Text>
        </View>
      </View>

      <View className="mt-6 gap-2">
        <TouchableOpacity
          className="rounded-xl bg-brand py-3.5"
          onPress={() => onSave(Number(distance) * 1000)}
          disabled={!distance || Number(distance) <= 0}
          style={{ opacity: !distance || Number(distance) <= 0 ? 0.4 : 1 }}
        >
          <Text className="text-center font-medium text-white">
            Save Treadmill Run
          </Text>
        </TouchableOpacity>
        <TouchableOpacity className="py-2" onPress={onDiscard}>
          <Text className="text-center text-sm text-red-400">Discard</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
