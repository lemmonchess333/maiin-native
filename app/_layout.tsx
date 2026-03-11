import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import "../global.css";

import { AuthProvider } from "@/lib/auth-context";
import { useAuthGate } from "@/hooks/useAuthGate";
import { ErrorScreen } from "@/components/ErrorScreen";
import { EmailVerificationBanner } from "@/components/EmailVerificationBanner";
import { NetworkBanner } from "@/components/NetworkBanner";

export function ErrorBoundary({ error, retry }: { error: Error; retry: () => void }) {
  return <ErrorScreen error={error} retry={retry} />;
}

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

SplashScreen.preventAutoHideAsync();

function RootNav() {
  useAuthGate();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#0F0F14" },
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="sign-in" options={{ animationTypeForReplace: "pop" }} />
      <Stack.Screen name="welcome" options={{ animationTypeForReplace: "pop" }} />
      <Stack.Screen name="history" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="edit-profile" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="workout-session" options={{ gestureEnabled: false }} />
      <Stack.Screen name="privacy-policy" />
      <Stack.Screen name="terms" />
      <Stack.Screen name="run-detail" />
      <Stack.Screen name="training-calendar" />
      <Stack.Screen name="modal" options={{ presentation: "modal" }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <StatusBar style="light" />
      <NetworkBanner />
      <EmailVerificationBanner />
      <RootNav />
    </AuthProvider>
  );
}
