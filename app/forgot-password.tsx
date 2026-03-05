import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/Button";
import { ArrowLeft, Mail } from "lucide-react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleReset() {
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email address");
      return;
    }
    setLoading(true);
    try {
      await resetPassword(email.trim());
      setSent(true);
    } catch (err: any) {
      Alert.alert("Error", err.message ?? "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        className="flex-1 px-6"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Back button */}
        <TouchableOpacity
          className="mt-2 h-10 w-10 items-center justify-center rounded-full bg-[#1A1A24]"
          onPress={() => router.back()}
        >
          <ArrowLeft size={20} color="#fff" />
        </TouchableOpacity>

        <View className="flex-1 justify-center">
          {sent ? (
            <Animated.View entering={FadeInDown.duration(400)} className="items-center">
              <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-[#1A1A24]">
                <Mail size={28} color="#8b5cf6" />
              </View>
              <Text className="text-center text-2xl font-bold text-white">
                Check your email
              </Text>
              <Text className="mt-3 text-center text-base text-gray-400">
                We sent a password reset link to{"\n"}
                <Text className="text-white">{email}</Text>
              </Text>
              <Button
                title="Back to Sign In"
                variant="outline"
                className="mt-8"
                onPress={() => router.back()}
              />
            </Animated.View>
          ) : (
            <Animated.View entering={FadeInDown.duration(400)}>
              <Text className="text-2xl font-bold text-white">
                Reset Password
              </Text>
              <Text className="mt-2 text-base text-gray-400">
                Enter the email associated with your account and we'll send a reset link.
              </Text>

              <TextInput
                className="mt-6 h-12 rounded-xl border border-[#2A2A3A] bg-[#1A1A24] px-4 text-white"
                placeholder="Email"
                placeholderTextColor="#6B7280"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />

              <Button
                title="Send Reset Link"
                loading={loading}
                className="mt-4"
                onPress={handleReset}
              />
            </Animated.View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
