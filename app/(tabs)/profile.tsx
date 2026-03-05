import { View, Text, ScrollView, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/lib/auth-context";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { SectionHeader } from "@/components/SectionHeader";
import { StatBadge } from "@/components/StatBadge";
import { WeeklyChart } from "@/components/WeeklyChart";
import { useProfile } from "@/hooks/useProfile";
import { useWorkouts } from "@/hooks/useWorkouts";
import { useRuns } from "@/hooks/useRuns";
import { User, Award, Calendar, Settings } from "lucide-react-native";

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { profile, loading } = useProfile();
  const { workouts } = useWorkouts(50);
  const { runs } = useRuns(50);

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

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color="#8b5cf6" />
      </SafeAreaView>
    );
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
            {profile?.displayName || "Hybrid Athlete"}
          </Text>
          <Text className="text-sm text-gray-400">
            {user?.email ?? "Not signed in"}
          </Text>
        </View>

        {/* All-time Stats */}
        <SectionHeader title="All-Time Stats" />
        <Card className="mb-5 flex-row justify-around">
          <StatBadge
            label="Workouts"
            value={String(profile?.totalWorkouts ?? 0)}
            color="brand"
          />
          <StatBadge
            label="Miles"
            value={String(Math.round(profile?.totalMiles ?? 0))}
            color="running"
          />
          <StatBadge
            label="Max Streak"
            value={`${profile?.longestStreak ?? 0}d`}
            color="success"
          />
        </Card>

        {/* Weekly Chart */}
        <SectionHeader title="This Week" />
        <Card className="mb-5">
          <WeeklyChart workouts={workouts} runs={runs} />
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
                {(profile?.totalWorkouts ?? 0) >= 100
                  ? "Century Club"
                  : "Getting Started"}
              </Text>
              <Text className="text-xs text-gray-400">
                {(profile?.totalWorkouts ?? 0) >= 100
                  ? "Logged 100+ workouts"
                  : `${profile?.totalWorkouts ?? 0}/100 workouts`}
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
                {profile?.createdAt
                  ? profile.createdAt.toDate().toLocaleDateString()
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
