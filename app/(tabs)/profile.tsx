import {
  View,
  Text,
  ScrollView,
  Alert,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "@/lib/auth-context";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { SectionHeader } from "@/components/SectionHeader";
import { StatBadge } from "@/components/StatBadge";
import { Skeleton, SkeletonStatRow } from "@/components/Skeleton";
import { WeeklyChart } from "@/components/WeeklyChart";
import { BodyWeightChart } from "@/components/BodyWeightChart";
import { CalendarHeatmap } from "@/components/CalendarHeatmap";
import { AchievementGrid } from "@/components/AchievementGrid";
import { useProfile } from "@/hooks/useProfile";
import { useWorkouts } from "@/hooks/useWorkouts";
import { useRuns } from "@/hooks/useRuns";
import { usePersonalRecords } from "@/hooks/usePersonalRecords";
import { computeAchievements } from "@/lib/achievements";
import { User, Award, Calendar, Settings, Pencil } from "lucide-react-native";

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const { profile, loading } = useProfile();
  const { workouts } = useWorkouts(50);
  const { runs } = useRuns(50);
  const { records } = usePersonalRecords();
  const achievements = computeAchievements(profile, records);

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
      <SafeAreaView className="flex-1 bg-background">
        <View className="px-5 pt-4">
          <View className="mb-6 items-center">
            <Skeleton width={80} height={80} borderRadius={40} className="mb-3" />
            <Skeleton width={120} height={16} className="mb-2" />
            <Skeleton width={160} height={12} />
          </View>
          <SkeletonStatRow />
          <SkeletonStatRow />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="mb-6 mt-2 flex-row items-center justify-between">
          <Text className="text-2xl font-bold text-white">Profile</Text>
          <TouchableOpacity onPress={() => router.push("/settings")}>
            <Settings size={22} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Avatar + Info */}
        <TouchableOpacity
          className="mb-6 items-center"
          onPress={() => router.push("/edit-profile")}
          activeOpacity={0.7}
        >
          <View className="mb-3">
            <View className="h-20 w-20 items-center justify-center rounded-full bg-brand/20">
              <User size={36} color="#8b5cf6" />
            </View>
            <View className="absolute -bottom-1 -right-1 h-7 w-7 items-center justify-center rounded-full bg-brand">
              <Pencil size={12} color="#fff" />
            </View>
          </View>
          <Text className="text-lg font-bold text-white">
            {profile?.displayName || "Hybrid Athlete"}
          </Text>
          <Text className="text-sm text-gray-400">
            {user?.email ?? "Not signed in"}
          </Text>
        </TouchableOpacity>

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

        {/* Activity Calendar */}
        <SectionHeader title="Activity" />
        <Card className="mb-5">
          <CalendarHeatmap workouts={workouts} runs={runs} />
        </Card>

        {/* Body Weight */}
        <SectionHeader title="Body Weight" />
        <Card className="mb-5">
          <BodyWeightChart />
        </Card>

        {/* Achievements */}
        <SectionHeader
          title="Achievements"
          action={`${achievements.filter((a) => a.unlocked).length}/${achievements.length}`}
        />
        <View className="mb-5">
          <AchievementGrid achievements={achievements} />
        </View>

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
