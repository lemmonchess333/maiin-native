import { View, Text, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/lib/auth-context";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { SectionHeader } from "@/components/SectionHeader";
import { StatBadge } from "@/components/StatBadge";
import { User, Award, Calendar, Settings } from "lucide-react-native";

export default function ProfileScreen() {
  const { user, signOut } = useAuth();

  function handleSignOut() {
    Alert.alert("Sign Out", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: () => signOut(),
      },
    ]);
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="mb-6 mt-2 flex-row items-center justify-between">
          <Text className="text-2xl font-bold text-white">Profile</Text>
          <Settings size={22} color="#6B7280" />
        </View>

        {/* Avatar + Info */}
        <View className="mb-6 items-center">
          <View className="mb-3 h-20 w-20 items-center justify-center rounded-full bg-brand/20">
            <User size={36} color="#8b5cf6" />
          </View>
          <Text className="text-lg font-bold text-white">
            {user?.displayName ?? "Hybrid Athlete"}
          </Text>
          <Text className="text-sm text-gray-400">
            {user?.email ?? "Not signed in"}
          </Text>
        </View>

        {/* All-time Stats */}
        <SectionHeader title="All-Time Stats" />
        <Card className="mb-5 flex-row justify-around">
          <StatBadge label="Workouts" value="127" color="brand" />
          <StatBadge label="Miles" value="284" color="running" />
          <StatBadge label="Max Streak" value="21d" color="success" />
        </Card>

        {/* Achievements */}
        <SectionHeader title="Achievements" />
        <Card className="mb-5">
          <View className="flex-row items-center">
            <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-warning/20">
              <Award size={20} color="#f59e0b" />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-semibold text-white">
                Century Club
              </Text>
              <Text className="text-xs text-gray-400">
                Logged 100+ workouts
              </Text>
            </View>
          </View>
        </Card>

        {/* Account */}
        <SectionHeader title="Account" />
        <Card className="mb-4">
          <View className="flex-row items-center">
            <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-teal/20">
              <Calendar size={18} color="#2dd4bf" />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-semibold text-white">
                Member since
              </Text>
              <Text className="text-xs text-gray-400">
                {user?.metadata?.creationTime
                  ? new Date(user.metadata.creationTime).toLocaleDateString()
                  : "—"}
              </Text>
            </View>
          </View>
        </Card>

        <Button
          title="Sign Out"
          variant="outline"
          className="mb-8"
          onPress={handleSignOut}
        />

        <View className="h-4" />
      </ScrollView>
    </SafeAreaView>
  );
}
