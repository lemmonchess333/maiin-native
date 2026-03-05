import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/components/Button";
import { AlertTriangle } from "lucide-react-native";

interface ErrorScreenProps {
  error: Error;
  retry: () => void;
}

export function ErrorScreen({ error, retry }: ErrorScreenProps) {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 items-center justify-center px-8">
        <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-running/20">
          <AlertTriangle size={32} color="#FF6B6B" />
        </View>
        <Text className="mb-2 text-xl font-bold text-white">
          Something went wrong
        </Text>
        <Text className="mb-6 text-center text-sm text-gray-400">
          {error.message || "An unexpected error occurred."}
        </Text>
        <Button title="Try Again" onPress={retry} />
      </View>
    </SafeAreaView>
  );
}
