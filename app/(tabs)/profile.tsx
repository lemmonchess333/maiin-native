import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/lib/auth-context";

export default function ProfileScreen() {
  const { user } = useAuth();

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-3xl font-bold text-white">Profile</Text>
        <Text className="mt-2 text-base text-gray-400">
          {user ? user.email : "Not signed in"}
        </Text>
      </View>
    </SafeAreaView>
  );
}
