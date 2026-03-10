import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  TextInput,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { ArrowLeft } from "lucide-react-native";
import * as haptics from "@/lib/haptics";

export type ActivityType =
  | "easy"
  | "tempo"
  | "intervals"
  | "long"
  | "race"
  | "treadmill"
  | "freerun"
  | "guided";

export interface RunConfig {
  activityType: ActivityType;
  autoPause: boolean;
  audioCues: boolean;
  paceAlerts: boolean;
  target: {
    type: "none" | "distance" | "time" | "pace";
    value?: number;
  };
  intervals?: {
    reps: number;
    workDistance?: number;
    workDuration?: number;
    workPace?: number;
    restDuration: number;
    warmupDuration?: number;
    cooldownDuration?: number;
  };
  shoeId?: string;
}

const ACTIVITY_TYPES: { type: ActivityType; label: string; icon: string }[] = [
  { type: "freerun", label: "Free", icon: "🏃" },
  { type: "easy", label: "Easy", icon: "🚶" },
  { type: "tempo", label: "Tempo", icon: "⚡" },
  { type: "intervals", label: "Intervals", icon: "🔄" },
  { type: "long", label: "Long", icon: "🛤️" },
  { type: "race", label: "Race", icon: "🏁" },
  { type: "treadmill", label: "Treadmill", icon: "🏋️" },
];

const DEFAULT_CONFIG: RunConfig = {
  activityType: "freerun",
  autoPause: true,
  audioCues: true,
  paceAlerts: true,
  target: { type: "none" },
};

interface RunSetupModalProps {
  onStart: (config: RunConfig) => void;
  onCancel: () => void;
}

export function RunSetupModal({ onStart, onCancel }: RunSetupModalProps) {
  const [config, setConfig] = useState<RunConfig>(DEFAULT_CONFIG);
  const updateConfig = (partial: Partial<RunConfig>) =>
    setConfig((prev) => ({ ...prev, ...partial }));

  const intervalConfig = config.intervals ?? {
    reps: 5,
    workDistance: 1000,
    restDuration: 90,
  };

  return (
    <ScrollView
      className="flex-1 bg-[#0F0F14]"
      contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
    >
      {/* Back */}
      <TouchableOpacity
        className="mb-4 flex-row items-center"
        onPress={onCancel}
      >
        <ArrowLeft size={16} color="#6B7280" />
        <Text className="ml-1 text-sm text-gray-400">Back</Text>
      </TouchableOpacity>

      <Text className="mb-1 text-2xl font-extrabold text-white">
        Ready to run?
      </Text>
      <Text className="mb-5 text-sm text-gray-400">Pick a type or just go</Text>

      {/* Activity type strip */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, marginBottom: 16 }}
      >
        {ACTIVITY_TYPES.map((at) => {
          const isActive = config.activityType === at.type;
          return (
            <TouchableOpacity
              key={at.type}
              className={`items-center rounded-2xl border-2 px-3 py-2.5 ${
                isActive
                  ? "border-brand/70 bg-brand/12"
                  : "border-white/8 bg-white/4"
              }`}
              onPress={() => {
                haptics.selection();
                updateConfig({ activityType: at.type });
              }}
            >
              <Text className="text-2xl">{at.icon}</Text>
              <Text
                className={`mt-1 text-[11px] font-semibold ${
                  isActive ? "text-brand" : "text-white/60"
                }`}
              >
                {at.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Interval config */}
      {config.activityType === "intervals" && (
        <Animated.View
          entering={FadeInDown.duration(200)}
          className="mb-4 rounded-xl border border-[#2A2A3A] bg-[#1A1A24] p-4"
        >
          <Text className="mb-3 text-sm font-semibold text-white">
            Interval Setup
          </Text>
          <View className="flex-row gap-3">
            {[
              { label: "Repeats", field: "reps" as const, value: intervalConfig.reps },
              { label: "Work (m)", field: "workDistance" as const, value: intervalConfig.workDistance ?? 1000 },
              { label: "Rest (s)", field: "restDuration" as const, value: intervalConfig.restDuration },
            ].map((f) => (
              <View key={f.field} className="flex-1">
                <Text className="text-[10px] text-gray-500">{f.label}</Text>
                <TextInput
                  className="mt-1 h-9 rounded-lg bg-[#0F0F14] px-2 text-center text-sm text-white"
                  keyboardType="numeric"
                  value={String(f.value)}
                  onChangeText={(v) =>
                    updateConfig({
                      intervals: {
                        ...intervalConfig,
                        [f.field]: Number(v) || 0,
                      },
                    })
                  }
                />
              </View>
            ))}
          </View>
        </Animated.View>
      )}

      {/* Target */}
      {config.activityType !== "intervals" &&
        config.activityType !== "treadmill" && (
          <View className="mb-4">
            <Text className="mb-2 text-xs font-medium uppercase tracking-widest text-gray-500">
              Target (optional)
            </Text>
            <View className="flex-row gap-2">
              {(["none", "distance", "time", "pace"] as const).map((t) => (
                <TouchableOpacity
                  key={t}
                  className={`flex-1 rounded-xl border py-2 ${
                    config.target.type === t
                      ? "border-brand/40 bg-brand/20"
                      : "border-white/8 bg-white/5"
                  }`}
                  onPress={() => {
                    haptics.selection();
                    updateConfig({
                      target: {
                        type: t,
                        value:
                          t === "distance"
                            ? 5
                            : t === "time"
                              ? 1800
                              : t === "pace"
                                ? 330
                                : undefined,
                      },
                    });
                  }}
                >
                  <Text
                    className={`text-center text-xs font-medium ${
                      config.target.type === t
                        ? "text-brand"
                        : "text-white/40"
                    }`}
                  >
                    {t === "none" ? "None" : t.charAt(0).toUpperCase() + t.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

      {/* Advanced settings */}
      <View className="mb-4 gap-2">
        <View className="flex-row items-center justify-between rounded-xl border border-[#2A2A3A] bg-[#1A1A24] p-3.5">
          <Text className="text-sm text-white">Auto-pause</Text>
          <Switch
            value={config.autoPause}
            onValueChange={(v) => updateConfig({ autoPause: v })}
            trackColor={{ false: "#2A2A3A", true: "#8b5cf6" }}
            thumbColor="#fff"
          />
        </View>
        <View className="flex-row items-center justify-between rounded-xl border border-[#2A2A3A] bg-[#1A1A24] p-3.5">
          <Text className="text-sm text-white">Audio cues</Text>
          <Switch
            value={config.audioCues}
            onValueChange={(v) => updateConfig({ audioCues: v })}
            trackColor={{ false: "#2A2A3A", true: "#8b5cf6" }}
            thumbColor="#fff"
          />
        </View>
      </View>

      {/* Start button */}
      <TouchableOpacity
        className="mt-4 rounded-2xl py-5"
        style={{
          backgroundColor: "#f97316",
        }}
        onPress={() => {
          haptics.success();
          onStart(config);
        }}
      >
        <Text className="text-center text-lg font-bold text-white">
          {config.activityType === "treadmill"
            ? "🏋️  Start Treadmill"
            : "🏃  Start Run"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
