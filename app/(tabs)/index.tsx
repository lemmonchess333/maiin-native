import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/lib/auth-context";
import { Card } from "@/components/Card";
import { SectionHeader } from "@/components/SectionHeader";
import { StatBadge } from "@/components/StatBadge";
import { Dumbbell, Route, TrendingUp } from "lucide-react-native";

export default function HomeScreen() {
  const { user } = useAuth();

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="mb-6 mt-2">
          <Text className="text-base text-gray-400">{today}</Text>
          <Text className="mt-1 text-2xl font-bold text-white">
            Welcome back{user?.displayName ? `, ${user.displayName}` : ""}
          </Text>
        </View>

        {/* Weekly Stats */}
        <SectionHeader title="This Week" />
        <Card className="mb-5 flex-row justify-around">
          <StatBadge label="Workouts" value="4" color="brand" />
          <StatBadge label="Miles" value="12.3" color="running" />
          <StatBadge label="Calories" value="2,840" color="warning" />
          <StatBadge label="Streak" value="6d" color="success" />
        </Card>

        {/* Quick Actions */}
        <SectionHeader title="Quick Start" />
        <View className="mb-5 flex-row gap-3">
          <TouchableOpacity className="flex-1 items-center rounded-2xl bg-brand/20 py-5">
            <Dumbbell size={28} color="#8b5cf6" />
            <Text className="mt-2 text-sm font-semibold text-brand">
              Log Lift
            </Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-1 items-center rounded-2xl bg-running/20 py-5">
            <Route size={28} color="#FF6B6B" />
            <Text className="mt-2 text-sm font-semibold text-running">
              Start Run
            </Text>
          </TouchableOpacity>
        </View>

        {/* Recent Activity */}
        <SectionHeader title="Recent Activity" action="View All" />

        <Card className="mb-3">
          <View className="flex-row items-center">
            <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-brand/20">
              <Dumbbell size={18} color="#8b5cf6" />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-semibold text-white">
                Upper Body Push
              </Text>
              <Text className="text-xs text-gray-400">
                Bench, OHP, Triceps — 52 min
              </Text>
            </View>
            <Text className="text-xs text-gray-500">Today</Text>
          </View>
        </Card>

        <Card className="mb-3">
          <View className="flex-row items-center">
            <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-running/20">
              <Route size={18} color="#FF6B6B" />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-semibold text-white">
                Easy Run
              </Text>
              <Text className="text-xs text-gray-400">
                3.1 mi — 28:42 — 9:15/mi
              </Text>
            </View>
            <Text className="text-xs text-gray-500">Yesterday</Text>
          </View>
        </Card>

        <Card className="mb-3">
          <View className="flex-row items-center">
            <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-brand/20">
              <Dumbbell size={18} color="#8b5cf6" />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-semibold text-white">
                Lower Body
              </Text>
              <Text className="text-xs text-gray-400">
                Squat, RDL, Lunges — 48 min
              </Text>
            </View>
            <Text className="text-xs text-gray-500">2d ago</Text>
          </View>
        </Card>

        {/* Training Load */}
        <SectionHeader title="Training Load" />
        <Card className="mb-8">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <TrendingUp size={18} color="#34d399" />
              <Text className="ml-2 text-sm font-medium text-white">
                Balanced
              </Text>
            </View>
            <Text className="text-xs text-gray-400">
              60% lifting · 40% running
            </Text>
          </View>
          <View className="mt-3 h-2 flex-row overflow-hidden rounded-full">
            <View className="w-[60%] bg-brand" />
            <View className="w-[40%] bg-running" />
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
