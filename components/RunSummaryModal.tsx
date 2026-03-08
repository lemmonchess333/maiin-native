import { useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PaceTrendBadge } from "@/components/PaceTrendBadge";
import { StatBadge } from "@/components/StatBadge";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import type { Run } from "@/lib/types";

interface RunSummaryData {
  distanceMiles: number;
  durationSeconds: number;
  pacePerMile: string;
  calories: number;
}

interface Props {
  visible: boolean;
  data: RunSummaryData | null;
  run: Run | null;
  allRuns: Run[];
  autoPost: boolean;
  onAutoPostChange: (v: boolean) => void;
  onSave: (notes: string) => void;
  onDiscard: () => void;
}

export function RunSummaryModal({
  visible,
  data,
  run,
  allRuns,
  autoPost,
  onAutoPostChange,
  onSave,
  onDiscard,
}: Props) {
  const [notes, setNotes] = useState("");

  if (!data) return null;

  function formatTime(secs: number) {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0)
      return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <SafeAreaView className="flex-1 bg-background px-5">
        <View className="flex-1 justify-center">
          <Text className="mb-2 text-center text-2xl font-bold text-white">
            Run Complete
          </Text>

          {/* Pace Trend Badge */}
          {run && (
            <View className="mb-4">
              <PaceTrendBadge run={run} allRuns={allRuns} />
            </View>
          )}

          {/* Stats */}
          <Card className="mb-6 flex-row justify-around">
            <StatBadge
              label="Distance (mi)"
              value={data.distanceMiles.toFixed(2)}
              color="running"
            />
            <StatBadge
              label="Pace (/mi)"
              value={data.pacePerMile}
              color="teal"
            />
            <StatBadge
              label="Duration"
              value={formatTime(data.durationSeconds)}
              color="teal"
            />
            <StatBadge
              label="Calories"
              value={data.calories.toString()}
              color="warning"
            />
          </Card>

          {/* Run Notes */}
          <TextInput
            className="mb-4 h-20 rounded-xl border border-[#2A2A3A] bg-[#1A1A24] px-4 py-3 text-white"
            placeholder="Add notes about your run (optional)"
            placeholderTextColor="#6B7280"
            value={notes}
            onChangeText={setNotes}
            multiline
            textAlignVertical="top"
          />

          {/* Auto-post toggle */}
          <View className="mb-6 flex-row items-center justify-between rounded-xl bg-[#1A1A24] px-4 py-3">
            <Text className="text-sm text-white">Share to Feed</Text>
            <Switch
              value={autoPost}
              onValueChange={onAutoPostChange}
              trackColor={{ false: "#2A2A3A", true: "#8b5cf6" }}
              thumbColor="#fff"
            />
          </View>

          {/* Save / Discard */}
          <Button title="Save Run" onPress={() => onSave(notes.trim())} />
          <TouchableOpacity className="mt-3 py-3" onPress={onDiscard}>
            <Text className="text-center text-sm text-gray-400">Discard</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
