import { View, Text, ScrollView, TouchableOpacity, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Card } from "@/components/Card";
import { SectionHeader } from "@/components/SectionHeader";
import { useWorkouts } from "@/hooks/useWorkouts";
import { useRuns } from "@/hooks/useRuns";
import { exportWorkoutsCSV, exportRunsCSV } from "@/lib/export";
import * as haptics from "@/lib/haptics";
import { useAuth } from "@/lib/auth-context";
import { useNotifications } from "@/hooks/useNotifications";
import {
  ArrowLeft,
  Bell,
  Ruler,
  Info,
  ChevronRight,
  Shield,
  Download,
  Lock,
} from "lucide-react-native";
import { useState } from "react";
import { Alert, TextInput } from "react-native";

interface SettingRowProps {
  icon: React.ReactNode;
  label: string;
  right?: React.ReactNode;
  onPress?: () => void;
}

function SettingRow({ icon, label, right, onPress }: SettingRowProps) {
  return (
    <TouchableOpacity
      className="flex-row items-center py-3"
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View className="mr-3 h-8 w-8 items-center justify-center rounded-lg bg-[#0F0F14]">
        {icon}
      </View>
      <Text className="flex-1 text-sm text-white">{label}</Text>
      {right ?? <ChevronRight size={16} color="#6B7280" />}
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const { workouts } = useWorkouts(200);
  const { runs } = useRuns(200);
  const { changePassword } = useAuth();
  const { scheduleWorkoutReminder, cancelAll } = useNotifications();
  const [notifications, setNotifications] = useState(true);
  const [useKm, setUseKm] = useState(false);

  function handleChangePassword() {
    Alert.prompt(
      "Change Password",
      "Enter your new password (min 6 characters)",
      async (newPass) => {
        if (!newPass || newPass.length < 6) {
          Alert.alert("Error", "Password must be at least 6 characters");
          return;
        }
        try {
          await changePassword(newPass);
          haptics.success();
          Alert.alert("Success", "Password updated successfully");
        } catch (err: any) {
          Alert.alert("Error", err.message ?? "Failed to change password. You may need to re-authenticate.");
        }
      },
      "secure-text",
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="mb-4 mt-2 flex-row items-center">
          <TouchableOpacity
            className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-[#1A1A24]"
            onPress={() => router.back()}
          >
            <ArrowLeft size={20} color="#fff" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-white">Settings</Text>
        </View>

        {/* Preferences */}
        <SectionHeader title="Preferences" />
        <Card className="mb-5">
          <SettingRow
            icon={<Bell size={16} color="#8b5cf6" />}
            label="Workout Reminders"
            right={
              <Switch
                value={notifications}
                onValueChange={(v) => {
                  haptics.selection();
                  setNotifications(v);
                  if (v) {
                    scheduleWorkoutReminder(9, 0); // 9:00 AM daily
                  } else {
                    cancelAll();
                  }
                }}
                trackColor={{ false: "#2A2A3A", true: "#8b5cf6" }}
                thumbColor="#fff"
              />
            }
          />
          <View className="border-b border-[#2A2A3A]" />
          <SettingRow
            icon={<Ruler size={16} color="#2dd4bf" />}
            label="Use Kilometers"
            right={
              <Switch
                value={useKm}
                onValueChange={(v) => {
                  haptics.selection();
                  setUseKm(v);
                }}
                trackColor={{ false: "#2A2A3A", true: "#2dd4bf" }}
                thumbColor="#fff"
              />
            }
          />
        </Card>

        {/* Account */}
        <SectionHeader title="Account" />
        <Card className="mb-5">
          <SettingRow
            icon={<Lock size={16} color="#8b5cf6" />}
            label="Change Password"
            onPress={handleChangePassword}
          />
          <View className="border-b border-[#2A2A3A]" />
          <SettingRow
            icon={<Shield size={16} color="#f59e0b" />}
            label="Privacy Policy"
            onPress={() => {}}
          />
        </Card>

        {/* Data Export */}
        <SectionHeader title="Data" />
        <Card className="mb-5">
          <SettingRow
            icon={<Download size={16} color="#34d399" />}
            label="Export Workouts (CSV)"
            onPress={() => {
              haptics.lightTap();
              exportWorkoutsCSV(workouts);
            }}
          />
          <View className="border-b border-[#2A2A3A]" />
          <SettingRow
            icon={<Download size={16} color="#FF6B6B" />}
            label="Export Runs (CSV)"
            onPress={() => {
              haptics.lightTap();
              exportRunsCSV(runs);
            }}
          />
        </Card>

        {/* About */}
        <SectionHeader title="About" />
        <Card className="mb-8">
          <SettingRow
            icon={<Info size={16} color="#6B7280" />}
            label="Version"
            right={
              <Text className="text-sm text-gray-500">1.0.0</Text>
            }
          />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
