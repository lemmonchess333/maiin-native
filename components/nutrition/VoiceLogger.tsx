import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { Mic, X, Check } from "lucide-react-native";

interface VoiceLoggerProps {
  onResult: (text: string) => void;
  onClose: () => void;
}

export function VoiceLogger({ onResult, onClose }: VoiceLoggerProps) {
  const [transcript, setTranscript] = useState("");

  const handleConfirm = () => {
    if (transcript.trim()) {
      onResult(transcript.trim());
    }
  };

  return (
    <View>
      <View className="mb-3 flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Mic size={16} color="#8b5cf6" />
          <Text className="text-sm font-semibold text-white">
            Quick Food Log
          </Text>
        </View>
        <TouchableOpacity onPress={onClose}>
          <X size={18} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <Text className="mb-2 text-[11px] text-gray-400">
        Describe what you ate in natural language
      </Text>

      <TextInput
        className="mb-3 rounded-lg border border-[#2A2A3A] bg-[#0F0F14] px-3 py-3 text-sm text-white"
        placeholder="e.g. two eggs and a banana"
        placeholderTextColor="#6B7280"
        value={transcript}
        onChangeText={setTranscript}
        multiline
        numberOfLines={2}
        textAlignVertical="top"
      />

      <TouchableOpacity
        className="flex-row items-center justify-center gap-1.5 rounded-xl py-3"
        style={{
          backgroundColor: transcript.trim() ? "#8b5cf6" : "#2A2A3A",
        }}
        onPress={handleConfirm}
        disabled={!transcript.trim()}
      >
        <Check size={16} color="#fff" />
        <Text className="text-sm font-semibold text-white">Parse & Log</Text>
      </TouchableOpacity>
    </View>
  );
}
