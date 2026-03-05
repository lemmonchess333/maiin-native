import { useState } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { useAuth } from "@/lib/auth-context";
import { Mail, X } from "lucide-react-native";

export function EmailVerificationBanner() {
  const { user, verifyEmail } = useAuth();
  const [dismissed, setDismissed] = useState(false);
  const [sending, setSending] = useState(false);

  if (!user || user.emailVerified || dismissed) return null;

  async function handleResend() {
    setSending(true);
    try {
      await verifyEmail();
      Alert.alert("Sent", "Verification email sent. Check your inbox.");
    } catch {
      Alert.alert("Error", "Failed to send verification email.");
    } finally {
      setSending(false);
    }
  }

  return (
    <View className="mx-5 mb-3 flex-row items-center rounded-xl bg-warning/10 px-4 py-3">
      <Mail size={16} color="#f59e0b" />
      <Text className="ml-2 flex-1 text-xs text-warning">
        Verify your email.{" "}
        <Text
          className="font-semibold underline"
          onPress={handleResend}
          disabled={sending}
        >
          {sending ? "Sending…" : "Resend"}
        </Text>
      </Text>
      <TouchableOpacity onPress={() => setDismissed(true)}>
        <X size={14} color="#f59e0b" />
      </TouchableOpacity>
    </View>
  );
}
