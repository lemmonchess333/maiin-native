import { View, Text, ScrollView, TouchableOpacity, Switch, TextInput, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useState, useRef, useCallback, useMemo } from "react";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { Card } from "@/components/Card";
import { SectionHeader } from "@/components/SectionHeader";
import { Button } from "@/components/Button";
import { useWorkouts } from "@/hooks/useWorkouts";
import { useRuns } from "@/hooks/useRuns";
import { useShoes, type Shoe } from "@/hooks/useShoes";
import { usePrivacyZones } from "@/hooks/usePrivacyZones";
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
  Plus,
  Star,
  Archive,
  MapPin,
  Trash2,
} from "lucide-react-native";

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

function MileageBar({ shoe }: { shoe: Shoe }) {
  const pct = Math.min((shoe.totalKm / shoe.maxKm) * 100, 100);
  const color = pct < 60 ? "#22c55e" : pct < 85 ? "#f59e0b" : "#ef4444";
  const remaining = Math.max(shoe.maxKm - shoe.totalKm, 0);
  return (
    <View className="mt-1">
      <View className="flex-row justify-between">
        <Text className="text-[10px] text-gray-400">
          {Math.round(shoe.totalKm)} km
        </Text>
        <Text className="text-[10px] text-gray-400">{shoe.maxKm} km</Text>
      </View>
      <View className="mt-0.5 h-2 rounded-full bg-[#2A2A3A]">
        <View
          className="h-full rounded-full"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </View>
      <Text className="mt-0.5 text-[10px] text-gray-500">
        {Math.round(remaining)} km remaining
      </Text>
    </View>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const { workouts } = useWorkouts(200);
  const { runs } = useRuns(200);
  const { changePassword } = useAuth();
  const { scheduleWorkoutReminder, cancelAll } = useNotifications();
  const {
    shoes,
    activeShoes,
    addShoe,
    retireShoe,
    setDefault,
    loading: shoesLoading,
  } = useShoes();
  const { zones, addZone, removeZone } = usePrivacyZones();

  const [notifications, setNotifications] = useState(true);
  const [useKm, setUseKm] = useState(false);
  const [showAddShoe, setShowAddShoe] = useState(false);
  const [newShoeName, setNewShoeName] = useState("");
  const [newShoeBrand, setNewShoeBrand] = useState("");
  const [newShoeMax, setNewShoeMax] = useState("600");

  const addShoeSheetRef = useRef<BottomSheet>(null);
  const addShoeSnapPoints = useMemo(() => ["45%"], []);

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
          Alert.alert(
            "Error",
            err.message ??
              "Failed to change password. You may need to re-authenticate.",
          );
        }
      },
      "secure-text",
    );
  }

  async function handleAddShoe() {
    if (!newShoeName.trim()) return;
    haptics.success();
    await addShoe(newShoeName.trim(), newShoeBrand.trim(), Number(newShoeMax) || 600);
    setNewShoeName("");
    setNewShoeBrand("");
    setNewShoeMax("600");
    setShowAddShoe(false);
  }

  const retired = shoes.filter((s) => s.retired);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
      >
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
                    scheduleWorkoutReminder(9, 0);
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

        {/* My Shoes */}
        <SectionHeader title="My Shoes" />
        <Card className="mb-5">
          {activeShoes.length === 0 && !shoesLoading ? (
            <Text className="py-2 text-sm text-gray-400">
              No shoes added yet
            </Text>
          ) : (
            activeShoes.map((shoe) => (
              <View key={shoe.id} className="mb-3 last:mb-0">
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <View className="flex-row items-center gap-2">
                      <Text className="text-sm font-semibold text-white">
                        {shoe.name}
                      </Text>
                      {shoe.isDefault && (
                        <View className="rounded-full bg-brand/15 px-1.5 py-0.5">
                          <Text className="text-[9px] text-brand">
                            Default
                          </Text>
                        </View>
                      )}
                    </View>
                    {shoe.brand ? (
                      <Text className="text-xs text-gray-400">
                        {shoe.brand}
                      </Text>
                    ) : null}
                  </View>
                  <View className="flex-row items-center gap-2">
                    {!shoe.isDefault && (
                      <TouchableOpacity
                        className="h-8 w-8 items-center justify-center rounded-lg bg-[#0F0F14]"
                        onPress={() => {
                          haptics.selection();
                          setDefault(shoe.id);
                        }}
                      >
                        <Star size={14} color="#f59e0b" />
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      className="h-8 w-8 items-center justify-center rounded-lg bg-[#0F0F14]"
                      onPress={() => {
                        haptics.selection();
                        retireShoe(shoe.id);
                      }}
                    >
                      <Archive size={14} color="#6B7280" />
                    </TouchableOpacity>
                  </View>
                </View>
                <MileageBar shoe={shoe} />
                {shoe !== activeShoes[activeShoes.length - 1] && (
                  <View className="mt-3 border-b border-[#2A2A3A]" />
                )}
              </View>
            ))
          )}
          <TouchableOpacity
            className="mt-3 flex-row items-center justify-center rounded-xl bg-brand/10 py-2.5"
            onPress={() => setShowAddShoe(true)}
          >
            <Plus size={14} color="#8b5cf6" />
            <Text className="ml-1 text-sm font-medium text-brand">
              Add Shoe
            </Text>
          </TouchableOpacity>
        </Card>

        {/* Retired Shoes */}
        {retired.length > 0 && (
          <>
            <SectionHeader title="Retired Shoes" />
            <Card className="mb-5">
              {retired.map((shoe) => (
                <View key={shoe.id} className="py-2">
                  <Text className="text-sm text-gray-500">{shoe.name}</Text>
                  <Text className="text-xs text-gray-600">
                    {Math.round(shoe.totalKm)} km logged
                  </Text>
                </View>
              ))}
            </Card>
          </>
        )}

        {/* Privacy Zones */}
        <SectionHeader title="Privacy Zones" />
        <Card className="mb-5">
          {zones.length === 0 ? (
            <Text className="py-2 text-sm text-gray-400">
              No privacy zones set
            </Text>
          ) : (
            zones.map((zone) => (
              <View
                key={zone.id}
                className="flex-row items-center justify-between border-b border-[#2A2A3A] py-2 last:border-b-0"
              >
                <View className="flex-row items-center gap-2">
                  <MapPin size={14} color="#8b5cf6" />
                  <View>
                    <Text className="text-sm text-white">{zone.name}</Text>
                    <Text className="text-xs text-gray-400">
                      {zone.radiusMeters}m radius
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    haptics.selection();
                    removeZone(zone.id);
                  }}
                >
                  <Trash2 size={14} color="#6B7280" />
                </TouchableOpacity>
              </View>
            ))
          )}
          <TouchableOpacity
            className="mt-3 flex-row items-center justify-center rounded-xl bg-brand/10 py-2.5"
            onPress={() => {
              Alert.prompt(
                "Add Privacy Zone",
                "Enter a name for this zone (uses current location)",
                async (name) => {
                  if (!name?.trim()) return;
                  haptics.success();
                  await addZone(name.trim());
                },
              );
            }}
          >
            <Plus size={14} color="#8b5cf6" />
            <Text className="ml-1 text-sm font-medium text-brand">
              Add Zone
            </Text>
          </TouchableOpacity>
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
            right={<Text className="text-sm text-gray-500">1.0.0</Text>}
          />
        </Card>
      </ScrollView>

      {/* Add Shoe Bottom Sheet */}
      {showAddShoe && (
        <BottomSheet
          ref={addShoeSheetRef}
          index={0}
          snapPoints={addShoeSnapPoints}
          onChange={(i) => {
            if (i === -1) setShowAddShoe(false);
          }}
          enablePanDownToClose
          backgroundStyle={{ backgroundColor: "#1A1A24" }}
          handleIndicatorStyle={{ backgroundColor: "#6B7280" }}
        >
          <BottomSheetView style={{ padding: 20 }}>
            <Text className="mb-4 text-lg font-bold text-white">
              Add Shoe
            </Text>
            <TextInput
              className="mb-3 h-12 rounded-xl border border-[#2A2A3A] bg-[#0F0F14] px-4 text-white"
              placeholder="Shoe name (e.g., Nike Pegasus 41)"
              placeholderTextColor="#6B7280"
              value={newShoeName}
              onChangeText={setNewShoeName}
              autoFocus
            />
            <TextInput
              className="mb-3 h-12 rounded-xl border border-[#2A2A3A] bg-[#0F0F14] px-4 text-white"
              placeholder="Brand (optional)"
              placeholderTextColor="#6B7280"
              value={newShoeBrand}
              onChangeText={setNewShoeBrand}
            />
            <TextInput
              className="mb-4 h-12 rounded-xl border border-[#2A2A3A] bg-[#0F0F14] px-4 text-white"
              placeholder="Max km (default 600)"
              placeholderTextColor="#6B7280"
              value={newShoeMax}
              onChangeText={setNewShoeMax}
              keyboardType="numeric"
            />
            <Button title="Add Shoe" onPress={handleAddShoe} />
          </BottomSheetView>
        </BottomSheet>
      )}
    </SafeAreaView>
  );
}
