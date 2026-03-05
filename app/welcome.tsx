import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";
import { Button } from "@/components/Button";
import { Dumbbell, Route, Zap } from "lucide-react-native";

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 items-center justify-center px-8">
        {/* Logo */}
        <Animated.View
          entering={FadeIn.duration(600)}
          className="mb-6 h-24 w-24 items-center justify-center rounded-3xl bg-brand/20"
        >
          <Zap size={48} color="#8b5cf6" />
        </Animated.View>

        <Animated.Text
          entering={FadeInDown.delay(200).duration(500)}
          className="mb-2 text-4xl font-bold text-white"
        >
          Maiin
        </Animated.Text>
        <Animated.Text
          entering={FadeInDown.delay(350).duration(500)}
          className="mb-10 text-center text-base text-gray-400"
        >
          Train smarter as a hybrid athlete.{"\n"}Lift heavy. Run far. Track
          everything.
        </Animated.Text>

        {/* Feature highlights */}
        <Animated.View
          entering={FadeInDown.delay(500).duration(500)}
          className="mb-10 w-full"
        >
          <FeatureRow
            icon={<Dumbbell size={20} color="#8b5cf6" />}
            title="Log Workouts"
            subtitle="Track every set, rep, and weight"
            color="brand"
          />
          <FeatureRow
            icon={<Route size={20} color="#FF6B6B" />}
            title="GPS Runs"
            subtitle="Real-time pace, distance, and route"
            color="running"
          />
          <FeatureRow
            icon={<Zap size={20} color="#2dd4bf" />}
            title="Stay Balanced"
            subtitle="Weekly stats and streak tracking"
            color="teal"
          />
        </Animated.View>

        {/* CTAs */}
        <Animated.View
          entering={FadeInDown.delay(700).duration(500)}
          className="w-full"
        >
          <Button
            title="Create Account"
            onPress={() => router.replace("/sign-in")}
          />
          <Button
            title="I Already Have an Account"
            variant="outline"
            className="mt-3"
            onPress={() => router.replace("/sign-in")}
          />
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

function FeatureRow({
  icon,
  title,
  subtitle,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  color: string;
}) {
  return (
    <View className="mb-4 flex-row items-center">
      <View
        className={`mr-4 h-11 w-11 items-center justify-center rounded-xl bg-${color}/20`}
      >
        {icon}
      </View>
      <View className="flex-1">
        <Text className="text-sm font-semibold text-white">{title}</Text>
        <Text className="text-xs text-gray-400">{subtitle}</Text>
      </View>
    </View>
  );
}
