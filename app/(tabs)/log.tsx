import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LogScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-3xl font-bold text-brand">Log</Text>
        <Text className="mt-2 text-base text-gray-400">
          Track your lifts & workouts
        </Text>
      </View>
    </SafeAreaView>
  );
}
