import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/Button";

export default function SignInScreen() {
  const { signIn, signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      if (isSignUp) {
        await signUp(email.trim(), password);
      } else {
        await signIn(email.trim(), password);
      }
    } catch (err: any) {
      Alert.alert("Error", err.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        className="flex-1 justify-center px-6"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Text className="text-center text-4xl font-bold text-white">
          Maiin
        </Text>
        <Text className="mt-2 text-center text-base text-gray-400">
          Hybrid athlete training
        </Text>

        <View className="mt-10">
          <TextInput
            className="mb-3 h-12 rounded-xl border border-[#2A2A3A] bg-[#1A1A24] px-4 text-white"
            placeholder="Email"
            placeholderTextColor="#6B7280"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            className="mb-4 h-12 rounded-xl border border-[#2A2A3A] bg-[#1A1A24] px-4 text-white"
            placeholder="Password"
            placeholderTextColor="#6B7280"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <Button
            title={isSignUp ? "Create Account" : "Sign In"}
            loading={loading}
            onPress={handleSubmit}
          />

          <Button
            title={isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
            variant="outline"
            className="mt-3"
            onPress={() => setIsSignUp(!isSignUp)}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
