import { useState } from "react";
import { View, Text, TextInput, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { TouchableOpacity } from "react-native";
import { Button } from "@/components/Button";
import { useProfile } from "@/hooks/useProfile";
import * as haptics from "@/lib/haptics";
import { ArrowLeft, User } from "lucide-react-native";

export default function EditProfileScreen() {
  const router = useRouter();
  const { profile, updateProfile } = useProfile();
  const [displayName, setDisplayName] = useState(
    profile?.displayName ?? "",
  );
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await updateProfile({ displayName: displayName.trim() });
      haptics.success();
      Alert.alert("Saved", "Profile updated!");
      router.back();
    } catch (err: any) {
      haptics.warning();
      Alert.alert("Error", err.message ?? "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-5">
        {/* Header */}
        <View className="mb-6 mt-2 flex-row items-center">
          <TouchableOpacity
            className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-[#1A1A24]"
            onPress={() => router.back()}
          >
            <ArrowLeft size={20} color="#fff" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-white">Edit Profile</Text>
        </View>

        {/* Avatar */}
        <View className="mb-6 items-center">
          <View className="h-20 w-20 items-center justify-center rounded-full bg-brand/20">
            <User size={36} color="#8b5cf6" />
          </View>
        </View>

        {/* Fields */}
        <Text className="mb-2 text-sm font-medium text-gray-400">
          Display Name
        </Text>
        <TextInput
          className="mb-6 h-12 rounded-xl border border-[#2A2A3A] bg-[#1A1A24] px-4 text-white"
          placeholder="Your name"
          placeholderTextColor="#6B7280"
          value={displayName}
          onChangeText={setDisplayName}
          autoFocus
        />

        <Button title="Save Changes" loading={saving} onPress={handleSave} />
      </View>
    </SafeAreaView>
  );
}
